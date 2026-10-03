import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useNotificationStore from '../store/notificationStore';

const useWebSocket = (user) => {
  const clientRef = useRef(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!user?.id || !user?.role) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws/case-notifications'),
      reconnectDelay: 5000,
      onConnect: () => {
        const topic = /topic//;
        client.subscribe(topic, (msg) => {
          try {
            const notification = JSON.parse(msg.body);
            addNotification(notification);
          } catch (e) {
            console.error('Failed to parse WebSocket message', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
      onDisconnect: () => {
        console.warn('WebSocket disconnected');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user?.id, user?.role]);

  return clientRef;
};

export default useWebSocket;
