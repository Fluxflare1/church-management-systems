'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChannels, useAudienceInsights } from '@/lib/communications';

interface AudienceBuilderProps {
  onAudienceChange: (filters: any) => void;
  initialFilters?: any;
}

export function AudienceBuilder({ onAudienceChange, initialFilters = {} }: AudienceBuilderProps) {
  const [filters, setFilters] = useState(initialFilters);
  const { data: channels } = useChannels();
  const { data: insights } = useAudienceInsights(filters);

  const addFilter = (type: string, value: any) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    onAudienceChange(newFilters);
  };

  const removeFilter = (type: string) => {
    const newFilters = { ...filters };
    delete newFilters[type];
    setFilters(newFilters);
    onAudienceChange(newFilters);
  };

  const filterOptions = {
    branch: [
      { id: 1, name: 'HQ Main' },
      { id: 2, name: 'Lagos Branch' },
      { id: 3, name: 'Abuja Branch' }
    ],
    member_status: ['active', 'inactive', 'visitor'],
    departments: ['Worship', 'Ushers', 'Children', 'Youth', 'Evangelism'],
    engagement_level: ['high', 'medium', 'low'],
    age_groups: ['youth', 'adults', 'seniors']
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Builder</CardTitle>
        <CardDescription>
          Define your target audience using filters and segments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Active Filters</label>
          <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-lg">
            {Object.entries(filters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key}: {String(value)}
                <button 
                  onClick={() => removeFilter(key)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            {Object.keys(filters).length === 0 && (
              <span className="text-muted-foreground text-sm">No filters applied</span>
            )}
          </div>
        </div>

        {/* Audience Insights */}
        {insights && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Audience Size</div>
                  <div>{insights.audience_size} users</div>
                </div>
                <div>
                  <div className="font-medium">Response Rate</div>
                  <div>{insights.engagement_metrics.response_rate}%</div>
                </div>
                <div>
                  <div className="font-medium">Top Channel</div>
                  <div className="capitalize">
                    {Object.entries(insights.channel_preferences)
                      .sort(([,a], [,b]) => b.percentage - a.percentage)[0]?.[0]}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Recommendation</div>
                  <div className="text-xs">
                    {insights.recommendations?.[0] || 'No specific recommendations'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Options */}
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {/* Branch Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.branch.map(branch => (
                  <Badge
                    key={branch.id}
                    variant={filters.branch_id === branch.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => addFilter('branch_id', branch.id)}
                  >
                    {branch.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Member Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Member Status</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.member_status.map(status => (
                  <Badge
                    key={status}
                    variant={filters.member_status === status ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => addFilter('member_status', status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Departments</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.departments.map(dept => (
                  <Badge
                    key={dept}
                    variant={filters.department === dept ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => addFilter('department', dept)}
                  >
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Engagement Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Engagement Level</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.engagement_level.map(level => (
                  <Badge
                    key={level}
                    variant={filters.engagement_level === level ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => addFilter('engagement_level', level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setFilters({});
              onAudienceChange({});
            }}
          >
            Clear All
          </Button>
          <Button onClick={() => onAudienceChange(filters)}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
