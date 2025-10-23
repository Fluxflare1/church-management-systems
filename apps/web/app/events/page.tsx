'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/use-api-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: events, isLoading } = useEvents({
    category: selectedCategory === 'all' ? undefined : selectedCategory
  });

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'service', name: 'Church Services' },
    { id: 'conference', name: 'Conferences' },
    { id: 'training', name: 'Training' },
    { id: 'social', name: 'Social Events' },
    { id: 'outreach', name: 'Outreach' }
  ];

  const upcomingEvents = events?.filter(event => new Date(event.start_date) > new Date()) || [];
  const pastEvents = events?.filter(event => new Date(event.start_date) <= new Date()) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Events Calendar</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join us for worship, fellowship, and transformative experiences across all THOGMi branches.
        </p>
      </div>

      {/* View Toggle and Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? "default" : "outline"}
            onClick={() => setView('list')}
          >
            List View
          </Button>
          <Button
            variant={view === 'calendar' ? "default" : "outline"}
            onClick={() => setView('calendar')}
          >
            Calendar View
          </Button>
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">No upcoming events found</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Past Events */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Events</h2>
        
        {pastEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} isPast={true} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No past events to display</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function EventCard({ event, isPast = false }: { event: any; isPast?: boolean }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
        <div className="flex items-center text-sm text-gray-600">
          <span>📅</span>
          <span className="ml-2">
            {new Date(event.start_date).toLocaleDateString()} 
            {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span>📍</span>
          <span className="ml-2">{event.location}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{event.description}</p>
        
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-xs ${
            event.event_type === 'service' ? 'bg-blue-100 text-blue-800' :
            event.event_type === 'conference' ? 'bg-purple-100 text-purple-800' :
            event.event_type === 'training' ? 'bg-green-100 text-green-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {event.event_type}
          </span>
          
          {!isPast && (
            <Button size="sm" asChild>
              <a href={`/events/${event.id}`}>View Details</a>
            </Button>
          )}
        </div>

        {event.registration.required && !isPast && (
          <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
            Registration required • {event.registration.registered}/{event.registration.capacity} registered
          </div>
        )}

        {event.live_stream.available && !isPast && (
          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
            Live stream available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
