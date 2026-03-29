export type ClubType = 'arts' | 'sports' | 'academic' | 'charity' | 'tech'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface User {
  id: string
  email: string
  role: 'student' | 'club_admin'
  createdAt: string
}

export interface StudentProfile {
  id: string
  studentId: string
  tags: string[]
  updatedAt: string
}

export interface Club {
  id: string
  adminId: string
  name: string
  description: string
  type: ClubType
  tags: string[]
  capacity: number
  currentCount: number
  photos: string[]
  isOpen: boolean
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: string
  studentId: string
  clubId: string
  formData: Record<string, string>
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  type: 'application_status' | 'system'
  isRead: boolean
  createdAt: string
}

export interface RecommendationItem {
  club: Club
  score: number
}

export interface ClubStats {
  total: number
  approved: number
  rejected: number
  pending: number
  withdrawn: number
}

export interface DailyTrend {
  date: string
  count: number
}

export interface TagDistribution {
  tag: string
  count: number
}
