/**
 * WebSocket Server for Real-time Updates
 * 
 * Provides real-time notifications for:
 * - System health changes
 * - IoT device state updates
 * - Social media post status
 * - Analytics refresh notifications
 * - Job completion events
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

export interface WSMessage {
  type: 'system_health' | 'iot_update' | 'social_post' | 'analytics' | 'job_complete' | 'notification';
  payload: any;
  timestamp: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: any): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log('[WebSocket] Client connected from', req.socket.remoteAddress);
      this.clients.add(ws);

      // Send welcome message
      this.sendToClient(ws, {
        type: 'notification',
        payload: { message: 'Connected to JARVIS WebSocket' },
        timestamp: new Date().toISOString(),
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('[WebSocket] Invalid message:', error);
        }
      });

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
        this.clients.delete(ws);
      });

      // Set up ping/pong for connection health
      ws.on('pong', () => {
        (ws as any).isAlive = true;
      });
    });

    // Start heartbeat
    this.startHeartbeat();

    console.log('[WebSocket] Server initialized on /ws');
  }

  private handleClientMessage(ws: WebSocket, message: any): void {
    // Handle different message types from clients
    switch (message.type) {
      case 'ping':
        this.sendToClient(ws, {
          type: 'notification',
          payload: { message: 'pong' },
          timestamp: new Date().toISOString(),
        });
        break;
      case 'subscribe':
        // Handle subscription to specific event types
        console.log('[WebSocket] Client subscribed to:', message.topics);
        break;
      default:
        console.log('[WebSocket] Unknown message type:', message.type);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if ((ws as any).isAlive === false) {
          this.clients.delete(ws);
          return ws.terminate();
        }

        (ws as any).isAlive = false;
        ws.ping();
      });
    }, 30000) as unknown as NodeJS.Timeout; // 30 seconds
  }

  private sendToClient(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: WSMessage): void {
    const payload = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // Specific broadcast methods for different event types
  broadcastSystemHealth(status: any): void {
    this.broadcast({
      type: 'system_health',
      payload: status,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastIoTUpdate(device: any): void {
    this.broadcast({
      type: 'iot_update',
      payload: device,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastSocialPost(post: any): void {
    this.broadcast({
      type: 'social_post',
      payload: post,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastAnalytics(data: any): void {
    this.broadcast({
      type: 'analytics',
      payload: data,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastJobComplete(job: any): void {
    this.broadcast({
      type: 'job_complete',
      payload: job,
      timestamp: new Date().toISOString(),
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.close();
    });

    this.clients.clear();

    if (this.wss) {
      this.wss.close();
    }

    console.log('[WebSocket] Server shut down');
  }
}

export const wsManager = new WebSocketManager();
export default wsManager;
