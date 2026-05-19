import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { ShoppingItem } from "@/types";
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
      .collection("shopping")
      .where("archived", "==", false)
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ShoppingItem[];

    return NextResponse.json(items);
  } catch (error) {
    console.error("Fetch shopping items error:", error);
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
    const { name, quantity, store, isMarketplace, link } = data;

    if (!name || !store) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newItem = {
      name,
      quantity: quantity || null,
      store,
      isMarketplace: !!isMarketplace,
      link: link || null,
      isBought: false,
      addedBy: user.uid,
      archived: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("shopping")
      .add(newItem);

    return NextResponse.json({ id: docRef.id, ...newItem });
  } catch (error) {
    console.error("Create shopping item error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
