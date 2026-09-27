export enum UserRole {
  PROVIDER = 'PROVIDER',
  SEEKER = 'SEEKER',
  BOTH = 'BOTH',
  ADMIN = 'ADMIN'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  IN_ACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE'
}

export enum ReportTargetType {
  SERVICE = 'SERVICE',
  REVIEW = 'REVIEW',
  USER = 'USER',
  MESSAGE = 'MESSAGE'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  total_reviews: number;
  verified: boolean;
  is_active: boolean;
  slug: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  price: number;
  price_unit: string; // 'hr', 'flat', 'project'
  min_duration: number; // minutes
  max_duration: number; // minutes
  images: string[];
  location: string;
  latitude: number;
  longitude: number;
  is_remote: boolean;
  is_on_site: boolean;
  service_address?: string;
  service_latitude?: number;
  service_longitude?: number;
  service_radius?: number; // km
  availability?: any; // JSON schedule representation
  status: ServiceStatus;
  views: number;
  featured: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  seeker_id: string;
  provider_id: string;
  booking_date: string; // ISO date string
  duration: number; // minutes
  total_price: number;
  status: BookingStatus;
  notes?: string;
  cancellation_reason?: string;
  completed_at?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  // Join fields for convenience
  service_title?: string;
  provider_name?: string;
  seeker_name?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  service_id: string;
  rating: number;
  comment: string;
  professionalism: number; // 1-5
  quality: number; // 1-5
  punctuality: number; // 1-5
  response?: string;
  response_at?: string;
  created_at: string;
  updated_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id?: string;
  content: string;
  attachments?: string[];
  is_read: boolean;
  read_at?: string;
  message_type: MessageType;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string; // 'BOOKING', 'MESSAGE', 'REVIEW', 'SYSTEM'
  title: string;
  message: string;
  metadata?: any;
  link?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  parent_id?: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePackage {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  services?: { service_id: string; quantity: number }[]; // custom representation
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description: string;
  status: ReportStatus;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
}

export interface ProviderSkill {
  id: string;
  provider_id: string;
  skill_name: string;
  skill_level: SkillLevel;
  years_experience: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderCertification {
  id: string;
  provider_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderPortfolio {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  image_urls: string[];
  project_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  id: string;
  provider_id: string;
  day_of_week: number; // 0 (Sunday) to 6 (Saturday)
  is_open: boolean;
  open_time: string; // HH:MM
  close_time: string; // HH:MM
  break_start?: string; // HH:MM
  break_end?: string; // HH:MM
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  provider_id: string;
  date: string; // YYYY-MM-DD
  name: string;
  is_recurring: boolean;
  created_at: string;
}

export interface BookingRule {
  id: string;
  provider_id: string;
  min_notice_hours: number;
  max_bookings_per_day: number;
  buffer_time_minutes: number;
  auto_confirm: boolean;
  cancellation_policy: string; // 'flexible', 'moderate', 'strict'
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: string;
  provider_id: string;
  customer_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  provider_id: string;
  name: string;
  subject?: string;
  content: string;
  category: string; // 'BOOKING_CONFIRMATION', 'BOOKING_REMINDER', etc.
  variables?: string[];
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  booking_id: string;
  recipient_email: string;
  recipient_phone?: string;
  reminder_type: 'EMAIL' | 'SMS' | 'BOTH';
  reminder_time: string; // ISO string
  sent_at?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderSettings {
  id: string;
  provider_id: string;
  enabled: boolean;
  reminder_hours: number;
  send_email: boolean;
  send_sms: boolean;
  sms_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ProviderApplication {
  id: string;
  provider_id: string;
  business_name: string;
  tax_id: string;
  gov_id_url: string;
  insurance_url?: string;
  verification_statement?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

