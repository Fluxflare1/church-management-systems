'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTemplates, useSendMessage } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';

interface FollowUpAutomationProps {
  guestId: number;
  guestEmail: string;
  guestName: string;
}

export function FollowUpAutomation({ guestId, guestEmail, guestName }: FollowUpAutomationProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { data: templates } = useTemplates({ template_type: 'follow_up' });
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { toast } = useToast();

  const handleSendFollowUp = () => {
    if (!selectedTemplate) return;

    sendMessage({
      template_id: parseInt(selectedTemplate),
      audience_filters: {
        user_ids: [guestId]
      },
      schedule_type: 'immediate'
    }, {
      onSuccess: () => {
        toast({
          title: 'Follow-up sent',
          description: `Follow-up message sent to ${guestName}`,
        });
      }
    });
  };

  const quickTemplates = templates?.results?.filter(t => 
    t.name.toLowerCase().includes('welcome') || 
    t.name.toLowerCase().includes('follow')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Automated Follow-up
          <Badge variant="outline">CMAS</Badge>
        </CardTitle>
        <CardDescription>
          Send automated follow-up messages to nurture guest relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Select Follow-up Template</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {quickTemplates?.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name} ({template.channel_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSendFollowUp}
            disabled={!selectedTemplate || isPending}
          >
            {isPending ? 'Sending...' : 'Send Follow-up'}
          </Button>
          <Button variant="outline" disabled={!selectedTemplate}>
            Schedule
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Guest: {guestName} ({guestEmail})</p>
          <p>This will send an immediate follow-up using the selected template</p>
        </div>
      </CardContent>
    </Card>
  );
}
