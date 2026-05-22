import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { WishlistItem, Transaction } from "@/types";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

function serializeData<T>(data: unknown): T {
  if (!data || typeof data !== "object") return data as T;

  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  const serialized = { ...(data as Record<string, unknown>) };

  Object.keys(serialized).forEach((key) => {
    const value = serialized[key];
    if (value && typeof value === "object") {
      const potentialTimestamp = value as { toDate?: () => Date };
      if (typeof potentialTimestamp.toDate === "function") {
        serialized[key] = potentialTimestamp.toDate().toISOString();
      } else if (key === 'createdAt' || key === 'completedAt' || key === 'reservedAt') {
          // Fallback for direct serialization of Firebase Timestamps from admin-sdk
          if (value && typeof value === 'object' && '_seconds' in value) {
            serialized[key] = new Date((value as any)._seconds * 1000).toISOString();
          }
      } else {
        serialized[key] = serializeData(value);
      }
    }
  });

  return serialized as T;
}

const updateWishSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["material", "non-material"]).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().optional().nullable(),
  link: z.string().url().optional().or(z.literal("")),
  note: z.string().optional(),
  isCompleted: z.boolean().optional(),
  reservedBy: z.string().optional().nullable(),
  createTransaction: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const validated = updateWishSchema.parse(body);
    const wishRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("wishlist")
      .doc(id);

    const result = await adminDb.runTransaction(async (transaction) => {
      const wishDoc = await transaction.get(wishRef);
      if (!wishDoc.exists) {
        throw new Error("Wish not found");
      }

      const wishData = wishDoc.data() as WishlistItem;
      const isOwner = wishData.authorId === user.uid;

      // Security check: only owner can edit core fields
      if (!isOwner) {
        const allowedKeys = ['isCompleted', 'reservedBy', 'createTransaction'];
        const updateKeys = Object.keys(validated);
        const forbiddenKeys = updateKeys.filter(k => !allowedKeys.includes(k));

        if (forbiddenKeys.length > 0) {
            throw new Error("Forbidden: Only owner can edit these fields");
        }
      }

      const updates: any = { ...validated };
      delete updates.createTransaction;

      if (validated.isCompleted && !wishData.isCompleted) {
        updates.completedBy = user.uid;
        updates.completedAt = FieldValue.serverTimestamp();

        // Atomic transaction creation if requested
        if (validated.createTransaction && wishData.type === 'material' && wishData.price) {
            const transRef = adminDb
                .collection("families")
                .doc(user.familyId!)
                .collection("transactions")
                .doc();

            const newTransaction: Omit<Transaction, 'id'> = {
                amount: wishData.price,
                category: "Подарки / Вишлист",
                description: `Исполнение желания: ${wishData.title}`,
                date: FieldValue.serverTimestamp() as any,
                userId: user.uid,
                type: 'expense',
            };

            transaction.set(transRef, newTransaction);
        }
      }

      if (validated.reservedBy !== undefined) {
          if (validated.reservedBy) {
              updates.reservedAt = FieldValue.serverTimestamp();
          } else {
              updates.reservedAt = null;
          }
      }

      transaction.update(wishRef, updates);
      return { id, ...wishData, ...updates };
    });

    return NextResponse.json(serializeData(result));
  } catch (error: any) {
    console.error("Update wishlist item error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: error.message === "Wish not found" ? 404 : 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const wishRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("wishlist")
      .doc(id);

    const wishDoc = await wishRef.get();
    if (!wishDoc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (wishDoc.data()?.authorId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await wishRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wishlist item error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
