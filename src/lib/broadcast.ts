// @ts-nocheck
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { apiEndpoint, broadcastServerURL, broadcastKey, enableBroadcastSSL } from './env';
import { getCookie } from './cookie';
import { notify } from './api';

let echoInstance: any = null;

export const initWebSockets = () => {
  if (typeof window === 'undefined') return;

  if (!window.Pusher) {
    window.Pusher = Pusher;
  }

  const token = getCookie('accessToken');
  const leoId = getCookie('leoId');

  if (!echoInstance && token) {
    try {
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: broadcastKey,
        wsHost: broadcastServerURL,
        forceTLS: enableBroadcastSSL,
        disableStats: true,
        cluster: 'mt1',
        enabledTransports: ['ws', 'wss'],
        encrypted: true,
        authEndpoint: `${apiEndpoint}broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (leoId) {
        echoInstance
          .channel(`private-push-notification-channel.${leoId}`)
          .listen('PushNotificationFired', (e: any) => {
            if (e?.description) {
              notify(e.description, 'info');
            }
          });
      }
    } catch (err) {
      console.warn('WebSocket init warning:', err);
    }
  }
};

