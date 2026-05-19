import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const itemId = params.id;

  try {
    const data = await request.json();
    const { isBought, price } = data;

    const itemRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("shopping")
      .doc(itemId);

    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const itemData = itemDoc.data();
    const updates: Record<string, string | number | boolean | FieldValue | null> = {};

    if (typeof isBought === "boolean") {
      updates.isBought = isBought;
      updates.boughtAt = isBought ? FieldValue.serverTimestamp() : null;
    }

    if (typeof price === "number") {
      updates.price = price;

      // If price is set, we also create a transaction in the budget
      const batch = adminDb.batch();
      batch.update(itemRef, updates);

      const transactionRef = adminDb
        .collection("families")
        .doc(user.familyId)
        .collection("transactions")
        .doc();

      batch.set(transactionRef, {
        amount: price,
        category: "Покупки",
        description: itemData?.name || "Покупка",
        date: FieldValue.serverTimestamp(),
        userId: user.uid,
        type: "expense",
      });

      await batch.commit();
      return NextResponse.json({ success: true });
    }

    await itemRef.update(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update shopping item error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("shopping")
      .doc(params.id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete shopping item error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
