'use client';

import { useLiveStreams, useUpcomingStreams } from '@/hooks/use-api-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LiveStreamPage() {
  const { data: liveStreams, isLoading: liveLoading } = useLiveStreams();
  const { data: upcomingStreams, isLoading: upcomingLoading } = useUpcomingStreams();

  const liveNow = liveStreams?.filter(stream => stream.status === 'live') || [];
  const upcoming = upcomingStreams || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Streaming</h1>
        <p className="text-lg text-gray-600">
          Join our services live from THOGMi branches around the world
        </p>
      </div>

      {/* Live Now Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Live Now
        </h2>

        {liveLoading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          </div>
        ) : liveNow.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveNow.map((stream) => (
              <Card key={stream.id} className="overflow-hidden">
                <CardHeader className="bg-red-50 border-b">
                  <CardTitle className="text-red-700">LIVE NOW</CardTitle>
                  <p className="text-gray-600">{stream.branch.name}</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    {/* Video player would go here */}
                    <div className="text-white text-center">
                      <p className="text-lg mb-2">Live Stream: {stream.title}</p>
                      <p className="text-sm mb-4">{stream.viewers} viewers</p>
                      <Button asChild>
                        <a href={stream.stream_url} target="_blank" rel="noopener noreferrer">
                          Watch Now
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{stream.title}</h3>
                    <p className="text-gray-600 text-sm">{stream.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">No live streams at the moment</p>
              <p className="text-gray-400">Check back during service times</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming Streams Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Services</h2>
        
        {upcomingLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{stream.title}</h3>
                      <p className="text-gray-600">
                        {stream.branch.name} • {new Date(stream.start_time).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href={stream.stream_url} target="_blank" rel="noopener noreferrer">
                        Set Reminder
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No upcoming streams scheduled</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
