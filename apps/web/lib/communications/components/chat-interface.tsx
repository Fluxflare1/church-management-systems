'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useConversationMessages, useSendConversationMessage, useWebSocket } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  conversationId: number;
  conversationTitle: string;
}

export function ChatInterface({ conversationId, conversationTitle }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useConversationMessages(conversationId);
  const { mutate: sendMessage, isPending } = useSendConversationMessage();
  const { toast } = useToast();

  const { 
    isConnected, 
    sendMessage: sendWsMessage, 
    sendTypingIndicator,
    sendReadReceipt 
  } = useWebSocket({
    conversationId,
    onMessage: (newMessage) => {
      // Messages are already handled by the query
    },
    onTyping: (user, typing) => {
      setIsTyping(typing);
      setTypingUser(typing ? user.name : null);
    },
    onReadReceipt: (messageId, user) => {
      // Handle read receipts
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessage({
      conversationId,
      content: message.trim()
    }, {
      onSuccess: () => {
        setMessage('');
        sendTypingIndicator(false);
      },
      onError: (error) => {
        toast({
          title: 'Failed to send message',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    sendTypingIndicator(true);
    // Debounce typing indicator
    setTimeout(() => sendTypingIndicator(false), 3000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {conversationTitle}
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </CardTitle>
        <CardDescription>
          {isConnected ? 'Connected' : 'Connecting...'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading messages...</div>
            ) : messages?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages?.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {msg.sender_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">{msg.sender_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && typingUser && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {typingUser?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{typingUser}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="space-y-2">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              rows={3}
              disabled={!isConnected || isPending}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {isConnected ? 'Press Enter to send' : 'Reconnecting...'}
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected || isPending}
                size="sm"
              >
                {isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
