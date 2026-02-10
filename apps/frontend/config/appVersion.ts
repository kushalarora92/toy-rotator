/**
 * App Version Configuration
 * 
 * This config is bundled with the app and can be updated via OTA updates.
 * When you need to force users to update (breaking changes), simply:
 * 1. Update minVersion below
 * 2. Push an OTA update
 * 
 * Users on older native builds will receive this OTA update and see the
 * force update screen, prompting them to download the new native build.
 */

export const APP_VERSION_CONFIG = {
  /**
   * Minimum native build version required to use the app.
   * Users with app versions below this will be blocked.
   * Format: semantic version (e.g., "1.1.0")
   */
  minVersion: '1.0.0',

  /**
   * Whether to force users to update (hard block).
   * Set to false for soft prompts (dismissable "Maybe Later" option).
   */
  forceUpdate: true,

  /**
   * Message displayed to users when update is required.
   */
  updateMessage:
    'A new version of the app is available with important updates. Please update to continue using the app.',

  /**
   * Store URLs for each platform.
   * Update these with your actual App Store and Play Store URLs.
   */
  storeUrls: {
    ios: 'https://apps.apple.com/app/your-app-name/idYOUR_APP_ID',
    android:
      'https://play.google.com/store/apps/details?id=com.yourcompany.yourapp',
  },
} as const;

export type AppVersionConfig = typeof APP_VERSION_CONFIG;
