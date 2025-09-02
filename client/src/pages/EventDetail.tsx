import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDateForInput } from '../utils/dateUtils';
import { type CreateEventData } from '../types';
import toast from 'react-hot-toast';

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
  visibility: z.enum(['public', 'private']),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CreateEventData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    visibility: 'public',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => apiClient.getEvent(id!),
    enabled: !!id,
  });

  const attendMutation = useMutation({
    mutationFn: () => apiClient.toggleAttendance(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(isAttending ? 'Left event' : 'Joined event');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update attendance');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateEventData>) => apiClient.updateEvent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsEditing(false);
      toast.success('Event updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteEvent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
      navigate('/events');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/events" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Back to Events
        </Link>
      </div>
    );
  }

  const isCreator = event.createdBy._id === currentUser?._id;
  const isAttending = event.attendees.some(attendee => attendee._id === currentUser?._id);
  const canEdit = isCreator;
  console.log("--------------",currentUser);
  
  const canDelete = currentUser?.role === 'admin';

  const handleEdit = () => {
    setEditData({
      title: event.title,
      description: event.description,
      startDate: formatDateForInput(event.startDate),
      endDate: formatDateForInput(event.endDate),
      location: event.location,
      visibility: event.visibility,
    });
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = updateEventSchema.parse(editData);
      updateMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        // @ts-ignore
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Event</h1>

        <form onSubmit={handleUpdateSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
            <input
              type="text"
              name="title"
              value={editData.title}
              onChange={handleEditChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={editData.description}
              onChange={handleEditChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                name="startDate"
                value={editData.startDate}
                onChange={handleEditChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                name="endDate"
                value={editData.endDate}
                onChange={handleEditChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={editData.location}
              onChange={handleEditChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <select
              name="visibility"
              value={editData.visibility}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center space-x-4 text-blue-100">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  event.visibility === 'public' 
                    ? 'bg-green-500 bg-opacity-20' 
                    : 'bg-yellow-500 bg-opacity-20'
                }`}>
                  {event.visibility}
                </span>
                {isCreator && (
                  <span className="px-3 py-1 bg-blue-500 bg-opacity-20 rounded-full text-sm">
                    Creator
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="bg-white bg-opacity-20 text-black px-4 py-2 rounded-md hover:bg-opacity-30 transition-colors"
                >
                  Edit
                </button>
              )}
              
              {!isCreator && (
                <button
                  onClick={() => attendMutation.mutate()}
                  disabled={attendMutation.isPending}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    isAttending
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white text-blue-600 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  {attendMutation.isPending ? '...' : isAttending ? 'Leave Event' : 'Join Event'}
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? '...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>

              {/* Attendees */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Attendees ({event.attendees.length})
                </h2>
                {event.attendees.length === 0 ? (
                  <p className="text-gray-500">No one has joined this event yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.attendees.map((attendee) => (
                      <div key={attendee._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {attendee.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{attendee.displayName}</p>
                          <p className="text-sm text-gray-500">{attendee.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">📅</span>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(event.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">🏁</span>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{formatDate(event.endDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">📍</span>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">👤</span>
                    <div>
                      <p className="text-sm text-gray-500">Organizer</p>
                      <p className="font-medium">{event.createdBy.displayName}</p>
                      <p className="text-sm text-gray-500">{event.createdBy.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendees:</span>
                    <span className="font-medium">{event.attendees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(event.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility:</span>
                    <span className="font-medium capitalize">{event.visibility}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/events" className="text-blue-600 hover:text-blue-800 transition-colors">
          ← Back to Events
        </Link>
      </div>
    </div>
  );
};