'use client';

import { useState } from 'react';
import { useSermons, useSermonSeries } from '@/hooks/use-api-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SermonsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const { data: sermons, isLoading } = useSermons({
    search: searchTerm,
    series: selectedSeries,
    speaker: selectedSpeaker,
    branch: selectedBranch
  });

  const { data: series } = useSermonSeries();

  // Mock data for filters (would come from API in production)
  const speakers = ['Apostle John Mensah', 'Bishop David Chen', 'Pastor Sarah Mensah', 'Bishop Michael Adebayo'];
  const branches = ['THOGMi HQ', 'Lagos Central', 'Abuja Branch', 'London UK', 'New York Branch'];

  const filteredSermons = sermons || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sermon Library</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore messages that will inspire, challenge, and transform your life with God's Word.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search sermons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Series</option>
              {series?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Speakers</option>
              {speakers.map((speaker) => (
                <option key={speaker} value={speaker}>{speaker}</option>
              ))}
            </select>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sermons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSermons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map((sermon) => (
            <Card key={sermon.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{sermon.title}</CardTitle>
                <p className="text-sm text-gray-600">{sermon.speaker}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{new Date(sermon.date).toLocaleDateString()}</span>
                  <span>{sermon.duration} min</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{sermon.series}</p>
                <p className="text-xs text-blue-600">{sermon.scripture}</p>
                <div className="flex gap-2 pt-2">
                  {sermon.audio_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer">
                        Audio
                      </a>
                    </Button>
                  )}
                  {sermon.video_url && (
                    <Button size="sm" asChild>
                      <a href={sermon.video_url} target="_blank" rel="noopener noreferrer">
                        Watch
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-lg">No sermons found matching your criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedSeries('');
                setSelectedSpeaker('');
                setSelectedBranch('');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Featured Series */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Series</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {series?.slice(0, 4).map((seriesName) => (
            <Card key={seriesName} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">📖</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{seriesName}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedSeries(seriesName)}>
                  Explore Series
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
