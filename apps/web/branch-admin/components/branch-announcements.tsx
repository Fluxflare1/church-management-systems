'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSendMessage, useTemplates } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface BranchAnnouncementsProps {
  branchId: number;
  branchName: string;
}

export function BranchAnnouncements({ branchId, branchName }: BranchAnnouncementsProps) {
  const [announcementType, setAnnouncementType] = useState<'custom' | 'template'>('custom');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('email');

  const { mutate: sendMessage, isPending } = useSendMessage();
  const { data: templates } = useTemplates();
  const { toast } = useToast();

  const handleSendAnnouncement = () => {
    let templateId: number;

    if (announcementType === 'template' && selectedTemplate) {
      templateId = parseInt(selectedTemplate);
    } else {
      // For custom messages, we'd need to create a template first
      // This is simplified for the example
      toast({
        title: 'Custom template creation',
        description: 'Creating custom template...',
      });
      return;
    }

    sendMessage({
      template_id: templateId,
      audience_filters: {
        branch_id: branchId
      },
      schedule_type: 'immediate'
    }, {
      onSuccess: () => {
        toast({
          title: 'Announcement sent',
          description: `Announcement sent to ${branchName} members`,
        });
        // Reset form
        setCustomSubject('');
        setCustomMessage('');
        setSelectedTemplate('');
      }
    });
  };

  const branchTemplates = templates?.results?.filter(t => 
    t.template_type === 'announcement' || t.template_type === 'event'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Branch Announcements
          <Badge variant="secondary">{branchName}</Badge>
        </CardTitle>
        <CardDescription>
          Send announcements to all members of {branchName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Announcement Type</label>
          <Select value={announcementType} onValueChange={(value: 'custom' | 'template') => setAnnouncementType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Message</SelectItem>
              <SelectItem value="template">Use Template</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {announcementType === 'template' ? (
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {branchTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name} ({template.channel_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Important announcement..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Type your announcement message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
              />
            </div>
          </>
        )}

        <div className="grid gap-2">
          <label className="text-sm font-medium">Channel</label>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="push">Push Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSendAnnouncement}
          disabled={
            (announcementType === 'template' && !selectedTemplate) ||
            (announcementType === 'custom' && (!customSubject || !customMessage)) ||
            isPending
          }
          className="w-full"
        >
          {isPending ? 'Sending...' : `Send to ${branchName} Members`}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>This announcement will be sent to all active members of {branchName}</p>
          <p>Members can manage their communication preferences in their portal</p>
        </div>
      </CardContent>
    </Card>
  );
}
