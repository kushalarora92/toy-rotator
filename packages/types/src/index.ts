/**
 * Shared types for the app
 * Used across frontend, backend, and cloud functions
 */

/**
 * Account deletion status
 */
export const DELETION_STATUS = {
  ACTIVE: 'active',
  SCHEDULED_FOR_DELETION: 'scheduled_for_deletion',
} as const;

export type DeletionStatus = typeof DELETION_STATUS[keyof typeof DELETION_STATUS];

/**
 * User profile data structure stored in Firestore
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  status?: 'active' | 'inactive';
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  // Account deletion tracking
  deletionStatus?: DeletionStatus; // Current deletion status (default: 'active')
  deletionScheduledAt?: any; // Firestore Timestamp - when deletion was requested
  deletionExecutionDate?: string; // ISO date string - when deletion will execute (30 days after request)
}

/**
 * Update profile request data
 * Used when updating user profile via Cloud Functions
 */
export interface UpdateProfileData {
  displayName?: string;
  status?: 'active' | 'inactive';
  [key: string]: any; // Allow additional custom fields
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
