'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { memberApi } from '@/lib/api/members';
import { WelfareCase } from '@/lib/types/member-types';

export default function WelfareCasesPage() {
  const [cases, setCases] = useState<WelfareCase[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWelfareData();
  }, []);

  const loadWelfareData = async () => {
    try {
      const [casesResponse, statsResponse] = await Promise.all([
        memberApi.getWelfareCases({ status: ['open', 'in_progress'] }),
        memberApi.getWelfareDashboardStats()
      ]);
      
      setCases(casesResponse.results);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error loading welfare data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    return (
      <Badge variant={variants[urgency as keyof typeof variants] || 'secondary'}>
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'secondary',
      in_progress: 'default',
      resolved: 'outline',
      escalated: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading welfare cases...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welfare Cases</h1>
          <p className="text-gray-600">Manage member support and welfare cases</p>
        </div>
        <Button asChild>
          <a href="/branch-admin/welfare-cases/new">New Case</a>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.total_cases || 0}</CardTitle>
            <CardDescription>Total Cases</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-blue-600">{stats.open_cases || 0}</CardTitle>
            <CardDescription>Open Cases</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-red-600">{stats.overdue_cases || 0}</CardTitle>
            <CardDescription>Overdue</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-green-600">{stats.resolved_cases || 0}</CardTitle>
            <CardDescription>Resolved</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Active Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Welfare Cases</CardTitle>
          <CardDescription>
            Cases currently being handled by welfare officers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Title</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.title}</TableCell>
                  <TableCell>
                    <div>
                      <div>{caseItem.member_name}</div>
                      <div className="text-sm text-gray-600">
                        {caseItem.member.member_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {caseItem.case_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{getUrgencyBadge(caseItem.urgency)}</TableCell>
                  <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                  <TableCell>
                    {caseItem.assigned_officer_name || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    {new Date(caseItem.reported_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/branch-admin/welfare-cases/${caseItem.id}`}>
                        View
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {cases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active welfare cases found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
