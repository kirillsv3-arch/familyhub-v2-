import { adminDb } from "@/lib/firebase-admin";
import { INITIAL_TAMAGOTCHI } from "@/types";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-server";

export async function POST() {
  const decodedToken = await verifyToken();
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = decodedToken.uid;
  const familyId = adminDb.collection("families").doc().id;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const familyData = {
    code,
    memberIds: [uid],
    createdAt: new Date(),
    coins: 0,
    tamagotchi: {
      ...INITIAL_TAMAGOTCHI,
      lastChecked: new Date(),
    },
  };

  try {
    const batch = adminDb.batch();

    const familyRef = adminDb.collection("families").doc(familyId);
    batch.set(familyRef, familyData);

    const userRef = adminDb.collection("users").doc(uid);
    batch.update(userRef, { familyId });

    await batch.commit();

    return NextResponse.json({ familyId, code });
  } catch (error) {
    console.error("Create family error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
