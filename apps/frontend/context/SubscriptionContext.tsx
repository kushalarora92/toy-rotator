import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { useAuth } from '@/context/AuthContext';

// RevenueCat entitlement identifier — matches your RevenueCat dashboard
const ENTITLEMENT_ID = 'premium';

interface SubscriptionContextType {
  /** Whether the user has an active premium entitlement */
  isPremium: boolean;
  /** Current RevenueCat customer info */
  customerInfo: CustomerInfo | null;
  /** Available offering (packages) for purchase */
  currentOffering: PurchasesOffering | null;
  /** Whether offerings are loading */
  isLoading: boolean;
  /** Purchase a specific package */
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  /** Restore previous purchases */
  restorePurchases: () => Promise<boolean>;
  /** Refresh customer info */
  refreshCustomerInfo: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPremium: false,
  customerInfo: null,
  currentOffering: null,
  isLoading: true,
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  refreshCustomerInfo: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  // Initialize RevenueCat
  useEffect(() => {
    const initRevenueCat = async () => {
      // RevenueCat doesn't support web
      if (Platform.OS === 'web') {
        setIsLoading(false);
        return;
      }

      const apiKey = Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
      });

      if (!apiKey) {
        console.warn('RevenueCat API key not configured for this platform');
        setIsLoading(false);
        return;
      }

      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        Purchases.configure({ apiKey });
        setIsConfigured(true);
      } catch (error) {
        console.error('Error initializing RevenueCat:', error);
        setIsLoading(false);
      }
    };

    initRevenueCat();
  }, []);

  // Login / identify user with RevenueCat when auth changes
  useEffect(() => {
    if (!isConfigured || Platform.OS === 'web') return;

    const identifyUser = async () => {
      try {
        if (user) {
          // Identify the user with their Firebase UID
          const { customerInfo: info } = await Purchases.logIn(user.uid);
          updatePremiumStatus(info);
        } else {
          // Log out from RevenueCat when user signs out
          await Purchases.logOut();
          setIsPremium(false);
          setCustomerInfo(null);
        }
      } catch (error) {
        console.error('Error identifying user with RevenueCat:', error);
      }
    };

    identifyUser();
  }, [user, isConfigured]);

  // Fetch offerings when configured
  useEffect(() => {
    if (!isConfigured || Platform.OS === 'web') return;

    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        setCurrentOffering(offerings.current);
      } catch (error) {
        console.error('Error fetching offerings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferings();
  }, [isConfigured]);

  // Listen for customer info changes
  useEffect(() => {
    if (!isConfigured || Platform.OS === 'web') return;

    const listener = (info: CustomerInfo) => {
      updatePremiumStatus(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isConfigured]);

  const updatePremiumStatus = (info: CustomerInfo) => {
    setCustomerInfo(info);
    const entitlement = info.entitlements.active[ENTITLEMENT_ID];
    setIsPremium(!!entitlement);
  };

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      updatePremiumStatus(info);
      return !!info.entitlements.active[ENTITLEMENT_ID];
    } catch (error: any) {
      if (error.userCancelled) {
        // User cancelled — not an error
        return false;
      }
      console.error('Error purchasing package:', error);
      throw error;
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
      const info = await Purchases.restorePurchases();
      updatePremiumStatus(info);
      return !!info.entitlements.active[ENTITLEMENT_ID];
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    if (Platform.OS === 'web' || !isConfigured) return;

    try {
      const info = await Purchases.getCustomerInfo();
      updatePremiumStatus(info);
    } catch (error) {
      console.error('Error refreshing customer info:', error);
    }
  }, [isConfigured]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        customerInfo,
        currentOffering,
        isLoading,
        purchasePackage,
        restorePurchases,
        refreshCustomerInfo,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
