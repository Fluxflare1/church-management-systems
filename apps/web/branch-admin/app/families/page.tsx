'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { memberApi } from '@/lib/api/members';
import { Family } from '@/lib/types/member-types';

export default function FamiliesManagementPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const familiesData = await memberApi.getFamilies({ search });
      setFamilies(familiesData);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setTimeout(() => loadFamilies(), 300);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading families...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Family Management</h1>
          <p className="text-gray-600">Manage family units and household information</p>
        </div>
        <Button asChild>
          <a href="/branch-admin/families/new">Add Family</a>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Families</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by family name, ID, or address..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Families Table */}
      <Card>
        <CardHeader>
          <CardTitle>Families ({families.length})</CardTitle>
          <CardDescription>
            All family units in your branch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family ID</TableHead>
                <TableHead>Family Name</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((family) => (
                <TableRow key={family.id}>
                  <TableCell className="font-mono">{family.family_id}</TableCell>
                  <TableCell className="font-medium">{family.family_name}</TableCell>
                  <TableCell>
                    {family.primary_contact_name || (
                      <Badge variant="outline">Not Set</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{family.member_count} members</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {family.address || 'No address provided'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/branch-admin/families/${family.id}`}>
                          View
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/branch-admin/families/${family.id}/edit`}>
                          Edit
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {families.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search ? 'No families found matching your search' : 'No families found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
