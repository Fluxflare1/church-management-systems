'use client';

interface Props {
  onSearch: (query: string) => void;
}

export const BranchSearch = ({ onSearch }: Props) => {
  return (
    <div className="flex justify-center">
      <input
        type="text"
        placeholder="Search by location, pastor, or branch name..."
        className="w-full md:w-2/3 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};
