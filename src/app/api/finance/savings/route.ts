import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
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
      .collection("finance")
      .doc("data")
      .collection("savings")
      .where("isArchived", "==", false)
      .get();

    const savings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(savings);
  } catch (error) {
    console.error("Fetch savings error:", error);
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
    const { name, targetAmount, deadline, wishlistItemId, userId } = data;

    if (!name || !targetAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newGoal = {
      name,
      targetAmount,
      currentAmount: 0,
      deadline: deadline || null,
      wishlistItemId: wishlistItemId || null,
      userId: userId || user.uid,
      isArchived: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("savings")
      .add(newGoal);

    return NextResponse.json({ id: docRef.id, ...newGoal });
  } catch (error) {
    console.error("Create saving goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
