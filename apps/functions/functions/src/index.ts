/**
 * ToyRotator Cloud Functions
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
  Toy,
  CreateToyData,
  UpdateToyData,
  Rotation,
  CreateRotationData,
  ChildProfile,
  CreateChildProfileData,
  UpdateChildProfileData,
  Feedback,
  CreateFeedbackData,
  AiRotationSuggestionRequest,
  AiRotationSuggestionResponse,
  AiToyRecognitionResponse,
  AiSpaceAnalysisResponse,
  Caregiver,
  Household,
  InviteCaregiverData,
  TOY_CATEGORIES,
  SKILL_TAGS,
} from "@my-app/types";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

// ============================================================
// Helper: get household ID for a user (for collaboration)
// ============================================================
async function getHouseholdId(userId: string): Promise<string> {
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  return userData?.householdId || userId;
}

// ============================================================
// Hello World (sample)
// ============================================================
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from ToyRotator!");
});

// ============================================================
// USER PROFILE
// ============================================================

export const getUserInfo = onCall(async (request): Promise<UserProfile> => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to call this function"
    );
  }

  const userId = request.auth.uid;

  try {
    logger.info(`Fetching user info for userId: ${userId}`);
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      logger.info(`User document not found for userId: ${userId}`);
      return {
        uid: userId,
        email: request.auth.token.email || null,
        displayName: request.auth.token.name || null,
        status: "inactive",
      };
    }

    const userData = userDoc.data();
    logger.info(`User info retrieved for userId: ${userId}`);

    return {
      uid: userId,
      email: request.auth.token.email || null,
      ...userData,
    };
  } catch (error) {
    logger.error("Error fetching user info:", error);
    throw new HttpsError("internal", "Failed to fetch user information", error);
  }
});

export const updateUserProfile = onCall(
  async (request): Promise<ApiResponse<UserProfile>> => {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData: Record<string, any> = {
        ...profileData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        // Create household for new user
        userData.householdId = userId;
        // Initialize subscription as free
        userData.subscriptionStatus = {
          tier: "free",
          active: true,
          aiUsageCounters: {
            rotationSuggestionsToday: 0,
            toyRecognitionsThisMonth: 0,
            spaceAnalysesThisMonth: 0,
          },
        };
      }

      await userRef.set(userData, {merge: true});

      // Create household document if first profile creation
      if (!userDoc.exists) {
        await db.collection("households").doc(userId).set({
          id: userId,
          ownerUid: userId,
          members: [{
            uid: userId,
            email: request.auth.token.email || "",
            displayName: profileData.displayName || "",
            role: "owner",
            inviteStatus: "accepted",
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          }],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      logger.info(`User profile updated for userId: ${userId}`);

      return {
        success: true,
        message: "Profile updated successfully",
        data: userData as UserProfile,
      };
    } catch (error) {
      logger.error("Error updating user profile:", error);
      throw new HttpsError("internal", "Failed to update user profile", error);
    }
  }
);

// ============================================================
// ACCOUNT DELETION
// ============================================================

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

      const now = new Date();
      const deletionDate = new Date(now);
      deletionDate.setDate(deletionDate.getDate() + 30);
      const deletionDateISO = deletionDate.toISOString().split("T")[0];

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

      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const userData = userDoc.data();
      if (!userData ||
        userData.deletionStatus !== DELETION_STATUS.SCHEDULED_FOR_DELETION) {
        throw new HttpsError(
          "failed-precondition",
          "Account is not scheduled for deletion"
        );
      }

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

// ============================================================
// CHILD PROFILES
// ============================================================

export const getChildProfiles = onCall(
  async (request): Promise<ApiResponse<ChildProfile[]>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const snapshot = await db
        .collection("households").doc(householdId)
        .collection("children")
        .orderBy("createdAt", "desc")
        .get();

      const children: ChildProfile[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as ChildProfile));

      return {success: true, message: "Children fetched", data: children};
    } catch (error) {
      logger.error("Error fetching children:", error);
      throw new HttpsError("internal", "Failed to fetch children", error);
    }
  }
);

export const addChildProfile = onCall(
  async (request): Promise<ApiResponse<ChildProfile>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const data = request.data as CreateChildProfileData;
    if (!data.name || !data.dateOfBirth) {
      throw new HttpsError(
        "invalid-argument",
        "Name and date of birth are required"
      );
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const childData = {
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        interests: data.interests || [],
        rotationSettings: {
          displayCount: data.rotationSettings?.displayCount || 10,
          durationDays: data.rotationSettings?.durationDays || 7,
          reminderTime: data.rotationSettings?.reminderTime || "09:00",
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db
        .collection("households").doc(householdId)
        .collection("children")
        .add(childData);

      return {
        success: true,
        message: "Child profile created",
        data: {id: docRef.id, ...childData} as ChildProfile,
      };
    } catch (error) {
      logger.error("Error adding child:", error);
      throw new HttpsError("internal", "Failed to add child", error);
    }
  }
);

export const updateChildProfile = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {childId, ...data} = request.data as
      UpdateChildProfileData & {childId: string};
    if (!childId) {
      throw new HttpsError("invalid-argument", "childId is required");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const updateData: Record<string, any> = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // If rotationSettings is partial, merge it
      if (data.rotationSettings) {
        const childDoc = await db
          .collection("households").doc(householdId)
          .collection("children").doc(childId)
          .get();
        const existing = childDoc.data()?.rotationSettings || {};
        updateData.rotationSettings = {...existing, ...data.rotationSettings};
      }

      await db
        .collection("households").doc(householdId)
        .collection("children").doc(childId)
        .update(updateData);

      return {success: true, message: "Child profile updated", data: null};
    } catch (error) {
      logger.error("Error updating child:", error);
      throw new HttpsError("internal", "Failed to update child", error);
    }
  }
);

export const deleteChildProfile = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {childId} = request.data as {childId: string};
    if (!childId) {
      throw new HttpsError("invalid-argument", "childId is required");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      await db
        .collection("households").doc(householdId)
        .collection("children").doc(childId)
        .delete();

      return {success: true, message: "Child profile deleted", data: null};
    } catch (error) {
      logger.error("Error deleting child:", error);
      throw new HttpsError("internal", "Failed to delete child", error);
    }
  }
);

// ============================================================
// TOYS
// ============================================================

export const getToys = onCall(
  async (request): Promise<ApiResponse<Toy[]>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const snapshot = await db
        .collection("households").doc(householdId)
        .collection("toys")
        .orderBy("createdAt", "desc")
        .get();

      const toys: Toy[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Toy));

      return {success: true, message: "Toys fetched", data: toys};
    } catch (error) {
      logger.error("Error fetching toys:", error);
      throw new HttpsError("internal", "Failed to fetch toys", error);
    }
  }
);

export const addToy = onCall(
  async (request): Promise<ApiResponse<Toy>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const data = request.data as CreateToyData;
    if (!data.name || !data.category) {
      throw new HttpsError(
        "invalid-argument",
        "Name and category are required"
      );
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const toyData = {
        name: data.name,
        category: data.category,
        ageRange: data.ageRange || null,
        skillTags: data.skillTags || [],
        source: data.source || "manual",
        status: data.status || "resting",
        imageUrl: data.imageUrl || null,
        notes: data.notes || "",
        childId: data.childId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db
        .collection("households").doc(householdId)
        .collection("toys")
        .add(toyData);

      return {
        success: true,
        message: "Toy added",
        data: {id: docRef.id, ...toyData} as Toy,
      };
    } catch (error) {
      logger.error("Error adding toy:", error);
      throw new HttpsError("internal", "Failed to add toy", error);
    }
  }
);

export const updateToy = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {toyId, ...data} = request.data as UpdateToyData & {toyId: string};
    if (!toyId) {
      throw new HttpsError("invalid-argument", "toyId is required");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      await db
        .collection("households").doc(householdId)
        .collection("toys").doc(toyId)
        .update({
          ...data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {success: true, message: "Toy updated", data: null};
    } catch (error) {
      logger.error("Error updating toy:", error);
      throw new HttpsError("internal", "Failed to update toy", error);
    }
  }
);

export const deleteToy = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {toyId} = request.data as {toyId: string};
    if (!toyId) {
      throw new HttpsError("invalid-argument", "toyId is required");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      // Soft delete - set status to retired
      await db
        .collection("households").doc(householdId)
        .collection("toys").doc(toyId)
        .update({
          status: "retired",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {success: true, message: "Toy retired", data: null};
    } catch (error) {
      logger.error("Error deleting toy:", error);
      throw new HttpsError("internal", "Failed to delete toy", error);
    }
  }
);

// ============================================================
// ROTATIONS
// ============================================================

export const getRotations = onCall(
  async (request): Promise<ApiResponse<Rotation[]>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {childId} = request.data as {childId?: string};
    const householdId = await getHouseholdId(request.auth.uid);

    try {
      let query: admin.firestore.Query = db
        .collection("households").doc(householdId)
        .collection("rotations")
        .orderBy("startDate", "desc")
        .limit(50);

      if (childId) {
        query = db
          .collection("households").doc(householdId)
          .collection("rotations")
          .where("childId", "==", childId)
          .orderBy("startDate", "desc")
          .limit(50);
      }

      const snapshot = await query.get();
      const rotations: Rotation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Rotation));

      return {success: true, message: "Rotations fetched", data: rotations};
    } catch (error) {
      logger.error("Error fetching rotations:", error);
      throw new HttpsError("internal", "Failed to fetch rotations", error);
    }
  }
);

export const getCurrentRotation = onCall(
  async (request): Promise<ApiResponse<Rotation | null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {childId} = request.data as {childId: string};
    if (!childId) {
      throw new HttpsError("invalid-argument", "childId is required");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const snapshot = await db
        .collection("households").doc(householdId)
        .collection("rotations")
        .where("childId", "==", childId)
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return {success: true, message: "No active rotation", data: null};
      }

      const doc = snapshot.docs[0];
      return {
        success: true,
        message: "Current rotation fetched",
        data: {id: doc.id, ...doc.data()} as Rotation,
      };
    } catch (error) {
      logger.error("Error fetching current rotation:", error);
      throw new HttpsError(
        "internal",
        "Failed to fetch current rotation",
        error
      );
    }
  }
);

export const createRotation = onCall(
  async (request): Promise<ApiResponse<Rotation>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const data = request.data as CreateRotationData;
    if (!data.childId || !data.toyIds || data.toyIds.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "childId and toyIds are required"
      );
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      // Deactivate any existing active rotation for this child
      const activeSnapshot = await db
        .collection("households").doc(householdId)
        .collection("rotations")
        .where("childId", "==", data.childId)
        .where("isActive", "==", true)
        .get();

      const batch = db.batch();
      activeSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // Get child's rotation settings for duration
      let durationDays = data.durationDays || 7;
      if (!data.durationDays) {
        const childDoc = await db
          .collection("households").doc(householdId)
          .collection("children").doc(data.childId)
          .get();
        if (childDoc.exists) {
          durationDays =
            childDoc.data()?.rotationSettings?.durationDays || 7;
        }
      }

      const startDate = data.startDate || new Date().toISOString().split("T")[0];
      const endDateObj = new Date(startDate);
      endDateObj.setDate(endDateObj.getDate() + durationDays);
      const endDate = endDateObj.toISOString().split("T")[0];

      // Update toy statuses
      for (const toyId of data.toyIds) {
        const toyRef = db
          .collection("households").doc(householdId)
          .collection("toys").doc(toyId);
        batch.update(toyRef, {
          status: "active",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Set toys from previous rotation to resting
      for (const doc of activeSnapshot.docs) {
        const prevToyIds = doc.data().toyIds || [];
        for (const prevToyId of prevToyIds) {
          if (!data.toyIds.includes(prevToyId)) {
            const toyRef = db
              .collection("households").doc(householdId)
              .collection("toys").doc(prevToyId);
            batch.update(toyRef, {
              status: "resting",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      }

      const rotationData = {
        childId: data.childId,
        startDate,
        endDate,
        toyIds: data.toyIds,
        source: data.source || "manual",
        insightSummary: data.insightSummary || "",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const rotationRef = db
        .collection("households").doc(householdId)
        .collection("rotations")
        .doc();
      batch.set(rotationRef, rotationData);

      await batch.commit();

      return {
        success: true,
        message: "Rotation created",
        data: {id: rotationRef.id, ...rotationData} as Rotation,
      };
    } catch (error) {
      logger.error("Error creating rotation:", error);
      throw new HttpsError("internal", "Failed to create rotation", error);
    }
  }
);

// ============================================================
// FEEDBACK
// ============================================================

export const logFeedback = onCall(
  async (request): Promise<ApiResponse<Feedback>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const data = request.data as CreateFeedbackData;
    if (!data.toyId || !data.rotationId || !data.childId || !data.engagement) {
      throw new HttpsError(
        "invalid-argument",
        "toyId, rotationId, childId, and engagement are required"
      );
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const feedbackData = {
        toyId: data.toyId,
        rotationId: data.rotationId,
        childId: data.childId,
        engagement: data.engagement,
        notes: data.notes || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db
        .collection("households").doc(householdId)
        .collection("feedback")
        .add(feedbackData);

      return {
        success: true,
        message: "Feedback logged",
        data: {id: docRef.id, ...feedbackData} as Feedback,
      };
    } catch (error) {
      logger.error("Error logging feedback:", error);
      throw new HttpsError("internal", "Failed to log feedback", error);
    }
  }
);

export const getFeedback = onCall(
  async (request): Promise<ApiResponse<Feedback[]>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {rotationId, toyId} = request.data as
      {rotationId?: string; toyId?: string};
    const householdId = await getHouseholdId(request.auth.uid);

    try {
      let query: admin.firestore.Query = db
        .collection("households").doc(householdId)
        .collection("feedback")
        .orderBy("createdAt", "desc")
        .limit(100);

      if (rotationId) {
        query = db
          .collection("households").doc(householdId)
          .collection("feedback")
          .where("rotationId", "==", rotationId)
          .orderBy("createdAt", "desc");
      } else if (toyId) {
        query = db
          .collection("households").doc(householdId)
          .collection("feedback")
          .where("toyId", "==", toyId)
          .orderBy("createdAt", "desc");
      }

      const snapshot = await query.get();
      const feedback: Feedback[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Feedback));

      return {success: true, message: "Feedback fetched", data: feedback};
    } catch (error) {
      logger.error("Error fetching feedback:", error);
      throw new HttpsError("internal", "Failed to fetch feedback", error);
    }
  }
);

// ============================================================
// COLLABORATION / CAREGIVERS
// ============================================================

export const inviteCaregiver = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {email} = request.data as InviteCaregiverData;
    if (!email) {
      throw new HttpsError("invalid-argument", "Email is required");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      // Check user is the household owner
      const householdDoc = await db
        .collection("households").doc(householdId).get();
      if (!householdDoc.exists) {
        throw new HttpsError("not-found", "Household not found");
      }
      const household = householdDoc.data() as Household;
      if (household.ownerUid !== request.auth.uid) {
        throw new HttpsError(
          "permission-denied",
          "Only the household owner can invite caregivers"
        );
      }

      // Check if already a member
      const existingMember = household.members?.find(
        (m: Caregiver) => m.email === email
      );
      if (existingMember) {
        throw new HttpsError("already-exists", "This person is already invited");
      }

      // Add pending caregiver to household
      const newCaregiver: Partial<Caregiver> = {
        uid: "",
        email: email,
        role: "caregiver",
        inviteStatus: "pending",
      };

      await db.collection("households").doc(householdId).update({
        members: admin.firestore.FieldValue.arrayUnion({
          ...newCaregiver,
          invitedAt: new Date().toISOString(),
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create an invitation document so the invitee can find it
      await db.collection("invitations").add({
        householdId,
        inviterUid: request.auth.uid,
        inviterEmail: request.auth.token.email || "",
        inviteeEmail: email,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // TODO: Send invitation email

      return {success: true, message: "Caregiver invited", data: null};
    } catch (error: any) {
      if (error.code) throw error; // Re-throw HttpsError
      logger.error("Error inviting caregiver:", error);
      throw new HttpsError("internal", "Failed to invite caregiver", error);
    }
  }
);

export const acceptInvitation = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {invitationId} = request.data as {invitationId: string};
    if (!invitationId) {
      throw new HttpsError("invalid-argument", "invitationId is required");
    }

    try {
      const invDoc = await db.collection("invitations").doc(invitationId).get();
      if (!invDoc.exists) {
        throw new HttpsError("not-found", "Invitation not found");
      }

      const invitation = invDoc.data();
      if (!invitation) {
        throw new HttpsError("not-found", "Invitation data is empty");
      }

      // Verify the invitation is for this user
      if (invitation.inviteeEmail !== request.auth.token.email) {
        throw new HttpsError(
          "permission-denied",
          "This invitation is not for you"
        );
      }

      if (invitation.status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          "Invitation is no longer pending"
        );
      }

      const householdId = invitation.householdId;

      // Update invitation status
      await db.collection("invitations").doc(invitationId).update({
        status: "accepted",
      });

      // Update household members - find pending member by email, update
      const householdDoc = await db
        .collection("households").doc(householdId).get();
      const household = householdDoc.data() as Household;
      const updatedMembers = (household.members || []).map(
        (m: Caregiver) => {
          if (m.email === request.auth!.token.email) {
            return {
              ...m,
              uid: request.auth!.uid,
              displayName: request.auth!.token.name || "",
              inviteStatus: "accepted",
              joinedAt: new Date().toISOString(),
            };
          }
          return m;
        }
      );

      await db.collection("households").doc(householdId).update({
        members: updatedMembers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user's profile with household ID
      await db.collection("users").doc(request.auth.uid).update({
        householdId: householdId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {success: true, message: "Invitation accepted", data: null};
    } catch (error: any) {
      if (error.code) throw error;
      logger.error("Error accepting invitation:", error);
      throw new HttpsError("internal", "Failed to accept invitation", error);
    }
  }
);

export const getHousehold = onCall(
  async (request): Promise<ApiResponse<Household | null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const householdId = await getHouseholdId(request.auth.uid);

    try {
      const doc = await db.collection("households").doc(householdId).get();
      if (!doc.exists) {
        return {success: true, message: "No household", data: null};
      }

      return {
        success: true,
        message: "Household fetched",
        data: {id: doc.id, ...doc.data()} as Household,
      };
    } catch (error) {
      logger.error("Error fetching household:", error);
      throw new HttpsError("internal", "Failed to fetch household", error);
    }
  }
);

export const getPendingInvitations = onCall(
  async (request): Promise<ApiResponse<any[]>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    try {
      const snapshot = await db.collection("invitations")
        .where("inviteeEmail", "==", request.auth.token.email || "")
        .where("status", "==", "pending")
        .get();

      const invitations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {success: true, message: "Invitations fetched", data: invitations};
    } catch (error) {
      logger.error("Error fetching invitations:", error);
      throw new HttpsError("internal", "Failed to fetch invitations", error);
    }
  }
);

// ============================================================
// AI FEATURES
// ============================================================

/**
 * AI Rotation Suggestion
 * Requires OPENAI_API_KEY in Firebase Functions config/environment
 */
export const getAiRotationSuggestion = onCall(
  async (request): Promise<ApiResponse<AiRotationSuggestionResponse>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const userId = request.auth.uid;
    const data = request.data as AiRotationSuggestionRequest;
    if (!data.childId) {
      throw new HttpsError("invalid-argument", "childId is required");
    }

    // Check subscription
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const sub = userData?.subscriptionStatus;
    if (!sub || sub.tier === "free") {
      throw new HttpsError(
        "permission-denied",
        "AI features require a trial or paid subscription"
      );
    }

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    const counters = sub.aiUsageCounters || {};
    if (counters.lastRotationSuggestionDate === today &&
        counters.rotationSuggestionsToday >= 1) {
      throw new HttpsError(
        "resource-exhausted",
        "Daily AI rotation suggestion limit reached (1 per day)"
      );
    }

    const householdId = await getHouseholdId(userId);

    try {
      // Fetch child profile
      const childDoc = await db
        .collection("households").doc(householdId)
        .collection("children").doc(data.childId)
        .get();
      if (!childDoc.exists) {
        throw new HttpsError("not-found", "Child not found");
      }
      const child = childDoc.data() as ChildProfile;

      // Fetch toys
      let toysQuery: admin.firestore.Query = db
        .collection("households").doc(householdId)
        .collection("toys")
        .where("status", "in", ["active", "resting"]);

      const toysSnapshot = await toysQuery.get();
      const allToys = toysSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Toy[];

      // Filter to requested toyIds if provided
      const availableToys = data.toyIds ?
        allToys.filter((t) => data.toyIds!.includes(t.id)) :
        allToys;

      if (availableToys.length === 0) {
        throw new HttpsError(
          "failed-precondition",
          "No toys available for rotation"
        );
      }

      // Fetch recent feedback for context
      const feedbackSnapshot = await db
        .collection("households").doc(householdId)
        .collection("feedback")
        .where("childId", "==", data.childId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
      const recentFeedback = feedbackSnapshot.docs.map((doc) => doc.data());

      // Calculate child age
      const dob = new Date(child.dateOfBirth);
      const now = new Date();
      const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 +
        (now.getMonth() - dob.getMonth());

      const displayCount = child.rotationSettings?.displayCount || 10;

      // Build prompt
      const prompt = buildRotationPrompt(
        child,
        ageMonths,
        availableToys,
        recentFeedback,
        displayCount
      );

      // Call OpenAI
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new HttpsError(
          "internal",
          "AI service not configured"
        );
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that suggests toy rotations for young children. You provide non-medical, non-diagnostic insights about play styles and skills. Always respond with valid JSON.",
            },
            {role: "user", content: prompt},
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content || "";

      // Parse AI response
      let parsed: AiRotationSuggestionResponse;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Fallback: return random selection
        const shuffled = [...availableToys].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(displayCount, shuffled.length));
        parsed = {
          toyIds: selected.map((t) => t.id),
          insightSummary: "A balanced mix of toys for varied play experiences.",
          reasoning: "AI response could not be parsed. Random selection provided.",
        };
      }

      // Ensure toyIds are valid
      const validToyIds = parsed.toyIds.filter(
        (id: string) => availableToys.some((t) => t.id === id)
      );
      if (validToyIds.length === 0) {
        const shuffled = [...availableToys].sort(() => Math.random() - 0.5);
        parsed.toyIds = shuffled
          .slice(0, Math.min(displayCount, shuffled.length))
          .map((t) => t.id);
      } else {
        parsed.toyIds = validToyIds.slice(0, displayCount);
      }

      // Update usage counters
      await db.collection("users").doc(userId).update({
        "subscriptionStatus.aiUsageCounters.rotationSuggestionsToday":
          counters.lastRotationSuggestionDate === today ?
            (counters.rotationSuggestionsToday || 0) + 1 : 1,
        "subscriptionStatus.aiUsageCounters.lastRotationSuggestionDate": today,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "AI rotation suggestion generated",
        data: parsed,
      };
    } catch (error: any) {
      if (error.code) throw error;
      logger.error("Error generating AI rotation:", error);
      throw new HttpsError(
        "internal",
        "Failed to generate AI rotation suggestion",
        error
      );
    }
  }
);

function buildRotationPrompt(
  child: ChildProfile,
  ageMonths: number,
  toys: Toy[],
  feedback: any[],
  displayCount: number
): string {
  const toyList = toys.map((t) =>
    `- ID: "${t.id}", Name: "${t.name}", Category: "${t.category}", ` +
    `Skills: [${t.skillTags.join(", ")}], Status: "${t.status}"`
  ).join("\n");

  const feedbackSummary = feedback.length > 0 ?
    feedback.map((f) =>
      `Toy ${f.toyId}: ${f.engagement}`
    ).join(", ") :
    "No feedback yet";

  return `Select ${displayCount} toys for a child who is ${ageMonths} months old.
Child name: ${child.name}
Child interests: ${child.interests.join(", ") || "None specified"}

Available toys:
${toyList}

Recent feedback: ${feedbackSummary}

Rules:
- Select exactly ${displayCount} toys (or fewer if not enough available)
- Prioritize variety across categories and skills
- Consider the child's age and interests
- Factor in recent feedback (prefer "liked" toys, reduce "ignored" toys)
- Include a balance of active and calm play options
- Prefer toys in "resting" status to rotate them in

Respond with ONLY valid JSON in this format:
{
  "toyIds": ["id1", "id2", ...],
  "insightSummary": "A brief, parent-friendly sentence about what this rotation emphasizes",
  "reasoning": "Brief explanation of why these toys were chosen"
}`;
}

/**
 * AI Toy Recognition from photo
 */
export const recognizeToyFromPhoto = onCall(
  async (request): Promise<ApiResponse<AiToyRecognitionResponse>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const userId = request.auth.uid;
    const {imageBase64} = request.data as {imageBase64: string};
    if (!imageBase64) {
      throw new HttpsError("invalid-argument", "imageBase64 is required");
    }

    // Check subscription
    const userDoc = await db.collection("users").doc(userId).get();
    const sub = userDoc.data()?.subscriptionStatus;
    if (!sub || sub.tier === "free") {
      throw new HttpsError(
        "permission-denied",
        "AI features require a trial or paid subscription"
      );
    }

    // Check monthly limit
    const currentMonth = new Date().toISOString().slice(0, 7);
    const counters = sub.aiUsageCounters || {};
    const monthlyLimit = sub.tier === "trial" ? 5 : 20;
    if (counters.lastToyRecognitionMonth === currentMonth &&
        counters.toyRecognitionsThisMonth >= monthlyLimit) {
      throw new HttpsError(
        "resource-exhausted",
        `Monthly AI toy recognition limit reached (${monthlyLimit} per month)`
      );
    }

    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new HttpsError("internal", "AI service not configured");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a toy identification assistant. Identify the toy in the image and categorize it. 
Available categories: ${TOY_CATEGORIES.join(", ")}
Available skill tags: ${SKILL_TAGS.join(", ")}
Respond with ONLY valid JSON.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Identify this toy. Return JSON: {\"name\": \"...\", \"category\": \"...\", \"skillTags\": [...], \"ageRange\": {\"minMonths\": N, \"maxMonths\": N}, \"confidence\": 0.0-1.0}",
                },
                {
                  type: "image_url",
                  image_url: {url: `data:image/jpeg;base64,${imageBase64}`},
                },
              ],
            },
          ],
          max_tokens: 300,
        }),
      });

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content || "";

      let parsed: AiToyRecognitionResponse;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {
          name: "Unknown Toy",
          category: "Other",
          skillTags: [],
          confidence: 0,
        };
      }

      // Update usage counters
      await db.collection("users").doc(userId).update({
        "subscriptionStatus.aiUsageCounters.toyRecognitionsThisMonth":
          counters.lastToyRecognitionMonth === currentMonth ?
            (counters.toyRecognitionsThisMonth || 0) + 1 : 1,
        "subscriptionStatus.aiUsageCounters.lastToyRecognitionMonth":
          currentMonth,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Toy recognized",
        data: parsed,
      };
    } catch (error: any) {
      if (error.code) throw error;
      logger.error("Error recognizing toy:", error);
      throw new HttpsError("internal", "Failed to recognize toy", error);
    }
  }
);

/**
 * AI Space Analysis
 */
export const analyzeSpace = onCall(
  async (request): Promise<ApiResponse<AiSpaceAnalysisResponse>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const userId = request.auth.uid;
    const {imageBase64} = request.data as {imageBase64: string};
    if (!imageBase64) {
      throw new HttpsError("invalid-argument", "imageBase64 is required");
    }

    // Check subscription for AI insights
    const userDoc = await db.collection("users").doc(userId).get();
    const sub = userDoc.data()?.subscriptionStatus;
    const isPaid = sub && (sub.tier === "trial" || sub.tier === "paid");

    try {
      if (!isPaid) {
        // Free users get basic rule-based observations
        return {
          success: true,
          message: "Basic space analysis",
          data: {
            observations: [
              "Consider creating a clear display boundary for toys",
              "Try separating large toys from small toys",
              "A dedicated shelf or bin system can help with rotation",
              "Aim for open space where children can play freely",
            ],
            insights: "Upgrade to see AI-powered personalized insights about your play space.",
          },
        };
      }

      // Check monthly limit for paid users
      const currentMonth = new Date().toISOString().slice(0, 7);
      const counters = sub?.aiUsageCounters || {};
      if (counters.lastSpaceAnalysisMonth === currentMonth &&
          counters.spaceAnalysesThisMonth >= 3) {
        throw new HttpsError(
          "resource-exhausted",
          "Monthly space analysis limit reached (3 per month)"
        );
      }

      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new HttpsError("internal", "AI service not configured");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You analyze play spaces for toy rotation. Be non-judgmental, non-prescriptive, and non-medical. Focus on practical observations about display capacity and organization. Respond with ONLY valid JSON.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this play space photo. Return JSON: {\"observations\": [\"...\", ...], \"insights\": \"paragraph of helpful observations\", \"displayCapacitySuggestion\": N}",
                },
                {
                  type: "image_url",
                  image_url: {url: `data:image/jpeg;base64,${imageBase64}`},
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content || "";

      let parsed: AiSpaceAnalysisResponse;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {
          observations: ["Unable to analyze the image. Please try again."],
          insights: "We could not generate insights for this image.",
        };
      }

      // Update usage counters
      await db.collection("users").doc(userId).update({
        "subscriptionStatus.aiUsageCounters.spaceAnalysesThisMonth":
          counters.lastSpaceAnalysisMonth === currentMonth ?
            (counters.spaceAnalysesThisMonth || 0) + 1 : 1,
        "subscriptionStatus.aiUsageCounters.lastSpaceAnalysisMonth":
          currentMonth,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Space analyzed",
        data: parsed,
      };
    } catch (error: any) {
      if (error.code) throw error;
      logger.error("Error analyzing space:", error);
      throw new HttpsError("internal", "Failed to analyze space", error);
    }
  }
);

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================

export const registerPushToken = onCall(
  async (request): Promise<ApiResponse<null>> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const {token, platform} = request.data as
      {token: string; platform: string};
    if (!token) {
      throw new HttpsError("invalid-argument", "Token is required");
    }

    try {
      await db.collection("users").doc(request.auth.uid).update({
        pushToken: token,
        pushPlatform: platform || "unknown",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {success: true, message: "Push token registered", data: null};
    } catch (error) {
      logger.error("Error registering push token:", error);
      throw new HttpsError(
        "internal",
        "Failed to register push token",
        error
      );
    }
  }
);
