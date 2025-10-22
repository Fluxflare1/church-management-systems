'use client';

import { X } from 'lucide-react';

interface Props {
  branch: any;
  onClose: () => void;
}

export const BranchDetailsModal = ({ branch, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2 text-gray-800">{branch.name}</h2>
        <p className="text-gray-600 mb-1">{branch.address}</p>
        <p className="text-sm text-gray-500 mb-3">
          Pastors: {branch.pastors.join(', ')}
        </p>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Service Times:</strong>{' '}
            {branch.serviceTimes.map((s: any) => s.day).join(', ')}
          </p>
          <p>
            <strong>Contact:</strong> {branch.contact.phone} |{' '}
            {branch.contact.email}
          </p>
        </div>

        <a
          href={`https://www.google.com/maps?q=${branch.contact.location.lat},${branch.contact.location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-primary font-semibold underline"
        >
          View on Google Maps
        </a>
      </div>
    </div>
  );
};
