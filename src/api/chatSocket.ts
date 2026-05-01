
import { io, type Socket } from 'socket.io-client';
import { CHAT_SOCKET_URL } from '../config/env';
import { getAccessToken } from './session';

let socket: Socket | null = null;
let wiredDebug = false;
let activeToken: string | null = null;

export function getChatSocket(): Socket | null {
  return socket;
}

export function connectChatSocket(token?: string | null): Socket {
  const t = token ?? getAccessToken();
  if (!t) {
    throw new Error('No access token for chat socket');
  }

  // IMPORTANT:
  // Do not tear down an existing socket just because it's still connecting.
  // That causes lost room joins + listeners and makes chat "act like REST".
  if (socket && activeToken === t) {
    return socket;
  }

  // Token changed or no socket yet -> recreate cleanly.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  activeToken = t;

  socket = io(CHAT_SOCKET_URL, {
    auth: { token: t },
    // Polling is often flaky on Android emulators/dev networks; websocket-only is the most stable for chat.
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 10_000,
    timeout: 12_000,
  });

  // Minimal debug wiring (helps diagnose "acts like REST" issues)
  if (!wiredDebug) {
    wiredDebug = true;
    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[chat-socket] connected', { id: socket?.id, url: CHAT_SOCKET_URL });
    });
    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('[chat-socket] disconnected', { reason });
    });
    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.log('[chat-socket] connect_error', { message: err?.message });
    });
    socket.on('reconnect_attempt', (attempt) => {
      // eslint-disable-next-line no-console
      console.log('[chat-socket] reconnect_attempt', { attempt });
    });
    socket.io.on('reconnect', (attempt) => {
      // eslint-disable-next-line no-console
      console.log('[chat-socket] reconnect', { attempt });
    });
  }
  return socket;
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    activeToken = null;
  }
}
