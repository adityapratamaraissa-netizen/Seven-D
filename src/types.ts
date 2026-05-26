/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role =
  | 'Admin'
  | 'Ketua Kelas'
  | 'Wakil Ketua'
  | 'Bendahara 1'
  | 'Bendahara 2'
  | 'Sekretaris 1'
  | 'Sekretaris 2'
  | 'Member';

export interface Student {
  id: number; // Nomor Absen (1 - 35)
  name: string;
  role: Role;
  xp: number;
  level: number;
  streak: number;
  isOnline: boolean;
  onlineStatus?: 'online' | 'offline' | 'typing' | 'idle';
  lastSeen?: string;
  avatar: string; // URL can be a premium default or custom
  banner: string; // HEX color or gradient CSS
  bio: string;
  customStatus?: string;
  badges: string[];
  loginCode?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  role: Role;
  date: string;
  category: 'PR' | 'Info' | 'Event' | 'Ujian';
  dueDate?: string; // Khusus PR / Event
}

export interface KasRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  recordedBy: string;
}

export interface AttendanceRecord {
  studentId: number;
  date: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Telat';
  time?: string;
}

export interface ChatMessage {
  id: string;
  studentId: number;
  studentName: string;
  avatar: string;
  role: Role;
  content: string;
  timestamp: string;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: string;
  };
  reactions: Array<{
    emoji: string;
    count: number;
    users: number[]; // studentIds who reacted
  }>;
  replyTo?: {
    id: string;
    name: string;
    content: string;
  };
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  type: 'quiz' | 'focus' | 'kas' | 'piket' | 'absensi';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  category: 'attendance' | 'finance' | 'learning' | 'social';
}

export interface VirtualPet {
  name: string;
  type: 'Neko' | 'Shiba' | 'Dino';
  level: number;
  xp: number;
  status: 'Happy' | 'Studying' | 'Sleepy' | 'Energetic';
  streakRequiredForNextLevel: number;
}
