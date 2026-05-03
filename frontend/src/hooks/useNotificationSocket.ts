import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

export function useNotificationSocket(onNotification?: (n: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) return;

    socketRef.current = io(
      `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}/notifications`,
      { auth: { token: accessToken }, transports: ['websocket'] },
    );

    socketRef.current.on('notification', (data: any) => {
      toast.success(`${data.title}: ${data.message}`);
      onNotification?.(data);
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('WebSocket error:', err.message);
    });
  }, [accessToken, isAuthenticated, onNotification]);

  useEffect(() => {
    connect();
    return () => { socketRef.current?.disconnect(); };
  }, [connect]);

  return socketRef.current;
}