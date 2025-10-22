'use client';

import { useEffect, useState } from 'react';
import { BranchSearch } from '@/components/branches/BranchSearch';
import { BranchList } from '@/components/branches/BranchList';
import { BranchMap } from '@/components/branches/BranchMap';
import { BranchDetailsModal } from '@/components/branches/BranchDetailsModal';
import { getBranchHierarchy } from '@/lib/api/branches';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getBranchHierarchy();
      setBranches(data);
      setFiltered(data);
    })();
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setFiltered(branches);
      return;
    }
    const q = query.toLowerCase();
    const results = branches
      .map(country => ({
        ...country,
        regions: country.regions.map(region => ({
          ...region,
          branches: region.branches.filter(
            b =>
              b.name.toLowerCase().includes(q) ||
              b.address.toLowerCase().includes(q) ||
              b.pastors.join(' ').toLowerCase().includes(q)
          ),
        })),
      }))
      .filter(
        c =>
          c.regions.some(r => r.branches.length > 0) ||
          c.name.toLowerCase().includes(q)
      );
    setFiltered(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Find a THOGMi Branch Near You
        </h1>
        <BranchSearch onSearch={handleSearch} />
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <BranchList data={filtered} onSelect={setSelectedBranch} />
          <BranchMap data={filtered} onSelect={setSelectedBranch} />
        </div>
      </div>

      {selectedBranch && (
        <BranchDetailsModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}
