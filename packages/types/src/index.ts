/**
 * Shared types for ToyRotator
 * Used across frontend, backend, and cloud functions
 */

// ============================================================
// Account & Auth
// ============================================================

export const DELETION_STATUS = {
  ACTIVE: 'active',
  SCHEDULED_FOR_DELETION: 'scheduled_for_deletion',
} as const;

export type DeletionStatus = typeof DELETION_STATUS[keyof typeof DELETION_STATUS];

// ============================================================
// Toy Categories (built-in)
// ============================================================

export const TOY_CATEGORIES = [
  'Building & Construction',
  'Pretend Play & Imagination',
  'Arts & Crafts',
  'Puzzles & Problem Solving',
  'Vehicles & Transport',
  'Dolls & Figures',
  'Musical & Sound',
  'Outdoor & Active Play',
  'Books & Learning',
  'Sensory & Comfort',
  'Other',
] as const;

export type ToyCategory = typeof TOY_CATEGORIES[number];

// ============================================================
// Toy Status
// ============================================================

export const TOY_STATUSES = ['active', 'resting', 'retired'] as const;
export type ToyStatus = typeof TOY_STATUSES[number];

// ============================================================
// Toy Source
// ============================================================

export type ToySource = 'manual' | 'ai';

// ============================================================
// Skill Tags (built-in suggestions)
// ============================================================

export const SKILL_TAGS = [
  'Fine Motor',
  'Gross Motor',
  'Language & Communication',
  'Problem Solving',
  'Creativity & Imagination',
  'Social & Emotional',
  'Sensory Exploration',
  'Cause & Effect',
  'Spatial Awareness',
  'Music & Rhythm',
  'Literacy & Reading',
  'Numeracy & Math',
  'Science & Discovery',
  'Self-Care & Independence',
] as const;

export type SkillTag = typeof SKILL_TAGS[number];

// ============================================================
// Age Range
// ============================================================

export interface AgeRange {
  minMonths: number;
  maxMonths: number;
}

// ============================================================
// Rotation Duration Options
// ============================================================

export const ROTATION_DURATIONS = [1, 2, 3, 4, 7, 14, 30] as const;
export type RotationDuration = typeof ROTATION_DURATIONS[number];

// ============================================================
// Child Profile
// ============================================================

export interface RotationSettings {
  displayCount: number; // how many toys displayed at once (e.g. 10)
  durationDays: RotationDuration; // rotation length in days
  reminderTime?: string; // ISO time string (e.g. "09:00")
}

export interface ChildProfile {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date string
  interests: string[];
  rotationSettings: RotationSettings;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface CreateChildProfileData {
  name: string;
  dateOfBirth: string;
  interests?: string[];
  rotationSettings?: Partial<RotationSettings>;
}

export interface UpdateChildProfileData {
  name?: string;
  dateOfBirth?: string;
  interests?: string[];
  rotationSettings?: Partial<RotationSettings>;
}

// ============================================================
// Toy
// ============================================================

export interface Toy {
  id: string;
  name: string;
  category: ToyCategory;
  ageRange?: AgeRange;
  skillTags: SkillTag[];
  source: ToySource;
  status: ToyStatus;
  imageUrl?: string; // Firebase Storage URL
  notes?: string;
  childId?: string; // optional link to a specific child
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateToyData {
  name: string;
  category: ToyCategory;
  ageRange?: AgeRange;
  skillTags?: SkillTag[];
  source?: ToySource;
  status?: ToyStatus;
  imageUrl?: string;
  notes?: string;
  childId?: string;
}

export interface UpdateToyData {
  name?: string;
  category?: ToyCategory;
  ageRange?: AgeRange;
  skillTags?: SkillTag[];
  status?: ToyStatus;
  imageUrl?: string;
  notes?: string;
  childId?: string;
}

// ============================================================
// Rotation
// ============================================================

export type RotationSource = 'manual' | 'ai';

export interface Rotation {
  id: string;
  childId: string; // which child this rotation is for
  startDate: string; // ISO date
  endDate: string; // ISO date
  toyIds: string[];
  source: RotationSource;
  insightSummary?: string; // AI-generated or empty for manual
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateRotationData {
  childId: string;
  toyIds: string[];
  startDate?: string; // defaults to today
  durationDays?: number; // overrides child's default
  source?: RotationSource;
  insightSummary?: string;
}

// ============================================================
// Feedback
// ============================================================

export type EngagementLevel = 'liked' | 'neutral' | 'ignored';

export interface Feedback {
  id: string;
  toyId: string;
  rotationId: string;
  childId: string;
  engagement: EngagementLevel;
  notes?: string;
  createdAt?: any;
}

export interface CreateFeedbackData {
  toyId: string;
  rotationId: string;
  childId: string;
  engagement: EngagementLevel;
  notes?: string;
}

// ============================================================
// Subscription
// ============================================================

export const SUBSCRIPTION_TIERS = ['free', 'trial', 'paid'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

export interface AiUsageCounters {
  rotationSuggestionsToday: number;
  lastRotationSuggestionDate?: string; // ISO date for daily reset
  toyRecognitionsThisMonth: number;
  lastToyRecognitionMonth?: string; // YYYY-MM for monthly reset
  spaceAnalysesThisMonth: number;
  lastSpaceAnalysisMonth?: string;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  trialStartDate?: string; // ISO date
  trialEndDate?: string; // ISO date
  active: boolean;
  revenuecatCustomerId?: string;
  aiUsageCounters: AiUsageCounters;
}

// ============================================================
// Collaboration / Caregiver
// ============================================================

export type CaregiverRole = 'owner' | 'caregiver';
export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface Caregiver {
  uid: string;
  email: string;
  displayName?: string;
  role: CaregiverRole;
  inviteStatus: InviteStatus;
  invitedAt?: any;
  joinedAt?: any;
}

export interface Household {
  id: string; // same as owner's uid
  ownerUid: string;
  members: Caregiver[];
  createdAt?: any;
  updatedAt?: any;
}

export interface InviteCaregiverData {
  email: string;
}

// ============================================================
// Space Analysis
// ============================================================

export interface SpacePhoto {
  id: string;
  imageUrl: string;
  basicObservations?: string[]; // rule-based, available to all
  aiInsights?: string; // AI-generated, paid only
  createdAt?: any;
}

// ============================================================
// Onboarding
// ============================================================

export interface OnboardingStatus {
  completed: boolean;
  completedAt?: any;
}

// ============================================================
// User Profile (extended)
// ============================================================

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  status?: 'active' | 'inactive';
  // ToyRotator-specific
  onboardingCompleted?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  householdId?: string; // the household this user belongs to (owner's uid)
  // Timestamps
  createdAt?: any;
  updatedAt?: any;
  // Account deletion tracking
  deletionStatus?: DeletionStatus;
  deletionScheduledAt?: any;
  deletionExecutionDate?: string;
}

export interface UpdateProfileData {
  displayName?: string;
  status?: 'active' | 'inactive';
  onboardingCompleted?: boolean;
  [key: string]: any;
}

// ============================================================
// AI Request/Response types
// ============================================================

export interface AiRotationSuggestionRequest {
  childId: string;
  toyIds?: string[]; // optional subset; defaults to all active toys
}

export interface AiRotationSuggestionResponse {
  toyIds: string[];
  insightSummary: string;
  reasoning: string;
}

export interface AiToyRecognitionRequest {
  imageBase64: string; // base64 encoded image
}

export interface AiToyRecognitionResponse {
  name: string;
  category: ToyCategory;
  skillTags: SkillTag[];
  ageRange?: AgeRange;
  confidence: number; // 0-1
}

export interface AiSpaceAnalysisRequest {
  imageBase64: string;
}

export interface AiSpaceAnalysisResponse {
  observations: string[];
  insights: string;
  displayCapacitySuggestion?: number;
}

// ============================================================
// Generic API Response
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================================
// Push Notification types
// ============================================================

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt?: any;
}
