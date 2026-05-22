import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { SavingGoal } from "@/types";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const savingGoalSchema = z.object({
  title: z.string().min(1),
  targetAmount: z.number().min(0),
  desiredDate: z.string().optional(),
  wishId: z.string().optional(),
});

export async function POST(request: Request) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = savingGoalSchema.parse(body);

    const newGoal: Omit<SavingGoal, 'id'> = {
      title: validated.title,
      targetAmount: validated.targetAmount,
      currentAmount: 0,
      desiredDate: validated.desiredDate,
      createdAt: FieldValue.serverTimestamp() as any,
      createdBy: user.uid,
    };

    const goalRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("saving_goals")
      .add(newGoal);

    if (validated.wishId) {
        await adminDb
          .collection("families")
          .doc(user.familyId)
          .collection("wishlist")
          .doc(validated.wishId)
          .update({ linkedSavingGoalId: goalRef.id });
    }

    return NextResponse.json({ id: goalRef.id, ...newGoal });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create saving goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
    const { user } = await getUserWithFamily();
    if (!user || !user.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const snapshot = await adminDb
        .collection("families")
        .doc(user.familyId)
        .collection("saving_goals")
        .orderBy("createdAt", "desc")
        .get();

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavingGoal[];

      return NextResponse.json(items);
    } catch (error) {
      console.error("Fetch saving goals error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
