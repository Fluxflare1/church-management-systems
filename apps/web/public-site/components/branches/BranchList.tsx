'use client';

interface Props {
  data: any[];
  onSelect: (branch: any) => void;
}

export const BranchList = ({ data, onSelect }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow p-5 overflow-y-auto max-h-[600px]">
      {data.map((country) => (
        <div key={country.id} className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {country.name}
          </h2>
          {country.regions.map((region) => (
            <div key={region.id} className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {region.name}
              </h3>
              <ul className="space-y-2">
                {region.branches.map((branch) => (
                  <li
                    key={branch.id}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => onSelect(branch)}
                  >
                    <p className="font-medium text-gray-800">{branch.name}</p>
                    <p className="text-sm text-gray-600">{branch.address}</p>
                    <p className="text-xs text-gray-500">
                      Pastors: {branch.pastors.join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
