export interface User {
  id: string
  email: string
  passwordHash: string
  role: 'student' | 'club_admin'
  createdAt: Date
}

export interface AuthPayload {
  userId: string
  email: string
  role: 'student' | 'club_admin'
}

export interface StudentProfile {
  id: string
  studentId: string
  tags: string[]
  updatedAt: Date
}

export type ClubType = 'arts' | 'sports' | 'academic' | 'charity' | 'tech'

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
  createdAt: Date
  updatedAt: Date
}

export interface ClubCreateInput {
  name: string
  description: string
  type: ClubType
  tags: string[]
  capacity: number
  photos?: string[]
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface Application {
  id: string
  studentId: string
  clubId: string
  formData: Record<string, string>
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  message: string
  type: 'application_status' | 'system'
  isRead: boolean
  createdAt: Date
}
