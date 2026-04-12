/**
 * Socket.io client for real-time chat (aligns with ghar-dekho-backend `config/socket.js`).
 *
 * Install: `npm install` (adds `socket.io-client` in package.json).
 *
 * Auth: `handshake.auth.token` — must match backend JWT. Reconnect after login/logout
 * by calling `disconnectChatSocket()` then `connectChatSocket()` with the new token.
 *
 * **Server CORS**: backend `initSocket` uses `FRONTEND_URL`; for physical devices ensure
 * your env allows the app origin or use a permissive dev setting so the handshake succeeds.
 */

import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/env';
import { getAccessToken } from './session';

let socket: Socket | null = null;

export function getChatSocket(): Socket | null {
  return socket;
}

export function connectChatSocket(token?: string | null): Socket {
  const t = token ?? getAccessToken();
  if (!t) {
    throw new Error('No access token for chat socket');
  }
  if (socket?.connected) {
    return socket;
  }
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = io(API_BASE_URL, {
    auth: { token: t },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1200,
  });
  return socket;
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
