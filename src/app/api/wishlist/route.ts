import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { WishlistItem } from "@/types";
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
      .collection("wishlists")
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WishlistItem[];

    return NextResponse.json(items);
  } catch (error) {
    console.error("Fetch wishlist error:", error);
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
    const { name, link, price, priority } = data;

    if (!name || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newItem = {
      name,
      link: link || null,
      price: typeof price === 'number' ? price : null,
      priority,
      ownerId: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("wishlists")
      .add(newItem);

    return NextResponse.json({
      id: docRef.id,
      ...newItem,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Create wishlist item error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
