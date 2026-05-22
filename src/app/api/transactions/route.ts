import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { Transaction } from "@/types";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number(),
  category: z.string(),
  description: z.string(),
  type: z.enum(['expense', 'income']),
});

export async function POST(request: Request) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = transactionSchema.parse(body);

    const newTransaction: Omit<Transaction, 'id'> = {
      ...validated,
      date: FieldValue.serverTimestamp() as any,
      userId: user.uid,
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("transactions")
      .add(newTransaction);

    return NextResponse.json({ id: docRef.id, ...newTransaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
