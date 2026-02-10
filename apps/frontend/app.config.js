module.exports = {
  expo: {
    name: 'My App',
    slug: 'my-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'my-app',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'your-expo-username',
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
      bundleIdentifier: 'com.yourcompany.myapp',
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
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
      package: 'com.yourcompany.myapp',
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
