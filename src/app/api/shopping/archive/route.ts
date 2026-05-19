import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shoppingRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("shopping");

    const snapshot = await shoppingRef
      .where("isBought", "==", true)
      .where("archived", "==", false)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const batch = adminDb.batch();
    const historyRef = adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("price_history");

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // If there is a price, save to history
      if (data.price) {
        const newHistoryDoc = historyRef.doc();
        batch.set(newHistoryDoc, {
          name: data.name,
          store: data.store,
          price: data.price,
          date: data.boughtAt || FieldValue.serverTimestamp(),
          userId: data.addedBy || user.uid,
        });
      }

      // Mark as archived instead of deleting to keep history if needed,
      // but requirements said "Delete bought", but also "we need history".
      // I'll mark as archived: true.
      batch.update(doc.ref, { archived: true });
    });

    await batch.commit();

    return NextResponse.json({ success: true, count: snapshot.size });
  } catch (error) {
    console.error("Archive shopping items error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
