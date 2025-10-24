'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useConversations, useSendConversationMessage } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MemberMessaging() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [message, setMessage] = useState('');
  
  const { data: conversations } = useConversations();
  const { mutate: sendMessage, isPending } = useSendConversationMessage();
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!selectedConversation || !message.trim()) return;

    sendMessage({
      conversationId: selectedConversation.id,
      content: message.trim()
    }, {
      onSuccess: () => {
        setMessage('');
        toast({
          title: 'Message sent',
          description: 'Your message has been delivered',
        });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>
            Your message threads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {conversations?.results?.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted ${
                    selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="font-medium">{conversation.subject}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {conversation.last_message_preview}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conversation.participant_count} participants
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConversation ? selectedConversation.subject : 'Select a conversation'}
          </CardTitle>
          <CardDescription>
            {selectedConversation ? 'Send and receive messages' : 'Choose a conversation to start messaging'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedConversation ? (
            <div className="space-y-4">
              {/* Messages would be loaded here using useConversationMessages */}
              <div className="h-64 border rounded-lg p-4">
                <p className="text-muted-foreground text-center">
                  Message history would appear here
                </p>
              </div>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Press Enter to send
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isPending}
                  >
                    {isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a conversation from the list to view messages
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
