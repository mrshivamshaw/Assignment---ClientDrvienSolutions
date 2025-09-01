import express from 'express';
import { EventModel } from '../models/Event';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

export const eventRoutes = express.Router();

eventRoutes.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 10, visibility, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let query: any = {};
    
    if (req.user!.role === 'admin') {
      // Admin can see all events
      if (visibility) query.visibility = visibility;
    } else {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'private', createdBy: req.user!._id }
      ];
    }
    
    // Search functionality
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