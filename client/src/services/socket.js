import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
    return socket;
}

export function connectSocket(token) {
    if (socket?.connected) return socket;
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
        auth: { token },
        autoConnect: true,
        reconnection: true,
    });
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
