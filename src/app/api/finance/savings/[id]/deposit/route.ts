import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const goalId = params.id;
    const goalRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("savings")
      .doc(goalId);

    await goalRef.update({
      currentAmount: FieldValue.increment(amount),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Deposit to saving goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
