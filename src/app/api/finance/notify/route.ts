import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import * as admin from "firebase-admin";

export async function POST(request: Request) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, body } = await request.json();

    // Notify all family members
    const familyDoc = await adminDb.collection("families").doc(user.familyId).get();
    const memberIds = familyDoc.data()?.memberIds || [];

    const tokens: string[] = [];
    for (const memberId of memberIds) {
      const memberDoc = await adminDb.collection("users").doc(memberId).get();
      const fcmToken = memberDoc.data()?.fcmToken;
      if (fcmToken) tokens.push(fcmToken);
    }

    if (tokens.length === 0) {
      return NextResponse.json({ error: "No FCM tokens found" }, { status: 404 });
    }

    const messages = tokens.map(token => ({
      notification: { title, body },
      token,
    }));

    // Send messages
    await Promise.all(messages.map(m => admin.messaging().send(m)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Finance notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
