import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import {
  ChildProfile,
  Toy,
  Rotation,
  Feedback,
  CreateChildProfileData,
  UpdateChildProfileData,
  CreateToyData,
  UpdateToyData,
  CreateRotationData,
  CreateFeedbackData,
  Household,
  SubscriptionStatus,
} from '@my-app/types';

interface ToyRotatorContextType {
  // Children
  children: ChildProfile[];
  childrenLoading: boolean;
  selectedChild: ChildProfile | null;
  setSelectedChild: (child: ChildProfile | null) => void;
  refreshChildren: () => Promise<void>;
  addChild: (data: CreateChildProfileData) => Promise<ChildProfile | null>;
  updateChild: (childId: string, data: UpdateChildProfileData) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  // Toys
  toys: Toy[];
  toysLoading: boolean;
  refreshToys: () => Promise<void>;
  addNewToy: (data: CreateToyData) => Promise<Toy | null>;
  updateExistingToy: (toyId: string, data: UpdateToyData) => Promise<void>;
  retireToy: (toyId: string) => Promise<void>;
  // Rotations
  rotations: Rotation[];
  currentRotation: Rotation | null;
  rotationsLoading: boolean;
  refreshRotations: () => Promise<void>;
  createNewRotation: (data: CreateRotationData) => Promise<Rotation | null>;
  // Feedback
  submitFeedback: (data: CreateFeedbackData) => Promise<void>;
  // Household
  household: Household | null;
  householdLoading: boolean;
  refreshHousehold: () => Promise<void>;
  // Subscription
  subscription: SubscriptionStatus | null;
  isPaidUser: boolean;
}

const ToyRotatorContext = createContext<ToyRotatorContextType | undefined>(undefined);

export const useToyRotator = () => {
  const context = useContext(ToyRotatorContext);
  if (!context) {
    throw new Error('useToyRotator must be used within a ToyRotatorProvider');
  }
  return context;
};

export const ToyRotatorProvider: React.FC<{ children: React.ReactNode }> = ({ children: reactChildren }) => {
  const { user, userProfile } = useAuth();
  const {
    getChildProfiles,
    addChildProfile,
    updateChildProfile,
    deleteChildProfile,
    getToys,
    addToy,
    updateToy,
    deleteToy,
    getRotations,
    getCurrentRotation,
    createRotation,
    logFeedback,
    getHousehold,
  } = useFirebaseFunctions();

  // State
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  const [toys, setToys] = useState<Toy[]>([]);
  const [toysLoading, setToysLoading] = useState(false);

  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [currentRotation, setCurrentRotation] = useState<Rotation | null>(null);
  const [rotationsLoading, setRotationsLoading] = useState(false);

  const [household, setHousehold] = useState<Household | null>(null);
  const [householdLoading, setHouseholdLoading] = useState(false);

  const subscription = userProfile?.subscriptionStatus || null;
  const isPaidUser = subscription?.tier === 'trial' || subscription?.tier === 'paid';

  // Fetch children
  const refreshChildren = useCallback(async () => {
    if (!user) return;
    setChildrenLoading(true);
    try {
      const result = await getChildProfiles();
      if (result.success && result.data) {
        setChildProfiles(result.data);
        // Auto-select first child if none selected
        if (!selectedChild && result.data.length > 0) {
          setSelectedChild(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setChildrenLoading(false);
    }
  }, [user]);

  // Fetch toys
  const refreshToys = useCallback(async () => {
    if (!user) return;
    setToysLoading(true);
    try {
      const result = await getToys();
      if (result.success && result.data) {
        setToys(result.data);
      }
    } catch (error) {
      console.error('Error fetching toys:', error);
    } finally {
      setToysLoading(false);
    }
  }, [user]);

  // Fetch rotations
  const refreshRotations = useCallback(async () => {
    if (!user || !selectedChild) return;
    setRotationsLoading(true);
    try {
      const [rotResult, currentResult] = await Promise.all([
        getRotations(selectedChild.id),
        getCurrentRotation(selectedChild.id),
      ]);
      if (rotResult.success && rotResult.data) {
        setRotations(rotResult.data);
      }
      if (currentResult.success) {
        setCurrentRotation(currentResult.data || null);
      }
    } catch (error) {
      console.error('Error fetching rotations:', error);
    } finally {
      setRotationsLoading(false);
    }
  }, [user, selectedChild]);

  // Fetch household
  const refreshHousehold = useCallback(async () => {
    if (!user) return;
    setHouseholdLoading(true);
    try {
      const result = await getHousehold();
      if (result.success) {
        setHousehold(result.data || null);
      }
    } catch (error) {
      console.error('Error fetching household:', error);
    } finally {
      setHouseholdLoading(false);
    }
  }, [user]);

  // Initial data load
  useEffect(() => {
    if (user && userProfile?.status === 'active') {
      refreshChildren();
      refreshToys();
      refreshHousehold();
    }
  }, [user, userProfile?.status]);

  // Refresh rotations when selected child changes
  useEffect(() => {
    if (selectedChild) {
      refreshRotations();
    }
  }, [selectedChild]);

  // CRUD operations
  const addChild = async (data: CreateChildProfileData): Promise<ChildProfile | null> => {
    try {
      const result = await addChildProfile(data);
      if (result.success && result.data) {
        await refreshChildren();
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  };

  const updateChild = async (childId: string, data: UpdateChildProfileData) => {
    try {
      await updateChildProfile(childId, data);
      await refreshChildren();
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  };

  const removeChild = async (childId: string) => {
    try {
      await deleteChildProfile(childId);
      if (selectedChild?.id === childId) {
        setSelectedChild(null);
      }
      await refreshChildren();
    } catch (error) {
      console.error('Error removing child:', error);
      throw error;
    }
  };

  const addNewToy = async (data: CreateToyData): Promise<Toy | null> => {
    try {
      const result = await addToy(data);
      if (result.success && result.data) {
        await refreshToys();
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error adding toy:', error);
      throw error;
    }
  };

  const updateExistingToy = async (toyId: string, data: UpdateToyData) => {
    try {
      await updateToy(toyId, data);
      await refreshToys();
    } catch (error) {
      console.error('Error updating toy:', error);
      throw error;
    }
  };

  const retireToy = async (toyId: string) => {
    try {
      await deleteToy(toyId);
      await refreshToys();
    } catch (error) {
      console.error('Error retiring toy:', error);
      throw error;
    }
  };

  const createNewRotation = async (data: CreateRotationData): Promise<Rotation | null> => {
    try {
      const result = await createRotation(data);
      if (result.success && result.data) {
        await refreshRotations();
        await refreshToys(); // Toy statuses change
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating rotation:', error);
      throw error;
    }
  };

  const submitFeedback = async (data: CreateFeedbackData) => {
    try {
      await logFeedback(data);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  return (
    <ToyRotatorContext.Provider
      value={{
        children: childProfiles,
        childrenLoading,
        selectedChild,
        setSelectedChild,
        refreshChildren,
        addChild,
        updateChild,
        removeChild,
        toys,
        toysLoading,
        refreshToys,
        addNewToy,
        updateExistingToy,
        retireToy,
        rotations,
        currentRotation,
        rotationsLoading,
        refreshRotations,
        createNewRotation,
        submitFeedback,
        household,
        householdLoading,
        refreshHousehold,
        subscription,
        isPaidUser,
      }}
    >
      {reactChildren}
    </ToyRotatorContext.Provider>
  );
};
