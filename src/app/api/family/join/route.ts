import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-server";

export async function POST(request: Request) {
  const decodedToken = await verifyToken();
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await request.json();
  const uid = decodedToken.uid;

  try {
    const familyQuery = await adminDb.collection("families")
      .where("code", "==", code.toUpperCase())
      .limit(1)
      .get();

    if (familyQuery.empty) {
      return NextResponse.json({ error: "Семья с таким кодом не найдена" }, { status: 404 });
    }

    const familyDoc = familyQuery.docs[0];
    const familyData = familyDoc.data();
    const familyId = familyDoc.id;

    if (familyData.memberIds.length >= 2) {
      return NextResponse.json({ error: "В семье уже максимум участников" }, { status: 400 });
    }

    if (familyData.memberIds.includes(uid)) {
      return NextResponse.json({ error: "Вы уже в этой семье" }, { status: 400 });
    }

    const partnerId = familyData.memberIds[0];

    const batch = adminDb.batch();

    // Update family members
    batch.update(familyDoc.ref, {
      memberIds: [...familyData.memberIds, uid]
    });

    // Update current user
    const userRef = adminDb.collection("users").doc(uid);
    batch.update(userRef, {
      familyId,
      partnerId: partnerId
    });

    // Update partner's partnerId
    const partnerRef = adminDb.collection("users").doc(partnerId);
    batch.update(partnerRef, {
      partnerId: uid
    });

    await batch.commit();

    return NextResponse.json({ status: "success", familyId });
  } catch (error) {
    console.error("Join family error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
