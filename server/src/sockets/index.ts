import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../services/auth.service';

export interface AuthSocket extends Socket {
  userId?: string;
}

export function setupSockets(io: SocketIOServer) {
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = verifyToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`Socket: user ${socket.userId} connected`);
    socket.on('disconnect', () => {
      console.log(`Socket: user ${socket.userId} disconnected`);
    });
  });
}
