/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
  UserProfile,
  UpdateProfileData,
  ApiResponse,
  DELETION_STATUS,
} from "@my-app/types";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

/**
 * Sample HTTP function that responds with a greeting
 */
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

/**
 * Callable function to get user information
 * This function fetches user data from Firestore
 *
 * @param {object} request - The request object
 * @returns {object} User information from Firestore
 */
export const getUserInfo = onCall(async (request): Promise<UserProfile> => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to call this function"
    );
  }

  const userId = request.auth.uid;

  try {
    logger.info(`Fetching user info for userId: ${userId}`);

    // Get user document from Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      // If user doesn't exist, return basic info from auth
      logger.info(`User document not found for userId: ${userId}`);
      return {
        uid: userId,
        email: request.auth.token.email || null,
        displayName: request.auth.token.name || null,
        status: "inactive",
      };
    }

    // Return user data from Firestore
    const userData = userDoc.data();
    logger.info(`User info retrieved for userId: ${userId}`);

    return {
      uid: userId,
      email: request.auth.token.email || null,
      ...userData,
    };
  } catch (error) {
    logger.error("Error fetching user info:", error);
    throw new HttpsError(
      "internal",
      "Failed to fetch user information",
      error
    );
  }
});

/**
 * Callable function to create or update user profile
 *
 * @param {object} request - The request object containing profile data
 * @returns {object} Success message with updated data
 */
export const updateUserProfile = onCall(
  async (request): Promise<ApiResponse<UserProfile>> => {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to call this function"
      );
    }

    const userId = request.auth.uid;
    const profileData = request.data as UpdateProfileData;

    try {
      logger.info(`Updating user profile for userId: ${userId}`);

      // Prepare user document data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData: Record<string, any> = {
        ...profileData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Create or update user document
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        // First time creating profile
        userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      await userRef.set(userData, {merge: true});

      logger.info(`User profile updated for userId: ${userId}`);

      return {
        success: true,
        message: "Profile updated successfully",
        data: userData as UserProfile,
      };
    } catch (error) {
      logger.error("Error updating user profile:", error);
      throw new HttpsError(
        "internal",
        "Failed to update user profile",
        error
      );
    }
  }
);

/**
 * Callable function to schedule account deletion (30-day grace period)
 * Sets deletion status and schedules permanent deletion after 30 days
 *
 * @param {object} request - The request object (no data required)
 * @returns {object} Deletion scheduling confirmation with date
 */
export const scheduleAccountDeletion = onCall(
  async (request): Promise<ApiResponse<{ deletionDate: string }>> => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to call this function"
      );
    }

    const userId = request.auth.uid;

    try {
      logger.info(`Scheduling account deletion for userId: ${userId}`);

      // Calculate deletion date (30 days from now)
      const now = new Date();
      const deletionDate = new Date(now);
      deletionDate.setDate(deletionDate.getDate() + 30);

      // Format as YYYY-MM-DD
      const deletionDateISO = deletionDate.toISOString().split("T")[0];

      // Update user document with deletion status
      await db.collection("users").doc(userId).set({
        deletionStatus: DELETION_STATUS.SCHEDULED_FOR_DELETION,
        deletionScheduledAt: admin.firestore.FieldValue.serverTimestamp(),
        deletionExecutionDate: deletionDateISO,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      logger.info(
        `Account deletion scheduled for userId: ${userId}, ` +
        `deletionDate: ${deletionDateISO}`
      );

      // TODO: Add Cloud Task for automated deletion after 30 days
      // TODO: Send email notification about scheduled deletion

      return {
        success: true,
        message:
          `Account deletion scheduled for ${deletionDateISO}. ` +
          "You have 30 days to cancel.",
        data: {deletionDate: deletionDateISO},
      };
    } catch (error) {
      logger.error("Error scheduling account deletion:", error);
      throw new HttpsError(
        "internal",
        "Failed to schedule account deletion",
        error
      );
    }
  }
);

/**
 * Callable function to cancel scheduled account deletion
 * Reactivates the account and removes deletion fields
 *
 * @param {object} request - The request object (no data required)
 * @returns {object} Cancellation confirmation
 */
export const cancelAccountDeletion = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to call this function"
      );
    }

    const userId = request.auth.uid;

    try {
      logger.info(`Cancelling account deletion for userId: ${userId}`);

      // Get user document to check deletion status
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const userData = userDoc.data();

      if (!userData ||
          userData.deletionStatus !==
          DELETION_STATUS.SCHEDULED_FOR_DELETION) {
        throw new HttpsError(
          "failed-precondition",
          "Account is not scheduled for deletion"
        );
      }

      // TODO: Cancel Cloud Task if implemented

      // Reactivate account - remove deletion fields
      await db.collection("users").doc(userId).update({
        deletionStatus: DELETION_STATUS.ACTIVE,
        deletionScheduledAt: admin.firestore.FieldValue.delete(),
        deletionExecutionDate: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`Account deletion cancelled for userId: ${userId}`);

      return {
        success: true,
        message:
          "Account deletion cancelled successfully. " +
          "Your account is now active.",
        data: null,
      };
    } catch (error) {
      logger.error("Error cancelling account deletion:", error);
      throw new HttpsError(
        "internal",
        "Failed to cancel account deletion",
        error
      );
    }
  }
);
