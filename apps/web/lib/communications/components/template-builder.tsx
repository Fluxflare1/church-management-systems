'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateTemplate, useChannels } from '@/lib/communications';
import { useToast } from '@/hooks/use-toast';

interface TemplateBuilderProps {
  onTemplateCreated?: (template: any) => void;
}

export function TemplateBuilder({ onTemplateCreated }: TemplateBuilderProps) {
  const [templateData, setTemplateData] = useState({
    name: '',
    template_type: 'welcome' as const,
    subject: '',
    content: '',
    channel: ''
  });

  const { mutate: createTemplate, isPending } = useCreateTemplate();
  const { data: channels } = useChannels();
  const { toast } = useToast();

  const availableVariables = [
    { name: 'name', description: 'Recipient name' },
    { name: 'email', description: 'Recipient email' },
    { name: 'branch', description: 'Branch name' },
    { name: 'event_name', description: 'Event name' },
    { name: 'event_date', description: 'Event date' },
    { name: 'service_time', description: 'Service time' },
  ];

  const insertVariable = (variable: string) => {
    const newContent = templateData.content + ` {${variable}} `;
    setTemplateData(prev => ({ ...prev, content: newContent }));
  };

  const handleCreateTemplate = () => {
    if (!templateData.name || !templateData.content || !templateData.channel) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createTemplate({
      name: templateData.name,
      template_type: templateData.template_type,
      subject: templateData.subject,
      content: templateData.content,
      channel: parseInt(templateData.channel)
    }, {
      onSuccess: (template) => {
        toast({
          title: 'Template created',
          description: 'Your template has been created successfully',
        });
        onTemplateCreated?.(template);
        // Reset form
        setTemplateData({
          name: '',
          template_type: 'welcome',
          subject: '',
          content: '',
          channel: ''
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Message Template</CardTitle>
        <CardDescription>
          Build reusable templates for your communications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name *</label>
            <Input
              placeholder="Welcome Email Template"
              value={templateData.name}
              onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Template Type *</label>
            <Select 
              value={templateData.template_type} 
              onValueChange={(value: any) => setTemplateData(prev => ({ ...prev, template_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="giving">Giving</SelectItem>
                <SelectItem value="welfare">Welfare</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Channel *</label>
          <Select 
            value={templateData.channel} 
            onValueChange={(value) => setTemplateData(prev => ({ ...prev, channel: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              {channels?.map((channel) => (
                <SelectItem key={channel.id} value={channel.id.toString()}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <Input
            placeholder="Welcome to THOGMi!"
            value={templateData.subject}
            onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Content *</label>
            <div className="text-xs text-muted-foreground">
              Use variables like {'{name}'} for personalization
            </div>
          </div>
          <Textarea
            placeholder="Hello {name}, welcome to THOGMi! We're excited to have you join us..."
            value={templateData.content}
            onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Available Variables</label>
          <div className="flex flex-wrap gap-2">
            {availableVariables.map((variable) => (
              <Badge 
                key={variable.name}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => insertVariable(variable.name)}
              >
                {variable.name}
                <span className="ml-1 text-muted-foreground text-xs">
                  ({variable.description})
                </span>
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleCreateTemplate}
          disabled={!templateData.name || !templateData.content || !templateData.channel || isPending}
          className="w-full"
        >
          {isPending ? 'Creating Template...' : 'Create Template'}
        </Button>
      </CardContent>
    </Card>
  );
}
