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
      .collection("events")
      .get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Fetch finance events error:", error);
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
    const { type, category, name, amount, dateType, dateValue, recurring, userId, reminderEnabled, reminderDaysBefore } = data;

    if (!type || !name || !dateType || !dateValue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newEvent = {
      type,
      category: category || null,
      name,
      amount: amount || null,
      dateType,
      dateValue,
      recurring: !!recurring,
      userId: userId || 'family',
      reminderEnabled: !!reminderEnabled,
      reminderDaysBefore: reminderDaysBefore || 2,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("events")
      .add(newEvent);

    return NextResponse.json({ id: docRef.id, ...newEvent });
  } catch (error) {
    console.error("Create finance event error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
