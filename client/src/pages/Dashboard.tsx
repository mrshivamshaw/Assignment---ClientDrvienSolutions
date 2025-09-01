// src/pages/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/dateUtils';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', { limit: 5 }],
    queryFn: () => apiClient.getEvents({ limit: 5 }),
  });

  const myEvents = eventsData?.events.filter(event => 
    event.createdBy._id === currentUser?._id
  ) || [];

  const attendingEvents = eventsData?.events.filter(event =>
    event.attendees.some(attendee => attendee._id === currentUser?._id)
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {currentUser?.displayName}!
        </h1>
        <p className="text-gray-600">
          Manage your events and discover new ones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">My Events</h3>
          <p className="text-3xl font-bold text-blue-600">{myEvents.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Attending</h3>
          <p className="text-3xl font-bold text-green-600">{attendingEvents.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-purple-600">{eventsData?.events.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">My Recent Events</h2>
            <Link to="/events" className="text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          
          {myEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No events created yet.{' '}
              <Link to="/events/create" className="text-blue-600 hover:text-blue-800">
                Create your first event
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {myEvents.slice(0, 3).map((event) => (
                <div key={event._id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(event.startDate)} • {event.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.attendees.length} attending • {event.visibility}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
            <Link to="/events" className="text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          
          {eventsData?.events.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {eventsData?.events.slice(0, 3).map((event) => (
                <div key={event._id} className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(event.startDate)} • {event.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    By {event.createdBy.displayName} • {event.attendees.length} attending
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

