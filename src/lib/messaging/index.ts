import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase";

export const requestForToken = async () => {
  try {
    const messaging = getMessaging(app);
    const status = await Notification.requestPermission();
    if (status === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      if (currentToken) {
        // Send token to server to save for user
        await fetch("/api/user/update", {
          method: "POST",
          body: JSON.stringify({ fcmToken: currentToken }),
        });
        return currentToken;
      }
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
