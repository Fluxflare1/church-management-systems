import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseWebSocketProps {
  conversationId: number;
  onMessage?: (message: any) => void;
  onTyping?: (user: any, isTyping: boolean) => void;
  onReadReceipt?: (messageId: number, user: any) => void;
}

export const useWebSocket = ({
  conversationId,
  onMessage,
  onTyping,
  onReadReceipt,
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'localhost:8000';
      const token = localStorage.getItem('access_token');
      
      const wsUrl = `${protocol}//${baseUrl}/ws/chat/${conversationId}/?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect with exponential backoff
        if (reconnectAttempts < 5) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection error',
          description: 'Failed to connect to chat',
          variant: 'destructive',
        });
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'chat_message':
              onMessage?.(data.message);
              break;
            case 'typing_indicator':
              onTyping?.(data.user, data.is_typing);
              break;
            case 'read_receipt':
              onReadReceipt?.(data.message_id, data.user);
              break;
            case 'conversation_history':
              // Handle initial message load
              data.messages?.forEach((message: any) => onMessage?.(message));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, [conversationId, reconnectAttempts, onMessage, onTyping, onReadReceipt, toast]);

  const sendMessage = useCallback((content: string) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'chat_message',
        message: content
      }));
    }
  }, [isConnected]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));
    }
  }, [isConnected]);

  const sendReadReceipt = useCallback((messageId: number) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'read_receipt',
        message_id: messageId
      }));
    }
  }, [isConnected]);

  useEffect(() => {
    if (conversationId) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [conversationId, connect]);

  return {
    isConnected,
    sendMessage,
    sendTypingIndicator,
    sendReadReceipt,
  };
};
