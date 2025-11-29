// User types
export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  user_type: 'individual' | 'corporate' | 'admin' | 'lawyer'
  is_active: boolean
  is_verified: boolean
  is_2fa_enabled: boolean
  created_at: string
  last_login?: string
  tc_kimlik?: string
  tax_number?: string
  company_name?: string
  address?: string
  bank_account_info?: string
}

export interface LoginRequest {
  email: string
  password: string
  otp_code?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
  user_type?: 'individual' | 'corporate'
  tc_kimlik?: string
  tax_number?: string
  company_name?: string
}

// Case types
export type CaseStatus = 'pending' | 'in_progress' | 'waiting_court' | 'completed' | 'archived'
export type CaseType = 'civil' | 'criminal' | 'commercial' | 'labor' | 'administrative' | 'execution' | 'other'

export interface CaseStage {
  id: string
  title: string
  status: 'pending' | 'current' | 'completed'
  order: number
}

export interface Case {
  id: number
  case_number: string
  title: string
  description?: string
  case_type: CaseType
  status: CaseStatus
  court_name?: string
  file_number?: string
  client_id: number
  start_date: string
  next_hearing_date?: string
  completion_date?: string
  created_at: string
  updated_at?: string
  stages?: CaseStage[]
}

export type TimelineEventType = 'HEARING' | 'REPORT' | 'DECISION' | 'PAYMENT' | 'DOCUMENT' | 'GENERIC'

export interface TimelineEvent {
  id: number
  case_id: number
  title: string
  description?: string
  event_date: string
  event_type: TimelineEventType
  stage_id?: string
  created_at: string
}

export interface CaseCreate {
  case_number: string
  title: string
  description?: string
  case_type: CaseType
  court_name?: string
  file_number?: string
  next_hearing_date?: string
}

export interface CaseUpdate extends Partial<CaseCreate> {
  status?: CaseStatus
  completion_date?: string
}

// Document types
export type DocumentType = 'contract' | 'petition' | 'decision' | 'evidence' | 'correspondence' | 'invoice' | 'other'

export interface Document {
  id: number
  filename: string
  original_filename: string
  file_size?: number
  mime_type?: string
  document_type: DocumentType
  description?: string
  is_visible_to_client: boolean
  user_id: number
  case_id?: number
  uploaded_at: string
  updated_at?: string
}

// API Response types
export interface ApiError {
  detail: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}
