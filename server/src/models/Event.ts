import mongoose, { Schema, Document } from 'mongoose';
import { Event } from '../types';

interface EventDocument extends  Omit<Event, '_id'>, Document {}

const eventSchema = new Schema<EventDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export const EventModel = mongoose.model<EventDocument>('Event', eventSchema);