import { adminDb, adminMessaging } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { FinanceEvent, User } from "@/types";
import * as admin from "firebase-admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    // Add 2 days to today
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 2);

    const dayOfMonth = targetDate.getDate();
    const dayOfWeek = targetDate.getDay();

    // Reset logic: if it's the 1st of the month, reset notificationSent flag for all monthly events
    if (today.getDate() === 1) {
      const allFamilies = await adminDb.collection("families").get();
      for (const familyDoc of allFamilies.docs) {
        const eventsSnapshot = await adminDb
          .collection(`families/${familyDoc.id}/finance/data/events`)
          .where("repeatMonthly", "==", true)
          .get();

        const batch = adminDb.batch();
        eventsSnapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { notificationSent: false });
        });
        await batch.commit();
      }
    }

    const familiesSnapshot = await adminDb.collection("families").get();

    for (const familyDoc of familiesSnapshot.docs) {
      const familyId = familyDoc.id;
      const eventsRef = adminDb.collection(`families/${familyId}/finance/data/events`);

      // Find events that happen in 2 days and haven't sent a notification
      const eventsSnapshot = await eventsRef
        .where("notificationSent", "==", false)
        .where("active", "==", true)
        .get();

      const eventsToNotify = eventsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as FinanceEvent))
        .filter(event => {
          if (event.dateType === 'dayOfMonth') {
            return event.dateValue === dayOfMonth;
          } else {
            return event.dateValue === dayOfWeek;
          }
        });

      if (eventsToNotify.length > 0) {
        // Get all family members to send notifications
        const familyData = familyDoc.data();
        const memberIds = familyData.memberIds || [];

        const fcmTokens: string[] = [];
        for (const uid of memberIds) {
          const userDoc = await adminDb.collection("users").doc(uid).get();
          const userData = userDoc.data() as User;
          if (userData?.fcmToken) {
            fcmTokens.push(userData.fcmToken);
          }
        }

        if (fcmTokens.length > 0) {
          for (const event of eventsToNotify) {
            const message: admin.messaging.MulticastMessage = {
              notification: {
                title: "Финансовое напоминание",
                body: `Послезавтра: ${event.title}, ${event.amount} ₽`,
              },
              tokens: fcmTokens,
            };

            if (event.type === 'subscription') {
              message.data = {
                action: 'cancel_subscription',
                eventId: event.id,
                familyId: familyId,
              };
              // Note: Native buttons are platform specific (web/ios/android).
              // For FCM on web, we use 'actions' in 'webpush' config.
              message.webpush = {
                notification: {
                  actions: [
                    {
                      action: 'cancel',
                      title: 'Больше не нужна',
                      icon: '/icons/cancel.png'
                    }
                  ]
                }
              };
            }

            try {
              await adminMessaging.sendEachForMulticast(message);
              // Mark as sent
              await eventsRef.doc(event.id).update({ notificationSent: true });
            } catch (error) {
              console.error(`Error sending notification for event ${event.id}:`, error);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cron notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
