// Roadmap Types (from JSON)
export interface RoadmapResource {
  title: string;
  type: "article" | "course" | "video" | "playlist" | "search" | "playlist-search" | "roadmap";
  url: string;
  price?: "free" | "paid";
  priceAmount?: number;
  duration?: string;
  language?: "fa" | "en";
  description?: string;
  /** برای مرتب‌سازی؛ اختیاری */
  priorityGroup?: number;
  category?: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  resources: RoadmapResource[];
  recommendation?: "personal" | "alternative" | "flexible";
  /** اگر پر باشد، با کلیک روی این مرحله نقشهٔ راه مرتبط در تب جدید باز می‌شود */
  linkedRoadmapSlug?: string;
}

export interface RoadmapCategory {
  id: string;
  title: string;
  description: string;
  order: number;
  recommendation?: "personal" | "alternative" | "flexible";
  children?: RoadmapStep[];
  resources?: RoadmapResource[];
  /** اگر پر باشد، نود پدر به این نقشهٔ راه لینک دارد و با کلیک در تب جدید باز می‌شود */
  linkedRoadmapSlug?: string;
}

export interface RoadmapProject {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  requirements: string[];
}

export interface Roadmap {
  slug: string;
  title: string;
  description: string;
  steps: RoadmapCategory[];
  projects: RoadmapProject[];
}

export interface RoadmapSummary {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  totalSteps: number;
}

export interface RoadmapIndex {
  roadmaps: RoadmapSummary[];
}

// Donation Types (from JSON)
export interface DonationData {
  monthlyInfrastructureCost: number;
  cardNumber: string;
  cardOwner: string;
  totalCollected: number;
  fundedUntil: string;
  currency: string;
}

// User Types
export type UserRole = "USER" | "MENTOR" | "ADMIN";

export interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
}

// Forum Types
export interface ForumQuestionWithDetails {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: UserPublic;
  _count: {
    answers: number;
  };
}

export interface ForumAnswerWithDetails {
  id: string;
  content: string;
  isAccepted: boolean;
  createdAt: string;
  user: UserPublic;
  votes: {
    likes: number;
    dislikes: number;
    userVote: "LIKE" | "DISLIKE" | null;
  };
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
