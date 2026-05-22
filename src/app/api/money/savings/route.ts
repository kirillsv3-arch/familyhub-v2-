import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { PiggyBank } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const savingsSnapshot = await adminDb
    .collection(`families/${user.familyId}/finance/data/savings`)
    .get();

  const savings = savingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(savings);
}

export async function POST(req: NextRequest) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, targetAmount, wishlistItemId } = body;

  const newPiggyBank: Omit<PiggyBank, 'id'> = {
    title,
    targetAmount: Number(targetAmount),
    currentAmount: 0,
    contributions: [],
    wishlistItemId,
    userId: user.uid,
    createdAt: FieldValue.serverTimestamp() as unknown as string,
  };

  const docRef = await adminDb
    .collection(`families/${user.familyId}/finance/data/savings`)
    .add(newPiggyBank);

  return NextResponse.json({ id: docRef.id, ...newPiggyBank });
}

export async function PATCH(req: NextRequest) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, contributionAmount } = body;

  const piggyBankRef = adminDb
    .collection(`families/${user.familyId}/finance/data/savings`)
    .doc(id);

  const piggyBankDoc = await piggyBankRef.get();
  if (!piggyBankDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = piggyBankDoc.data() as PiggyBank;
  const newAmount = (data.currentAmount || 0) + Number(contributionAmount);

  const contribution = {
    amount: Number(contributionAmount),
    date: new Date().toISOString(),
    userId: user.uid,
  };

  await piggyBankRef.update({
    currentAmount: newAmount,
    contributions: FieldValue.arrayUnion(contribution),
  });

  // Check if target reached and update wishlist if connected
  if (newAmount >= data.targetAmount && data.wishlistItemId) {
     // For now, we assume wishlist items are in families/{familyId}/wishlists/{id}
     // Based on memory: 'families/{familyId}/wishlists'
     try {
       await adminDb.collection(`families/${user.familyId}/wishlists`).doc(data.wishlistItemId).update({
         isBought: true // Or whatever field indicates completion
       });
     } catch (e) {
       console.error("Failed to update wishlist item:", e);
     }
  }

  return NextResponse.json({ success: true, currentAmount: newAmount });
}
