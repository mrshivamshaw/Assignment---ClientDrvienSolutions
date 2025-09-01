import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types';

interface UserDocument extends  Omit<User, '_id'>, Document {}

const userSchema = new Schema<UserDocument>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);