import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { WishlistItem } from "@/types";
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

const wishSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["material", "non-material"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().optional().nullable(),
  link: z.string().url().optional().or(z.literal("")),
  note: z.string().optional(),
});

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("wishlist")
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WishlistItem[];

    return NextResponse.json(serializeData(items));
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
    const body = await request.json();
    const validated = wishSchema.parse(body);

    if (validated.type === 'material' && (validated.price === undefined || validated.price === null)) {
        return NextResponse.json({ error: "Price is required for material wishes" }, { status: 400 });
    }

    const newItem: Omit<WishlistItem, 'id'> = {
      authorId: user.uid,
      title: validated.title,
      type: validated.type,
      imageUrl: validated.imageUrl || undefined,
      price: validated.type === 'material' ? (validated.price ?? 0) : undefined,
      link: validated.link || undefined,
      note: validated.note || undefined,
      isCompleted: false,
      createdAt: FieldValue.serverTimestamp() as any,
      reservedBy: null,
      reservedAt: null,
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("wishlist")
      .add(newItem);

    return NextResponse.json({ id: docRef.id, ...newItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create wishlist item error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
