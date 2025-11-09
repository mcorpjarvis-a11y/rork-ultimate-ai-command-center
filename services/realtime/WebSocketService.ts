import RuntimeConfig from '@/services/config/RuntimeConfig';
import { WEBSOCKET_CONFIG } from '@/config/api.config';
import { WebSocketMessage } from '@/types/api.types';

type MessageHandler = (message: WebSocketMessage) => void;
type EventType = 'connected' | 'disconnected' | 'error' | 'message' | 'reconnecting';
type EventHandler = (data?: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Map<string, MessageHandler[]>;
  private eventHandlers: Map<EventType, EventHandler[]>;
  private messageQueue: WebSocketMessage[] = [];
  private isConnecting: boolean = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private initialConnectionWarned: boolean = false;

  constructor() {
    this.maxReconnectAttempts = WEBSOCKET_CONFIG.maxReconnectAttempts;
    this.reconnectInterval = WEBSOCKET_CONFIG.reconnectInterval;
    this.messageHandlers = new Map();
    this.eventHandlers = new Map();
  }

  async connect(token?: string): Promise<void> {
    // Get URL from RuntimeConfig with fallback to config
    try {
      this.url = await RuntimeConfig.getWsUrl();
    } catch (error) {
      this.url = WEBSOCKET_CONFIG.url;
      if (!this.initialConnectionWarned) {
        console.warn('[WebSocketService] Failed to get URL from RuntimeConfig, using default');
        this.initialConnectionWarned = true;
      }
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocketService] Already connected');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('[WebSocketService] Connection in progress');
      return Promise.resolve();
    }

    this.isConnecting = true;
    const wsUrl = token ? `${this.url}?token=${token}` : this.url;

    console.log('[WebSocketService] Connecting to:', wsUrl);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        // Set timeout for connection attempt
        const connectionTimeout = setTimeout(() => {
          if (this.isConnecting) {
            console.warn('[WebSocketService] Connection timeout after 10 seconds');
            this.isConnecting = false;
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('[WebSocketService] ✅ Connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected');
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          const wasClean = event.wasClean ? 'clean' : 'unclean';
          console.log(`[WebSocketService] Disconnected (${wasClean}):`, event.code, event.reason || 'No reason');
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          // Only log once per connection attempt to reduce noise
          if (!this.initialConnectionWarned) {
            console.warn('[WebSocketService] Connection failed - will retry with exponential backoff');
            this.initialConnectionWarned = true;
          }
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('[WebSocketService] Message received:', message.type);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocketService] Failed to parse message:', error);
          }
        };
      } catch (error) {
        console.error('[WebSocketService] Connection failed:', error);
        this.isConnecting = false;
        this.emit('error', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    console.log('[WebSocketService] Disconnecting...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  send(type: string, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocketService] Sending message:', type);
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('[WebSocketService] Queueing message:', type);
      this.messageQueue.push(message);
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);

    return () => this.off(type, handler);
  }

  off(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  addEventListener(event: EventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    return () => this.removeEventListener(event, handler);
  }

  removeEventListener(event: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    this.emit('message', message);

    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('[WebSocketService] Handler error:', error);
        }
      });
    }
  }

  private emit(event: EventType, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('[WebSocketService] Event handler error:', error);
        }
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocketService] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.min(this.reconnectAttempts, 5);

    console.log(
      `[WebSocketService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.emit('reconnecting', { attempt: this.reconnectAttempts });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`[WebSocketService] Flushing ${this.messageQueue.length} queued messages`);

    this.messageQueue.forEach(message => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    });

    this.messageQueue = [];
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | undefined {
    return this.ws?.readyState;
  }

  getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }
}

export default new WebSocketService();
