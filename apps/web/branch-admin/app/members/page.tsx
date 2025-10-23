'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { memberApi } from '@/lib/api/members';
import { Member, MemberFilters } from '@/lib/types/member-types';

export default function MembersManagementPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MemberFilters>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMembers();
  }, [filters]);

  const loadMembers = async () => {
    try {
      const params = { ...filters, search };
      const response = await memberApi.getMembers(params);
      setMembers(response.results);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    // Debounced search would be better in production
    setTimeout(() => loadMembers(), 300);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      transferred: 'outline',
      deceased: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getEngagementBadge = (engagement?: any) => {
    if (!engagement) return <Badge variant="outline">N/A</Badge>;

    const variants = {
      high: 'default',
      medium: 'secondary',
      low: 'destructive',
      inactive: 'outline'
    } as const;

    return (
      <Badge variant={variants[engagement.engagement_tier as keyof typeof variants] || 'secondary'}>
        {engagement.engagement_score}%
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading members...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Member Management</h1>
          <p className="text-gray-600">Manage church members and their profiles</p>
        </div>
        <Button asChild>
          <a href="/branch-admin/members/new">Add Member</a>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search members by name, email, or member ID..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Status: {filters.membership_status?.join(', ') || 'All'}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilters({...filters, membership_status: undefined})}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, membership_status: ['active']})}>
                  Active Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, membership_status: ['inactive']})}>
                  Inactive Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
          <CardDescription>
            List of all members in your branch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Welfare</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {member.user.first_name} {member.user.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{member.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{member.member_id}</TableCell>
                  <TableCell>{getStatusBadge(member.membership_status)}</TableCell>
                  <TableCell>{getEngagementBadge(member.engagement)}</TableCell>
                  <TableCell>
                    {member.welfare_category !== 'none' && (
                      <Badge variant="outline" className="text-xs">
                        {member.welfare_category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(member.membership_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">⋯</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <a href={`/branch-admin/members/${member.id}`}>View Profile</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/branch-admin/members/${member.id}/welfare`}>
                            Welfare Cases
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/branch-admin/members/${member.id}/edit`}>
                            Edit Profile
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No members found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
