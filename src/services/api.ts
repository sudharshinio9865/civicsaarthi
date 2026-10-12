import { Platform } from 'react-native';
import {
  User,
  Complaint,
  AIAnalysis,
  DuplicateMatch,
  NotificationItem,
  SafetyAlert,
  DepartmentMetric,
  AnalyticsData,
  AuditLog,
} from '../types';

// Intelligent default: 10.0.2.2 for Android emulator, localhost for iOS/Web/Node
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

let currentBaseUrl = `${DEFAULT_HOST}/api`;
let authToken: string | null = null;
let currentUser: User | null = null;

export const ApiConfig = {
  getBaseUrl: () => currentBaseUrl,
  setBaseUrl: (url: string) => {
    currentBaseUrl = url.replace(/\/+$/, '');
    if (!currentBaseUrl.endsWith('/api')) {
      currentBaseUrl += '/api';
    }
  },
  getToken: () => authToken,
  setToken: (token: string | null) => {
    authToken = token;
  },
  getUser: () => currentUser,
  setUser: (user: User | null) => {
    currentUser = user;
  },
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${currentBaseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}: ${res.statusText}`);
    }
    return data as T;
  } catch (err: any) {
    if (err.message && err.message.includes('Network request failed')) {
      throw new Error(
        `Cannot connect to CivicSaarthi server at ${url}. Ensure the server is running on port 4000 and the IP address is correct.`
      );
    }
    throw err;
  }
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authToken = res.token;
    currentUser = res.user;
    return res;
  },

  async signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    authToken = res.token;
    currentUser = res.user;
    return res;
  },

  logout() {
    authToken = null;
    currentUser = null;
  },

  // AI & Duplicates Preview
  async analyzeIssue(description: string, lat: number, lng: number): Promise<{ ai: AIAnalysis; duplicates: DuplicateMatch[] }> {
    return request<{ ai: AIAnalysis; duplicates: DuplicateMatch[] }>('/analyze', {
      method: 'POST',
      body: JSON.stringify({ description, lat, lng }),
    });
  },

  // Complaints
  async createComplaint(payload: {
    title: string;
    description: string;
    category?: string;
    address?: string;
    lat: number;
    lng: number;
    photoUri?: string;
  }): Promise<{ tracking_id: string; id: number; ai: AIAnalysis; duplicates: DuplicateMatch[]; eta: string }> {
    const body: any = {
      title: payload.title,
      description: payload.description,
      address: payload.address || '',
      lat: Number(payload.lat),
      lng: Number(payload.lng),
    };
    if (payload.category) body.category = payload.category;

    return request('/complaints', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getComplaints(params: {
    q?: string;
    status?: string;
    priority?: string;
    category?: string;
    page?: number;
    size?: number;
  } = {}): Promise<{ total: number; rows: Complaint[] }> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.category) query.append('category', params.category);
    if (params.page) query.append('page', String(params.page));
    if (params.size) query.append('size', String(params.size));

    const qs = query.toString();
    return request<{ total: number; rows: Complaint[] }>(`/complaints${qs ? `?${qs}` : ''}`);
  },

  async trackComplaint(trackingId: string): Promise<Complaint> {
    return request<Complaint>(`/track/${encodeURIComponent(trackingId.trim())}`);
  },

  async updateComplaint(
    id: number,
    data: {
      status?: string;
      officer_id?: number;
      priority?: string;
      note?: string;
    }
  ): Promise<{ ok: boolean; status: string }> {
    return request<{ ok: boolean; status: string }>(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async reopenComplaint(id: number, reason: string): Promise<{ ok: boolean; status: string }> {
    return request<{ ok: boolean; status: string }>(`/complaints/${id}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async submitFeedback(id: number, rating: number, text?: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/complaints/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, text }),
    });
  },

  // Map markers
  async getMapMarkers(): Promise<Array<Complaint>> {
    return request<Array<Complaint>>('/map');
  },

  // Safety & SOS
  async triggerSOS(data: { lat: number; lng: number; address?: string; hazardType?: string; details?: string }): Promise<{
    ok: boolean;
    tracking_id: string;
    message: string;
    emergencyContacts: Record<string, string>;
  }> {
    return request('/safety/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSafetyAlerts(): Promise<{ alerts: SafetyAlert[]; hotlines: Record<string, string> }> {
    return request('/safety/alerts');
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications');
  },

  async markNotificationRead(id: number): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/notifications/read-all', { method: 'PATCH' });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return request<AnalyticsData>('/analytics');
  },

  // Departments
  async getDepartments(): Promise<DepartmentMetric[]> {
    return request<DepartmentMetric[]>('/departments');
  },

  // Admin
  async getUsers(): Promise<User[]> {
    return request<User[]>('/admin/users');
  },

  async updateUser(id: number, data: { role?: string; department?: string; active?: number }): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/admin/audit');
  },

  async resetDemoData(): Promise<{ ok: boolean; count: number }> {
    return request<{ ok: boolean; count: number }>('/admin/reset-demo', {
      method: 'POST',
    });
  },
};
