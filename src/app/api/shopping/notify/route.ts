import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import * as admin from "firebase-admin";

export async function POST() {
  const { user } = await getUserWithFamily();
  if (!user || !user.partnerId) {
    return NextResponse.json({ error: "No partner to notify" }, { status: 400 });
  }

  try {
    const partnerDoc = await adminDb.collection("users").doc(user.partnerId).get();
    if (!partnerDoc.exists) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const partnerData = partnerDoc.data();
    const fcmToken = partnerData?.fcmToken;

    if (!fcmToken) {
      return NextResponse.json({ error: "Partner has no FCM token" }, { status: 404 });
    }

    const message = {
      notification: {
        title: "Партнер в магазине",
        body: `${user.name} в магазине, дописывай, что нужно!`,
      },
      token: fcmToken,
    };

    await admin.messaging().send(message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
