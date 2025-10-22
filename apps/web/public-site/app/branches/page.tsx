// apps/web/public-site/app/branches/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getAllBranches, searchBranches, Branch } from '@/lib/branches';
import BranchSearch from '@/components/branches/BranchSearch';
import BranchList from '@/components/branches/BranchList';
import BranchMap from '@/components/branches/BranchMap';
import BranchDetailsModal from '@/components/branches/BranchDetailsModal';

export default function BranchDiscoveryPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllBranches();
        setBranches(data);
      } catch (err) {
        console.error('Failed to load branches', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await searchBranches(query);
      setBranches(results);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Find a THOGMi Branch</h1>

      <BranchSearch onSearch={handleSearch} />

      {loading && (
        <div className="text-center text-neutral-500 mt-8">Loading branches...</div>
      )}

      {!loading && (
        <>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <BranchList branches={branches} onSelect={setSelected} />
            <BranchMap branches={branches} onSelect={setSelected} />
          </div>

          {selected && (
            <BranchDetailsModal branch={selected} onClose={() => setSelected(null)} />
          )}
        </>
      )}
    </div>
  );
}
