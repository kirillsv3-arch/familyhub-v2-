import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const itemRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("wishlists")
      .doc(params.id);

    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (itemDoc.data()?.ownerId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    const { name, link, price, priority } = data;

    const updates: Record<string, string | number | null> = {};
    if (name) updates.name = name;
    if (link !== undefined) updates.link = link;
    if (price !== undefined) updates.price = price;
    if (priority) updates.priority = priority;

    await itemRef.update(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update wishlist item error:", error);
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
    const itemRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("wishlists")
      .doc(params.id);

    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ success: true }); // Already gone
    }

    if (itemDoc.data()?.ownerId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await itemRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wishlist item error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
