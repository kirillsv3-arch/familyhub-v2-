import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { Task } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("tasks")
      .orderBy("createdAt", "desc")
      .get();

    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, description, category, date, deadline, isGeneral, assigneeId } = data;

    if (!title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask = {
      title,
      description: description || null,
      category,
      date: date || null,
      deadline: deadline || null,
      isCompleted: false,
      isGeneral: !!isGeneral,
      assigneeId: isGeneral ? null : (assigneeId || user.uid),
      createdBy: user.uid,
      familyId: user.familyId,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("tasks")
      .add(newTask);

    return NextResponse.json({ id: docRef.id, ...newTask });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
