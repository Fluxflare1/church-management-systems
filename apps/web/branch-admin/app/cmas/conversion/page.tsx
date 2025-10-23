'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { integrationApi } from '@/lib/api/members';

interface ConversionCandidate {
  id: string;
  guest: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    visits_count: number;
    first_visit_date: string;
    last_visit_date: string;
  };
  conversion_score: number;
  readiness: 'high' | 'medium' | 'low';
  recommended_pathway: string;
}

export default function ConversionManagementPage() {
  const [candidates, setCandidates] = useState<ConversionCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversionCandidates();
  }, []);

  const loadConversionCandidates = async () => {
    try {
      // This would call your CMAS API to get conversion-ready guests
      // For now, we'll simulate the data
      const response = await fetch('/api/cmas/conversion-candidates/');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error loading conversion candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToMember = async (guestId: string) => {
    try {
      await integrationApi.convertGuestToMember(guestId);
      // Refresh the list
      loadConversionCandidates();
      // Show success message
      alert('Guest successfully converted to member!');
    } catch (error) {
      console.error('Error converting guest:', error);
      alert('Error converting guest to member');
    }
  };

  const getReadinessBadge = (readiness: string) => {
    const variants = {
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    } as const;

    return (
      <Badge variant={variants[readiness as keyof typeof variants] || 'secondary'}>
        {readiness.toUpperCase()} READINESS
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading conversion candidates...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Member Conversion</h1>
        <p className="text-gray-600">
          Convert engaged guests to full members using CMAS data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion-Ready Guests</CardTitle>
          <CardDescription>
            Guests who are ready to become members based on engagement and attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>First Visit</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>Pathway</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {candidate.guest.user.first_name} {candidate.guest.user.last_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {candidate.guest.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.guest.visits_count}</TableCell>
                  <TableCell>
                    {new Date(candidate.guest.first_visit_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(candidate.guest.last_visit_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getReadinessBadge(candidate.readiness)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {candidate.recommended_pathway}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => handleConvertToMember(candidate.guest.id)}
                      disabled={candidate.readiness === 'low'}
                    >
                      Convert to Member
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {candidates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No conversion-ready guests found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
