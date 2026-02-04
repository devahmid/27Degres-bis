import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Injectable, Logger } from '@nestjs/common';

interface OnlineUser {
  userId: number;
  socketId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  connectedAt: Date;
}

interface ChatMessage {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  message: string;
  timestamp: Date;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private onlineUsers: Map<number, OnlineUser> = new Map();
  private socketToUserId: Map<string, number> = new Map();
  private chatMessages: ChatMessage[] = [];
  private readonly MAX_CHAT_MESSAGES = 100;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        client.disconnect();
        return;
      }

      // Stocker l'utilisateur en ligne
      const onlineUser: OnlineUser = {
        userId: user.id,
        socketId: client.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        connectedAt: new Date(),
      };

      this.onlineUsers.set(user.id, onlineUser);
      this.socketToUserId.set(client.id, user.id);

      // Notifier tous les autres utilisateurs qu'un nouvel utilisateur est en ligne
      client.broadcast.emit('user:online', {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      // Envoyer la liste des utilisateurs en ligne au nouveau client
      const onlineUsersList = Array.from(this.onlineUsers.values()).map(u => ({
        userId: u.userId,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      }));

      client.emit('users:online', onlineUsersList);

      // Envoyer les derniers messages de chat
      client.emit('chat:messages', this.chatMessages.slice(-50));
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketToUserId.get(client.id);
    
    if (userId) {
      const user = this.onlineUsers.get(userId);
      
      if (user) {
        this.onlineUsers.delete(userId);
        this.socketToUserId.delete(client.id);

        // Notifier tous les autres utilisateurs qu'un utilisateur est hors ligne
        this.server.emit('user:offline', {
          userId: user.userId,
        });
      }
    }
  }

  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketToUserId.get(client.id);
    
    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const user = this.onlineUsers.get(userId);
    
    if (!user) {
      return { error: 'User not found' };
    }

    // Créer le message
    const chatMessage: ChatMessage = {
      id: `${Date.now()}-${userId}`,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      message: data.message.trim(),
      timestamp: new Date(),
    };

    // Ajouter au historique (limiter à MAX_CHAT_MESSAGES)
    this.chatMessages.push(chatMessage);
    if (this.chatMessages.length > this.MAX_CHAT_MESSAGES) {
      this.chatMessages.shift();
    }

    // Diffuser le message à tous les utilisateurs connectés
    this.server.emit('chat:new-message', chatMessage);

    return { success: true, message: chatMessage };
  }

  @SubscribeMessage('users:get-online')
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineUsersList = Array.from(this.onlineUsers.values()).map(u => ({
      userId: u.userId,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
    }));

    return onlineUsersList;
  }

  getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }
}
