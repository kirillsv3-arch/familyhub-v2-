import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_USER_GOALS } from "@/types";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { idToken, name, email } = await request.json();

    // Verify ID Token to get UID
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        name,
        email,
        familyId: null,
        partnerId: null,
        ...DEFAULT_USER_GOALS,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
