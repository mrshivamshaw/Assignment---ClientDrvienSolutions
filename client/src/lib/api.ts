import type { AxiosInstance } from "axios";
import axios from "axios";
import type { CreateEventData, Event, EventsResponse, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async registerUser(userData: {
    firebaseUid: string;
    email: string;
    displayName: string;
    role?: "admin" | "user";
  }): Promise<User> {
    const { data } = await this.client.post<User>("/auth/register", userData);
    return data;
  }

  async getProfile(): Promise<User> {
    const { data } = await this.client.get<User>("/auth/profile");
    return data;
  }

  async getEvents(params: {
    page?: number;
    limit?: number;
    visibility?: string;
    search?: string;
  } = {}): Promise<EventsResponse> {
    const { data } = await this.client.get<EventsResponse>("/events", {
      params,
    });
    return data;
  }

  async getEvent(id: string): Promise<Event> {
    const { data } = await this.client.get<Event>(`/events/${id}`);
    return data;
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    const { data } = await this.client.post<Event>("/events", eventData);
    return data;
  }

  async updateEvent(
    id: string,
    eventData: Partial<CreateEventData>
  ): Promise<Event> {
    const { data } = await this.client.put<Event>(`/events/${id}`, eventData);
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.client.delete(`/events/${id}`);
  }

  async toggleAttendance(id: string): Promise<Event> {
    const { data } = await this.client.post<Event>(`/events/${id}/attend`);
    return data;
  }
}

export const apiClient = new ApiClient();
