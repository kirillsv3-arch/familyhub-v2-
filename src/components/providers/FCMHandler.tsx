'use client';

import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/lib/messaging';

export function FCMHandler() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      requestForToken();
      onMessageListener().then((payload: unknown) => {
        console.log('Message received: ', payload);
        const data = payload as { notification: { title: string; body: string } };
        if (Notification.permission === 'granted' && data?.notification) {
          new Notification(data.notification.title, {
            body: data.notification.body,
          });
        }
      });
    }
  }, []);

  return null;
}
