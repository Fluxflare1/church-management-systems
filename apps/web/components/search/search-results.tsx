import Link from 'next/link';
import { MapPin, Calendar, FileText, Users } from 'lucide-react';
import { Branch, Sermon, Event } from '@/types';

interface SearchResultsProps {
  results: {
    branches: Branch[];
    sermons: Sermon[];
    events: Event[];
  } | null;
  isLoading: boolean;
  query: string;
  onResultClick: () => void;
}

export default function SearchResults({ 
  results, 
  isLoading, 
  query, 
  onResultClick 
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="p-4 text-center text-gray-500">
          Searching...
        </div>
      </div>
    );
  }

  if (!results || !query.trim()) {
    return null;
  }

  const hasResults = results.branches.length > 0 || 
                    results.sermons.length > 0 || 
                    results.events.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {!hasResults ? (
        <div className="p-4 text-center text-gray-500">
          No results found for "{query}"
        </div>
      ) : (
        <div className="p-4">
          {/* Branches Results */}
          {results.branches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                <MapPin className="h-4 w-4" />
                Branches ({results.branches.length})
              </div>
              {results.branches.slice(0, 3).map((branch) => (
                <Link
                  key={branch.id}
                  href={`/branches/${branch.slug}`}
                  onClick={onResultClick}
                  className="block p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="font-medium text-gray-900">{branch.name}</div>
                  <div className="text-sm text-gray-600">{branch.address?.city}, {branch.address?.state}</div>
                </Link>
              ))}
            </div>
          )}

          {/* Events Results */}
          {results.events.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                <Calendar className="h-4 w-4" />
                Events ({results.events.length})
              </div>
              {results.events.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  onClick={onResultClick}
                  className="block p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleDateString()} • {event.branch?.name}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sermons Results */}
          {results.sermons.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                <FileText className="h-4 w-4" />
                Sermons ({results.sermons.length})
              </div>
              {results.sermons.slice(0, 3).map((sermon) => (
                <Link
                  key={sermon.id}
                  href={`/sermons/${sermon.id}`}
                  onClick={onResultClick}
                  className="block p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="font-medium text-gray-900">{sermon.title}</div>
                  <div className="text-sm text-gray-600">
                    {sermon.speaker} • {sermon.branch?.name}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Results Link */}
          {(results.branches.length > 3 || results.events.length > 3 || results.sermons.length > 3) && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onResultClick}
                className="block text-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View all results
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
