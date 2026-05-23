import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { assigneeId, title, body } = await request.json();

    if (!assigneeId || assigneeId === user.uid) {
      return NextResponse.json({ success: true, message: "No notification needed for self" });
    }

    const partnerDoc = await adminDb.collection("users").doc(assigneeId).get();
    if (!partnerDoc.exists) {
      return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
    }

    const partnerData = partnerDoc.data();
    const fcmToken = partnerData?.fcmToken;

    // Save to history regardless of FCM token
    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("notifications")
      .add({
        title,
        body,
        type: 'task',
        userId: assigneeId,
        familyId: user.familyId,
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });

    if (fcmToken) {
      const message = {
        notification: {
          title,
          body,
        },
        token: fcmToken,
      };
      await admin.messaging().send(message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Task notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
