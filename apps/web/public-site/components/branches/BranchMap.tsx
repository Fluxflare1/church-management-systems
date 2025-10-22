'use client';

import { useEffect, useRef } from 'react';

interface Props {
  data: any[];
  onSelect: (branch: any) => void;
}

export const BranchMap = ({ data, onSelect }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 3,
      center: { lat: 9.082, lng: 8.6753 }, // Center of Nigeria
    });

    data.forEach((country) => {
      country.regions.forEach((region) => {
        region.branches.forEach((branch) => {
          const marker = new google.maps.Marker({
            position: branch.contact.location, // { lat, lng }
            map,
            title: branch.name,
          });

          marker.addListener('click', () => onSelect(branch));
        });
      });
    });
  }, [data, onSelect]);

  return (
    <div
      ref={mapRef}
      className="rounded-2xl shadow h-[600px] bg-gray-200"
      id="branch-map"
    />
  );
};
