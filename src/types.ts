/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'resident' | 'official';
export type ResidentMode = 'donor' | 'beneficiary';

export interface Donation {
  id: string;
  donorName?: string;
  donorUid?: string;
  item: string;
  specificType?: string;
  quantity: number;
  value?: number;
  status: 'pending_donation' | 'available' | 'pending_application' | 'approved' | 'released' | 'declined' | 'cancelled' | 'completed';
  date: string;
  beneficiaryName?: string;
  beneficiaryUid?: string;
  applicationReason?: string;
  requirements?: string;
  declineReason?: string;
  isApplication?: boolean;
  source?: string;
  pickupDeadline?: string;
  submissionDeadline?: string;
  residentDeliveryDate?: string;
  residentDeliveryTime?: string;
  adminDeadlineDate?: string;
  adminDeadlineTime?: string;
}

export interface Project {
  id: string;
  title: string;
  desc: string;
  purok?: string;
  specificLocation?: string;
  votes: number;
  status: 'pending' | 'approved' | 'declined';
  suggestedBy: string;
  suggestedByUid?: string;
  date: string;
  declineReason?: string;
}

export interface AuditRequest {
  id: string;
  name: string;
  requesterUid?: string;
  address: string;
  reason: string;
  status: 'pending' | 'responded';
  date: string;
  responseReport?: string;
}

export interface AuditReport {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  fileUrl?: string;
}

export interface Budget {
  category: string;
  allocated: number;
  spent: number;
}

export interface Official {
  id: string;
  name: string;
  position: string;
  term: string;
  photo: string;
  email?: string;
  phone?: string;
  order?: number;
  streets?: string[];
}

export interface ProjectSuggestion {
  id: string;
  title: string;
  description: string;
  suggestedBy: string;
  status: 'pending' | 'reviewed' | 'approved';
  votes: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'update' | 'event';
  date: string;
  color?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderProfile?: {
    fullName: string;
    nickname?: string;
    address: string;
    contact: string;
    purok: string;
    gender?: string;
    photoURL?: string;
  };
  receiverId: string; // 'admin' or specific userId
  text: string;
  imageUrl?: string;
  timestamp: string;
  createdAt?: any;
  status: 'unread' | 'read';
  isAutomated?: boolean;
}

export interface Notification {
  id: string;
  userId: string; // 'admin' or the resident's name
  title: string;
  message: string;
  type: 'donation' | 'application' | 'feedback' | 'system' | 'appointment' | 'audit' | 'project' | 'transparency';
  status: 'unread' | 'read';
  date: string;
  targetTab?: string;
  targetSubTab?: string;
}

export interface BarangayService {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  estimatedProcessingTime: string;
  assignedOfficialId?: string;
}

export interface Appointment {
  id: string;
  residentId: string;
  residentName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
  officialId?: string;
  officialName?: string;
  declineReason?: string;
  rescheduleCount: number;
  additionalDescription?: string;
  createdAt: string;
  reminderSent?: boolean;
}

export interface OfficialAvailability {
  id: string;
  officialId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxSlotsPerTimeSlot: number;
}

export interface Call {
  id: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  status: 'ringing' | 'answered' | 'declined' | 'ended' | 'missed';
  offer?: any;
  answer?: any;
  timestamp: string;
  createdAt?: any;
}

export interface Achievement {
  id: string;
  title: string;
  year: string;
  desc: string;
  icon: string;
  colorTheme: string;
}
