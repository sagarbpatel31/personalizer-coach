// Core Types
export interface Question {
  id: string;
  role: RoleType;
  domain: string;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type RoleType = 'embedded' | 'swe' | 'ml_dl' | 'genai' | 'coding';

export interface Domain {
  name: string;
  description: string;
  skills?: string[];
}

export interface Role {
  name: string;
  priority: number;
  domains: Record<string, Domain>;
}

export interface SkillsTaxonomy {
  roles: Record<RoleType, Role>;
}

// User Progress & Ratings
export interface DomainRating {
  mean: number;
  n: number; // number of questions answered
  lastUpdated: Date;
}

export interface UserRatings {
  [role: string]: {
    [domain: string]: DomainRating;
  };
}

// Quiz State
export interface QuizSession {
  currentQuestion: Question | null;
  questionsAnswered: number;
  correctAnswers: number;
  startTime: Date;
  endTime?: Date;
  targetRole: RoleType;
  targetDomain: string;
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  timeSpent: number;
  confidence?: number;
}

export interface QuizHistoryEntry {
  id: string;
  question: Question;
  userAnswer: number;
  correct: boolean;
  timeSpent: number;
  confidence: number;
  timestamp: Date;
}

// Daily Planning
export interface StudyBlock {
  id: string;
  type: 'quiz' | 'project' | 'applications' | 'study';
  duration: number; // minutes
  title: string;
  description: string;
  role?: RoleType;
  domain?: string;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

export interface DailyPlan {
  date: Date;
  totalHours: number;
  blocks: StudyBlock[];
  focus: RoleType;
  created: Date;
  lastUpdated: Date;
}

// Applications
export interface Application {
  id: string;
  company: string;
  position: string;
  role_type: RoleType;
  date_applied: string;
  status: 'applied' | 'interview_scheduled' | 'interviewed' | 'rejected' | 'offer' | 'accepted';
  application_url: string;
  notes: string;
  follow_up_date?: string;
  requirements_match: number; // 1-10
  priority: 'low' | 'medium' | 'high';
  contact_person?: string;
  interview_dates: string[];
  offer_details?: any;
}

// Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  category: 'consistency' | 'skill' | 'project' | 'application';
  icon: string;
  criteria: {
    type: string;
    target: number;
  };
}

export interface UserAchievement {
  achievementId: string;
  dateEarned: Date;
  points: number;
}

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  rolePriorities: RoleType[];
  currentLevel: number;
  totalXP: number;
  streak: number;
  lastActiveDate: Date;
  preferences: {
    dailyGoalHours: number;
    reminderTimes: string[];
    focusMode: boolean;
  };
}

// Storage
export interface LocalStorageData {
  ratings: UserRatings;
  profile: UserProfile;
  dailyPlans: DailyPlan[];
  achievements: UserAchievement[];
  applications: Application[];
  quizSessions: QuizSession[];
  quizHistory: QuizHistoryEntry[];
}