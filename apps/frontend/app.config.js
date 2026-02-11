module.exports = {
  expo: {
    name: 'ToyRotator',
    slug: 'toy-rotator',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'toyrotator',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'kushalarora92',
    extra: {
      eas: {
        projectId: 'YOUR_EAS_PROJECT_ID',
      },
    },
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kodianlabs.toyrotator',
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: 'ToyRotator uses the camera to scan toys and analyze play spaces.',
        NSPhotoLibraryUsageDescription: 'ToyRotator uses your photo library to select toy photos and play space images.',
      },
      usesAppleSignIn: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.kodianlabs.toyrotator',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      '@react-native-firebase/app',
      '@react-native-google-signin/google-signin',
      'expo-apple-authentication',
      [
        'expo-image-picker',
        {
          photosPermission: 'ToyRotator uses your photo library to select toy photos and play space images.',
          cameraPermission: 'ToyRotator uses the camera to scan toys and analyze play spaces.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#0077e6',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    updates: {
      url: 'https://u.expo.dev/YOUR_EAS_PROJECT_ID',
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
};
