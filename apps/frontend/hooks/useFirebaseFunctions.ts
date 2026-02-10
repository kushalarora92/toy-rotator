import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '../config/firebase';
import {
  UserProfile,
  UpdateProfileData,
  ApiResponse,
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
  Household,
  InviteCaregiverData,
} from '@my-app/types';

/**
 * Hook to interact with Firebase Cloud Functions
 */
export const useFirebaseFunctions = () => {
  // ============================================================
  // USER PROFILE
  // ============================================================

  const getUserInfo = async (): Promise<UserProfile> => {
    const fn = httpsCallable<void, UserProfile>(functions, 'getUserInfo');
    const result: HttpsCallableResult<UserProfile> = await fn();
    return result.data;
  };

  const updateUserProfile = async (data: UpdateProfileData): Promise<ApiResponse<UserProfile>> => {
    const fn = httpsCallable<UpdateProfileData, ApiResponse<UserProfile>>(functions, 'updateUserProfile');
    const result = await fn(data);
    return result.data;
  };

  const scheduleAccountDeletion = async (): Promise<ApiResponse<{ deletionDate: string }>> => {
    const fn = httpsCallable<void, ApiResponse<{ deletionDate: string }>>(functions, 'scheduleAccountDeletion');
    const result = await fn();
    return result.data;
  };

  const cancelAccountDeletion = async (): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<void, ApiResponse<null>>(functions, 'cancelAccountDeletion');
    const result = await fn();
    return result.data;
  };

  // ============================================================
  // CHILD PROFILES
  // ============================================================

  const getChildProfiles = async (): Promise<ApiResponse<ChildProfile[]>> => {
    const fn = httpsCallable<void, ApiResponse<ChildProfile[]>>(functions, 'getChildProfiles');
    const result = await fn();
    return result.data;
  };

  const addChildProfile = async (data: CreateChildProfileData): Promise<ApiResponse<ChildProfile>> => {
    const fn = httpsCallable<CreateChildProfileData, ApiResponse<ChildProfile>>(functions, 'addChildProfile');
    const result = await fn(data);
    return result.data;
  };

  const updateChildProfile = async (childId: string, data: UpdateChildProfileData): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<UpdateChildProfileData & { childId: string }, ApiResponse<null>>(functions, 'updateChildProfile');
    const result = await fn({ childId, ...data });
    return result.data;
  };

  const deleteChildProfile = async (childId: string): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<{ childId: string }, ApiResponse<null>>(functions, 'deleteChildProfile');
    const result = await fn({ childId });
    return result.data;
  };

  // ============================================================
  // TOYS
  // ============================================================

  const getToys = async (): Promise<ApiResponse<Toy[]>> => {
    const fn = httpsCallable<void, ApiResponse<Toy[]>>(functions, 'getToys');
    const result = await fn();
    return result.data;
  };

  const addToy = async (data: CreateToyData): Promise<ApiResponse<Toy>> => {
    const fn = httpsCallable<CreateToyData, ApiResponse<Toy>>(functions, 'addToy');
    const result = await fn(data);
    return result.data;
  };

  const updateToy = async (toyId: string, data: UpdateToyData): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<UpdateToyData & { toyId: string }, ApiResponse<null>>(functions, 'updateToy');
    const result = await fn({ toyId, ...data });
    return result.data;
  };

  const deleteToy = async (toyId: string): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<{ toyId: string }, ApiResponse<null>>(functions, 'deleteToy');
    const result = await fn({ toyId });
    return result.data;
  };

  // ============================================================
  // ROTATIONS
  // ============================================================

  const getRotations = async (childId?: string): Promise<ApiResponse<Rotation[]>> => {
    const fn = httpsCallable<{ childId?: string }, ApiResponse<Rotation[]>>(functions, 'getRotations');
    const result = await fn({ childId });
    return result.data;
  };

  const getCurrentRotation = async (childId: string): Promise<ApiResponse<Rotation | null>> => {
    const fn = httpsCallable<{ childId: string }, ApiResponse<Rotation | null>>(functions, 'getCurrentRotation');
    const result = await fn({ childId });
    return result.data;
  };

  const createRotation = async (data: CreateRotationData): Promise<ApiResponse<Rotation>> => {
    const fn = httpsCallable<CreateRotationData, ApiResponse<Rotation>>(functions, 'createRotation');
    const result = await fn(data);
    return result.data;
  };

  // ============================================================
  // FEEDBACK
  // ============================================================

  const logFeedback = async (data: CreateFeedbackData): Promise<ApiResponse<Feedback>> => {
    const fn = httpsCallable<CreateFeedbackData, ApiResponse<Feedback>>(functions, 'logFeedback');
    const result = await fn(data);
    return result.data;
  };

  const getFeedback = async (params: { rotationId?: string; toyId?: string }): Promise<ApiResponse<Feedback[]>> => {
    const fn = httpsCallable<{ rotationId?: string; toyId?: string }, ApiResponse<Feedback[]>>(functions, 'getFeedback');
    const result = await fn(params);
    return result.data;
  };

  // ============================================================
  // COLLABORATION
  // ============================================================

  const getHousehold = async (): Promise<ApiResponse<Household | null>> => {
    const fn = httpsCallable<void, ApiResponse<Household | null>>(functions, 'getHousehold');
    const result = await fn();
    return result.data;
  };

  const inviteCaregiver = async (data: InviteCaregiverData): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<InviteCaregiverData, ApiResponse<null>>(functions, 'inviteCaregiver');
    const result = await fn(data);
    return result.data;
  };

  const acceptInvitation = async (invitationId: string): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<{ invitationId: string }, ApiResponse<null>>(functions, 'acceptInvitation');
    const result = await fn({ invitationId });
    return result.data;
  };

  const getPendingInvitations = async (): Promise<ApiResponse<any[]>> => {
    const fn = httpsCallable<void, ApiResponse<any[]>>(functions, 'getPendingInvitations');
    const result = await fn();
    return result.data;
  };

  // ============================================================
  // AI FEATURES
  // ============================================================

  const getAiRotationSuggestion = async (data: AiRotationSuggestionRequest): Promise<ApiResponse<AiRotationSuggestionResponse>> => {
    const fn = httpsCallable<AiRotationSuggestionRequest, ApiResponse<AiRotationSuggestionResponse>>(functions, 'getAiRotationSuggestion');
    const result = await fn(data);
    return result.data;
  };

  const recognizeToyFromPhoto = async (imageBase64: string): Promise<ApiResponse<AiToyRecognitionResponse>> => {
    const fn = httpsCallable<{ imageBase64: string }, ApiResponse<AiToyRecognitionResponse>>(functions, 'recognizeToyFromPhoto');
    const result = await fn({ imageBase64 });
    return result.data;
  };

  const analyzeSpace = async (imageBase64: string): Promise<ApiResponse<AiSpaceAnalysisResponse>> => {
    const fn = httpsCallable<{ imageBase64: string }, ApiResponse<AiSpaceAnalysisResponse>>(functions, 'analyzeSpace');
    const result = await fn({ imageBase64 });
    return result.data;
  };

  // ============================================================
  // PUSH NOTIFICATIONS
  // ============================================================

  const registerPushToken = async (token: string, platform: string): Promise<ApiResponse<null>> => {
    const fn = httpsCallable<{ token: string; platform: string }, ApiResponse<null>>(functions, 'registerPushToken');
    const result = await fn({ token, platform });
    return result.data;
  };

  return {
    // Profile
    getUserInfo,
    updateUserProfile,
    scheduleAccountDeletion,
    cancelAccountDeletion,
    // Children
    getChildProfiles,
    addChildProfile,
    updateChildProfile,
    deleteChildProfile,
    // Toys
    getToys,
    addToy,
    updateToy,
    deleteToy,
    // Rotations
    getRotations,
    getCurrentRotation,
    createRotation,
    // Feedback
    logFeedback,
    getFeedback,
    // Collaboration
    getHousehold,
    inviteCaregiver,
    acceptInvitation,
    getPendingInvitations,
    // AI
    getAiRotationSuggestion,
    recognizeToyFromPhoto,
    analyzeSpace,
    // Push
    registerPushToken,
  };
};
