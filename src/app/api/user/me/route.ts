import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let partner = null;
    if (user.familyId) {
      const familyDoc = await adminDb.collection("families").doc(user.familyId).get();
      const memberIds = familyDoc.data()?.memberIds || [];
      const partnerId = memberIds.find((id: string) => id !== user.uid);

      if (partnerId) {
        const partnerDoc = await adminDb.collection("users").doc(partnerId).get();
        if (partnerDoc.exists) {
          partner = { uid: partnerDoc.id, ...partnerDoc.data() };
        }
      }
    }

    return NextResponse.json({ user, partner });
  } catch (error) {
    console.error("Get current user/partner error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
