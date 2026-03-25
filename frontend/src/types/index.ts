// src/types/index.ts

// Interview Mode Enum - matching what Dashboard.tsx expects
export enum InterviewMode {
  TEXT_TO_TEXT = 'text-to-text',
  VOICE_TO_TEXT = 'voice-to-text',
  VOICE_TO_VOICE = 'voice-to-voice'
}

// User Profile Types
export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  created_at?: string;
  createdAt?: Date;
  updatedAt?: Date;
  interview_history?: any[];
  total_interviews?: number;
}

// Interview Types
export interface Interview {
  id: string;
  userId: string;
  mode: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  ended_at?: string;
  score?: number;
  feedback?: any;
}

// Question Types
export interface Question {
  id: string;
  text: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Answer Types
export interface Answer {
  questionId: string;
  response: string;
  timestamp: Date;
}

// Feedback Score Detail
export interface FeedbackScore {
  score: number;
  feedback: string;
}

// Extended Feedback Types matching FeedbackScreen expectations
export interface Feedback {
  session_id?: string;
  interviewId?: string;
  overall_score: number;
  overall_feedback: string;
  clarity: FeedbackScore;
  confidence: FeedbackScore;
  relevance: FeedbackScore;
  technical_knowledge: FeedbackScore;
  communication_skills: FeedbackScore;
  strengths: string[];
  areas_for_improvement: string[];
  completion_rate?: string;
  questions_attempted?: number;
  questions_skipped?: number;
  detailedFeedback?: string;
  createdAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Interview Session Types
export interface InterviewSession {
  session_id: string;
  id?: string;
  user_id: string;
  mode: string;
  question: string;
  round: string;
  question_index: number;
  questions?: Question[];
  answers?: Answer[];
  currentQuestionIndex?: number;
  isActive?: boolean;
  status?: string;
}