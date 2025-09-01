import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type Event } from '../types';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isCreator = event.createdBy._id === currentUser?._id;
  const isAttending = event.attendees.some(attendee => attendee._id === currentUser?._id);
  const canDelete = currentUser?.role === 'admin';

  const attendMutation = useMutation({
    mutationFn: () => apiClient.toggleAttendance(event._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', event._id] });
      toast.success(isAttending ? 'Left event' : 'Joined event');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update attendance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteEvent(event._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  const handleAttendanceToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    attendMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 truncate">
            {event.title}
          </h3>
          <div className="flex space-x-1">
            <span className={`px-2 py-1 text-xs rounded-full ${
              event.visibility === 'public' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {event.visibility}
            </span>
            {isCreator && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Creator
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <p>📅 {formatDate(event.startDate)}</p>
          <p>📍 {event.location}</p>
          <p>👤 By {event.createdBy.displayName}</p>
          <p>👥 {event.attendees.length} attending</p>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/events/${event._id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          
          {!isCreator && (
            <button
              onClick={handleAttendanceToggle}
              disabled={attendMutation.isPending}
              className={`px-4 py-2 rounded-md transition-colors ${
                isAttending
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {attendMutation.isPending ? '...' : isAttending ? 'Leave' : 'Join'}
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? '...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};