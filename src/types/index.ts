export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: number;
  name: string;
  email?: string;
  role: UserRole;
  department?: string | null;
  active?: number;
}

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Complaint {
  id: number;
  tracking_id: string;
  user_id?: number;
  title: string;
  description: string;
  category: string;
  summary?: string;
  urgency: number; // 0 - 100
  priority: PriorityLevel;
  department: string;
  emergency: boolean | number;
  factors?: string[];
  ai_engine?: string;
  address?: string;
  lat: number;
  lng: number;
  photo?: string | null;
  duplicate_of?: number | null;
  eta?: string;
  status: ComplaintStatus;
  officer_id?: number | null;
  created_at?: string;
  resolved_at?: string | null;
  feedback_rating?: number | null;
  feedback_text?: string | null;
  timeline?: ComplaintEvent[];
}

export interface ComplaintEvent {
  id?: number;
  complaint_id?: number;
  status: string;
  note: string;
  evidence?: string | null;
  actor_id?: number;
  created_at?: string;
}

export interface AIAnalysis {
  category: string;
  summary: string;
  urgency: number;
  priority: PriorityLevel;
  department: string;
  emergency: boolean;
  factors: string[];
  engine: string;
}

export interface DuplicateMatch {
  id: number;
  tracking_id: string;
  title: string;
  description: string;
  category: string;
  similarity: number;
  lat?: number;
  lng?: number;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  message: string;
  read: number | boolean;
  created_at: string;
}

export interface SafetyAlert {
  id: number;
  tracking_id: string;
  title: string;
  description: string;
  category: string;
  urgency: number;
  priority: PriorityLevel;
  status: string;
  address?: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface DepartmentMetric {
  name: string;
  total: number;
  resolved: number;
  pending: number;
  officers: number;
}

export interface AnalyticsData {
  total: number;
  duplicates: number;
  avgResolutionDays: number | null;
  byCategory: Array<{ k: string; n: number }>;
  byPriority: Array<{ k: string; n: number }>;
  byStatus: Array<{ k: string; n: number }>;
  byDepartment: Array<{ k: string; total: number; resolved: number }>;
  trend: Array<{ k: string; n: number }>;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  details: string;
  created_at: string;
}

export type TabScreen =
  | 'home'
  | 'report'
  | 'map'
  | 'complaints'
  | 'profile'
  | 'safety'
  | 'officer'
  | 'admin'
  | 'analytics';
