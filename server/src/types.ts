import {Types} from "mongoose"

export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  visibility: 'public' | 'private';
  createdBy: Types.ObjectId;//userid
  attendees: string[];//attendies
  createdAt: Date;
  updatedAt: Date;
}