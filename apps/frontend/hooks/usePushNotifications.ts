import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useFirebaseFunctions } from './useFirebaseFunctions';
import { useAuth } from '@/context/AuthContext';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Hook to manage push notifications
 * Handles permission requests, token registration, and notification listeners
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const { registerPushToken } = useFirebaseFunctions();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    // Push notifications don't work on web or simulators
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        setPermissionGranted(false);
        return null;
      }

      setPermissionGranted(true);

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      });

      const token = tokenData.data;
      setExpoPushToken(token);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('rotation-reminders', {
          name: 'Rotation Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0077e6',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('general', {
          name: 'General',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }, []);

  // Register token with backend
  const registerTokenWithBackend = useCallback(async (token: string) => {
    if (!user) return;

    try {
      await registerPushToken(token, Platform.OS);
      console.log('Push token registered with backend');
    } catch (error) {
      console.error('Error registering push token with backend:', error);
    }
  }, [user, registerPushToken]);

  // Schedule a local notification (for rotation reminders)
  const scheduleRotationReminder = useCallback(async (
    rotationEndDate: string,
    childName: string,
  ) => {
    if (Platform.OS === 'web') return;

    const endDate = new Date(rotationEndDate);
    const reminderDate = new Date(endDate);
    reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before

    // Only schedule if in the future
    if (reminderDate.getTime() <= Date.now()) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rotation Ending Soon!',
          body: `${childName}'s toy rotation ends tomorrow. Time to plan the next one!`,
          data: { type: 'rotation_reminder', childName },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });

      console.log(`Rotation reminder scheduled for ${reminderDate.toISOString()}`);
    } catch (error) {
      console.error('Error scheduling rotation reminder:', error);
    }
  }, []);

  // Schedule a local notification (generic)
  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, any>,
  ) => {
    if (Platform.OS === 'web') return;

    if (triggerDate.getTime() <= Date.now()) return;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }, []);

  // Cancel all scheduled notifications
  const cancelAllNotifications = useCallback(async () => {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (!user || Platform.OS === 'web') return;

    // Register and save token
    registerForPushNotifications().then((token) => {
      if (token) {
        registerTokenWithBackend(token);
      }
    });

    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification.request.content.title);
      }
    );

    // Listen for notification interactions (user taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);
        // Navigation based on notification type can be handled here
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  return {
    expoPushToken,
    permissionGranted,
    registerForPushNotifications,
    scheduleRotationReminder,
    scheduleLocalNotification,
    cancelAllNotifications,
  };
}
