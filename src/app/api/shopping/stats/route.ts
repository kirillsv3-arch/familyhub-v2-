import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const itemName = searchParams.get("name");
  const store = searchParams.get("store");

  try {
    let query = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("price_history") as admin.firestore.Query;

    if (itemName) {
      query = query.where("name", "==", itemName);
    }

    if (store) {
      query = query.where("store", "==", store);
    }

    const snapshot = await query.orderBy("date", "desc").get();
    const history = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() ? data.date.toDate().toISOString() : data.date
      };
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
