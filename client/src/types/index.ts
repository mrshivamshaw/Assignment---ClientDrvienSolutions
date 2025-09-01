export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  visibility: 'public' | 'private';
  createdBy: {
    _id: string;
    displayName: string;
    email: string;
  };
  attendees: {
    _id: string;
    displayName: string;
    email: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  visibility: 'public' | 'private';
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}