# Expo + Firebase App Template

A production-ready monorepo template for building cross-platform apps with **Expo** (React Native + Web), **Firebase** (Auth, Firestore, Functions), and **Turborepo**.

## ✨ What's Included

- 🔐 **Authentication** — Email/password, Google Sign-In, Apple Sign-In, email verification, password reset
- 👤 **Profile Setup** — First-login profile flow with privacy/terms agreement
- 🗑️ **Account Deletion** — Full GDPR-compliant 30-day grace period flow
- 📊 **Firebase Analytics** — Cross-platform analytics hook (web + native)
- 🔄 **Force Update System** — Semantic version checking with app store redirect
- 🌐 **Web Support** — Responsive layout with desktop navigation bar
- 📱 **EAS Build Config** — Development, preview, and production build profiles
- 🚀 **OTA Updates** — Expo Updates with channel-based deployment
- ☁️ **Firebase Hosting** — Web deployment with GitHub Actions CI/CD
- 📄 **Legal Pages** — Privacy Policy, Terms of Service, Support (placeholder content)
- 🎨 **GlueStack UI** — Themed components with dark/light mode support
- 🏗️ **Monorepo** — Shared types, UI components, and utilities packages

## Project Structure

```
.
├── apps/
│   ├── frontend/           # Expo app (iOS, Android, Web)
│   │   ├── app/            # File-based routing (expo-router)
│   │   │   ├── (tabs)/     # Tab navigation (Dashboard, Profile)
│   │   │   ├── auth/       # Auth screens (sign-in, sign-up, etc.)
│   │   │   └── _layout.tsx # Root layout with auth state management
│   │   ├── components/     # Reusable UI components
│   │   ├── config/         # Firebase config, app version
│   │   ├── context/        # React Context providers (Auth)
│   │   └── hooks/          # Custom hooks (analytics, functions, etc.)
│   └── functions/          # Firebase Cloud Functions (v2)
│       └── functions/src/  # Function source code
├── packages/
│   ├── types/              # Shared TypeScript types
│   └── ui/                 # Shared UI components
├── .github/
│   └── workflows/          # GitHub Actions (web deploy)
├── firebase.json           # Firebase project configuration
├── firestore.rules         # Firestore security rules
└── turbo.json              # Turborepo task configuration
```

## 🚀 Getting Started

### Quick Start with AI

The fastest way to build your app: open [`AI_BOOTSTRAP_PROMPT.md`](AI_BOOTSTRAP_PROMPT.md), fill in your app details, and paste it into your AI assistant (GitHub Copilot, Claude, ChatGPT). It has full context of this template's architecture and will generate a complete, polished app for you.

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm install -g eas-cli`) — for native builds
- A [Firebase project](https://console.firebase.google.com/) with Blaze plan

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git my-app
cd my-app
pnpm install
```

### 2. Configure Firebase

```bash
# Login to Firebase
firebase login

# Initialize (or link existing project)
firebase use --add
```

### 3. Set Up Environment Variables

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Fill in the values from your [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → Your Apps → Config.

### 4. Start Development

```bash
# Interactive dev menu
./dev.sh

# Or start individually:
pnpm dev                    # Start Expo dev server
firebase emulators:start    # Start Firebase emulators
```

### 5. Configure for Your App

Search and replace these placeholder values:

| Placeholder | File(s) | Replace With |
|---|---|---|
| `My App` | `app.config.js` | Your app name |
| `my-app` | `app.config.js` | Your app slug |
| `com.yourcompany.myapp` | `app.config.js` | Your bundle ID |
| `your-expo-username` | `app.config.js` | Your Expo username |
| `YOUR_EAS_PROJECT_ID` | `app.config.js` | Your EAS project ID |
| `@my-app` | `package.json` files | Your package org name |
| `My App` | `AuthBranding.tsx` | Your app branding |
| Content | `privacy.tsx`, `terms.tsx` | Your legal content |

## 📱 Development

### Dev Helper Script

```bash
./dev.sh
```

Interactive menu with options for:
1. Start Firebase Emulators
2. Build/Watch Functions
3. Deploy Functions, Rules, or Everything
4. View Logs
5. Run Frontend

### Firebase Emulators

| Service | Port | URL |
|---|---|---|
| Emulator UI | 4000 | http://localhost:4000 |
| Functions | 5001 | — |
| Firestore | 8080 | — |
| Auth | 9099 | — |
| Hosting | 5002 | http://localhost:5002 |

Set `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env` to connect the frontend to emulators.

### Cloud Functions

The template includes these Firebase Functions (v2 callable):

| Function | Description |
|---|---|
| `helloWorld` | Health check endpoint |
| `getUserInfo` | Fetch authenticated user's profile |
| `updateUserProfile` | Create/update user profile |
| `scheduleAccountDeletion` | Schedule account for deletion (30-day grace) |
| `cancelAccountDeletion` | Cancel a scheduled deletion |

## 🏗️ Building

### Web

```bash
pnpm build:web        # Build web app
pnpm deploy:web       # Build + deploy to Firebase Hosting
```

### Native (via EAS)

```bash
# Development builds
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview builds (internal testing)
pnpm --filter app-frontend build:android:preview
pnpm --filter app-frontend build:ios:preview

# Production builds
pnpm --filter app-frontend build:android:prod
pnpm --filter app-frontend build:ios:prod
```

### OTA Updates

```bash
# Push update to preview channel
pnpm --filter app-frontend update:preview "Bug fixes"

# Push update to production channel
pnpm --filter app-frontend update:production "Bug fixes"
```

## 🚢 Deployment

### Web (Firebase Hosting)

**Manual:**
```bash
pnpm deploy:web
```

**GitHub Actions:**
Go to Actions → "Deploy Web to Firebase Hosting" → Run workflow.

Required GitHub Secrets:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_SERVICE_ACCOUNT` (JSON service account key)
- `FIREBASE_PROJECT_ID`

### Functions

```bash
pnpm deploy:functions     # Build types + functions, then deploy
pnpm deploy:rules         # Deploy Firestore security rules
pnpm deploy:all           # Build web + deploy everything
```

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Expo SDK 54, React Native 0.81 |
| **Language** | TypeScript 5.9 |
| **UI Library** | GlueStack UI (themed) |
| **Navigation** | Expo Router (file-based) |
| **Backend** | Firebase Cloud Functions v2 |
| **Database** | Cloud Firestore |
| **Auth** | Firebase Authentication (Email, Google, Apple) |
| **Analytics** | Firebase Analytics |
| **Monorepo** | Turborepo + pnpm workspaces |
| **CI/CD** | GitHub Actions + EAS Build |
| **Web Hosting** | Firebase Hosting |
| **OTA Updates** | Expo Updates |

## 📄 License

See the [LICENSE](LICENSE) file for details.

