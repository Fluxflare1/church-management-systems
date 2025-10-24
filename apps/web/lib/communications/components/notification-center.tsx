import { useState } from 'react';
import { Bell, Mail, MessageSquare, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessages } from '../hooks/use-messaging';
import { useConversations } from '../hooks/use-conversations';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: messages } = useMessages({ 
    status: 'unread',
    limit: 10 
  });
  const { data: conversations } = useConversations();

  const unreadCount = messages?.results?.length || 0;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          <ScrollArea className="h-96">
            <div className="p-2">
              {/* Messages */}
              {messages?.results?.map((message) => (
                <div key={message.id} className="p-3 border-b last:border-b-0 hover:bg-muted rounded">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{message.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {message.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Conversation notifications */}
              {conversations?.results?.map((conversation) => (
                <div key={conversation.id} className="p-3 border-b last:border-b-0 hover:bg-muted rounded">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{conversation.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.last_message_preview}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {!messages?.results?.length && !conversations?.results?.length && (
                <div className="p-4 text-center text-muted-foreground">
                  <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
