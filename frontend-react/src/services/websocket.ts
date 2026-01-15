/**
 * WebSocket Service using Socket.io
 * Handles real-time communication for notifications, task updates, etc.
 */

import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api.config';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    this.socket = io(API_CONFIG.wsURL, {
      auth: {
        token: authToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', reason => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', error => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', error => {
      console.error('❌ WebSocket error:', error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Subscribe to a specific event
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('WebSocket not connected');
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   * Unsubscribe from a specific event
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot emit event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Subscribe to task updates
   */
  subscribeToTask(taskId: string, callback: (data: any) => void): void {
    this.emit('subscribe:task', { taskId });
    this.on(`task:${taskId}:update`, callback);
  }

  /**
   * Unsubscribe from task updates
   */
  unsubscribeFromTask(taskId: string, callback?: (data: any) => void): void {
    this.emit('unsubscribe:task', { taskId });
    this.off(`task:${taskId}:update`, callback);
  }

  /**
   * Subscribe to board updates
   */
  subscribeToBoard(boardId: string, callback: (data: any) => void): void {
    this.emit('subscribe:board', { boardId });
    this.on(`board:${boardId}:update`, callback);
  }

  /**
   * Unsubscribe from board updates
   */
  unsubscribeFromBoard(boardId: string, callback?: (data: any) => void): void {
    this.emit('unsubscribe:board', { boardId });
    this.off(`board:${boardId}:update`, callback);
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(callback: (notification: any) => void): void {
    this.on('notification', callback);
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribeFromNotifications(callback?: (notification: any) => void): void {
    this.off('notification', callback);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
