import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { FinanceEvent } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const eventsSnapshot = await adminDb
    .collection(`families/${user.familyId}/finance/data/events`)
    .get();

  const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, type, amount, dateType, dateValue, repeatMonthly } = body;

  const newEvent: Omit<FinanceEvent, 'id'> = {
    title,
    type,
    amount: type === 'purchase' ? 0 : Number(amount),
    dateType,
    dateValue: Number(dateValue),
    repeatMonthly,
    isCompleted: false,
    notificationSent: false,
    active: true,
    userId: user.uid,
    createdAt: FieldValue.serverTimestamp() as unknown as string,
  };

  const docRef = await adminDb
    .collection(`families/${user.familyId}/finance/data/events`)
    .add(newEvent);

  return NextResponse.json({ id: docRef.id, ...newEvent });
}

export async function PATCH(req: NextRequest) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, isCompleted, completedAmount, notificationSent } = body;

  const eventRef = adminDb
    .collection(`families/${user.familyId}/finance/data/events`)
    .doc(id);

  const updateData: Partial<FinanceEvent> = {};
  if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
  if (completedAmount !== undefined) updateData.completedAmount = Number(completedAmount);
  if (notificationSent !== undefined) updateData.notificationSent = notificationSent;

  await eventRef.update(updateData);

  // If it's a regular event (not purchase) being completed/paid
  const eventDoc = await eventRef.get();
  const eventData = eventDoc.data() as FinanceEvent;

  if (isCompleted && eventData.type !== 'purchase') {
    // Record in history
    await adminDb.collection(`families/${user.familyId}/finance/data/history`).add({
      eventId: id,
      amount: eventData.amount,
      date: FieldValue.serverTimestamp(),
      userId: user.uid,
    });

    // Reset notification for next month if it's recurring
    if (eventData.repeatMonthly) {
      await eventRef.update({ notificationSent: false, isCompleted: false });
    }
  }

  return NextResponse.json({ success: true });
}
