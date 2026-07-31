import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const socket = io(`${SOCKET_URL}/ws`, {
    autoConnect: false,
});

export const connectSocket = () => {
    if (!socket.connected) {
        const token = localStorage.getItem('token');
        if (token) {
            socket.auth = { token };
        }
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
