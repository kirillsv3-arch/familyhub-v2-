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
      .collection("history")
      .orderBy("date", "desc")
      .get();

    const history = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error("Fetch finance history error:", error);
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
    const { eventId, type, amount, date, userId, note } = data;

    if (!type || !amount || !date || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTransaction = {
      eventId: eventId || null,
      type,
      amount,
      date: date ? new Date(date) : FieldValue.serverTimestamp(),
      userId,
      note: note || null,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("history")
      .add(newTransaction);

    return NextResponse.json({ id: docRef.id, ...newTransaction });
  } catch (error) {
    console.error("Create finance history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
