import SearchBar from '@/components/search/search-bar';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and navigation */}
          <div className="flex items-center">
            {/* Your existing logo and nav */}
          </div>
          
          {/* Add Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <SearchBar />
          </div>
          
          {/* Other header items */}
        </div>
      </div>
    </header>
  );
}
