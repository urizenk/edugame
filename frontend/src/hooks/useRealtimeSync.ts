import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../config/env';

interface BubbleItem {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

interface BubbleData {
  classBubbles: BubbleItem[];
  sortingBubbles: BubbleItem[];
}

export const useRealtimeSync = () => {
  const [classBubbles, setClassBubbles] = useState<BubbleItem[]>([]);
  const [sortingBubbles, setSortingBubbles] = useState<BubbleItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 创建Socket连接
    const socket = io(api, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socketRef.current = socket;

    // 连接成功
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    // 接收服务器同步的数据
    socket.on('bubbles:sync', (data: BubbleData) => {
      console.log('📥 Received sync data:', data);
      setClassBubbles(data.classBubbles || []);
      setSortingBubbles(data.sortingBubbles || []);
    });

    // 接收更新确认
    socket.on('bubbles:updated', (response) => {
      console.log('✓ Update confirmed:', response);
    });

    // 连接错误处理
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // 清理函数
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, []);

  // 发送更新到服务器（带防抖）
  const syncToServer = (data: BubbleData) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, skipping sync');
      return;
    }

    // 防抖：延迟300ms发送，避免频繁更新
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      console.log('📤 Sending update to server:', data);
      socketRef.current?.emit('bubbles:update', data);
    }, 300);
  };

  return {
    classBubbles,
    sortingBubbles,
    setClassBubbles,
    setSortingBubbles,
    isConnected,
    syncToServer
  };
};

