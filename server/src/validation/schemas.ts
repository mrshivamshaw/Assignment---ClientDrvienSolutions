import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
  visibility: z.enum(['public', 'private']).default('public')
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const updateEventSchema = createEventSchema.partial();

export const userRegistrationSchema = z.object({
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  email: z.string().email('Invalid email format'),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name too long'),
  role: z.enum(['admin', 'user']).default('user')
});
