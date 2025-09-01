import express from 'express';
import { EventModel } from '../models/Event';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';
import { createEventSchema, updateEventSchema } from '../validation/schemas';

export const eventRoutes = express.Router();

eventRoutes.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 10, visibility, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let query: any = {};
    
    if (req.user!.role === 'admin') {
      if (visibility) query.visibility = visibility;
    } else {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'private', createdBy: req.user!._id }
      ];
    }
    
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    const events = await EventModel
      .find(query)
      .populate('createdBy', 'displayName email')
      .populate('attendees', 'displayName email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit));
      
    const total = await EventModel.countDocuments(query);
    
    res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

eventRoutes.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const event = await EventModel
      .findById(req.params.id)
      .populate('createdBy', 'displayName email')
      .populate('attendees', 'displayName email');
      
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.visibility === 'private' && 
        req.user!.role !== 'admin' && 
        event.createdBy._id.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
});

eventRoutes.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createEventSchema.parse(req.body);
    
    const event = new EventModel({
      ...validatedData,
      createdBy: req.user!._id,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate)
    });
    
    const savedEvent = await event.save();
    const populatedEvent = await EventModel
      .findById(savedEvent._id)
      .populate('createdBy', 'displayName email');
      
    res.status(201).json(populatedEvent);
  } catch (error) {
    next(error);
  }
});

eventRoutes.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validatedData = updateEventSchema.parse(req.body);
    
    const event = await EventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check permissions
    if (req.user!.role !== 'admin' && 
        event.createdBy.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updateData: any = { ...validatedData };
    if (validatedData.startDate) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate) updateData.endDate = new Date(validatedData.endDate);
    
    const updatedEvent = await EventModel
      .findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('createdBy', 'displayName email')
      .populate('attendees', 'displayName email');
      
    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
});

eventRoutes.delete('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res, next) => {
  try {
    const event = await EventModel.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

eventRoutes.post('/:id/attend', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const event = await EventModel.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event is accessible
    if (event.visibility === 'private' && 
        req.user!.role !== 'admin' && 
        event.createdBy.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const userId = req.user!._id.toString();
    const isAttending = event.attendees.includes(userId as any);
    
    if (isAttending) {
      event.attendees = event.attendees.filter(id => id.toString() !== userId);
    } else {
      event.attendees.push(userId as any);
    }
    
    await event.save();
    
    const updatedEvent = await EventModel
      .findById(event._id)
      .populate('createdBy', 'displayName email')
      .populate('attendees', 'displayName email');
      
    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
});