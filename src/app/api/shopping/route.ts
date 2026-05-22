import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { ShoppingItem, StoreType } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    console.error("Fetch shopping: Unauthorized or missing familyId", { userUid: user?.uid, familyId: user?.familyId });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("shopping")
      .where("archived", "==", false)
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        boughtAt: data.boughtAt?.toDate?.() ? data.boughtAt.toDate().toISOString() : data.boughtAt,
      };
    }) as ShoppingItem[];

    return NextResponse.json(items);
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; stack?: string };
    console.error("Fetch shopping items error:", {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
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
    const { name, quantity, unit, store, isMarketplace, link } = data;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: "Название товара обязательно" }, { status: 400 });
    }
    if (!store || typeof store !== 'string') {
      return NextResponse.json({ error: "Магазин обязателен" }, { status: 400 });
    }

    const newItem: Partial<ShoppingItem> & { createdAt: FieldValue } = {
      name: name.trim(),
      store: store as StoreType,
      isMarketplace: !!isMarketplace,
      isBought: false,
      addedBy: user.uid,
      archived: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (isMarketplace) {
      newItem.link = link || null;
    } else {
      newItem.quantity = typeof quantity === 'number' ? quantity : 1;
      newItem.unit = typeof unit === 'string' ? unit : 'шт';
      newItem.link = null;
    }

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("shopping")
      .add(newItem);

    return NextResponse.json({
      id: docRef.id,
      ...newItem,
      createdAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; stack?: string };
    console.error("Create shopping item error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
