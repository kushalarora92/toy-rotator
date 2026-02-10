# AI Bootstrap Prompt — Build Your App

> **How to use**: Copy everything in this file and paste it into your AI assistant (GitHub Copilot, Claude, ChatGPT, etc.). Fill in the `[YOUR APP DETAILS]` section below with your app idea, then let the AI build it out.

---

## [YOUR APP DETAILS] — Fill this in before running the prompt

```
directory: "toy-rotator"
App Name: "ToyRotator"
App Description:
A toy organization and rotation app for parents of young children. The app helps families reduce toy clutter, intentionally rotate toys, and receive age-aware, non-medical play insights. Parents can organize toys manually for free, while optional AI assistance suggests toy rotations and insights.

Bundle ID: [e.g. "com.kodianlabs.toyrotator"]
Expo Owner: kushalarora92

Tabs / Screens needed (besides the built-in Dashboard & Profile):

- Dashboard:
  Shows the current toy rotation, next rotation countdown, and a short insight explaining what this rotation supports.

- Toy Library:
  Manage all toys owned by the family. Users can add toys manually (free), categorize them using built-in categories, and optionally use AI photo-based toy recognition (paid, limited).

- Rotation:
  View upcoming or suggested toy rotations. Users can accept AI-suggested rotations (paid, limited) or create rotations manually.

Key Features:

- Toy organization is always free:
  - Unlimited manual toy entry
  - Built-in toy categories provided by the app
  - Manual categorization and editing

- Rotation system:
  - Users define how many toys can be displayed (e.g. 10)
  - Users define rotation length (1, 2, 3, 4, 7, or 30 days)
  - Manual rotation creation is always available
  - AI rotation suggestions are optional and limited

- Child profile:
  - Name
  - Date of birth (used only for age calculation)
  - Optional interests
  - Preferred rotation cadence
  - Reminder time

- Insights (non-medical, non-diagnostic):
  - Explain what skills or play styles a given rotation emphasizes (e.g. fine motor, language exposure, problem-solving)
  - Language must be high-level, informational, and optional

- Collaboration:
  - Invite caregivers (e.g. spouse)
  - Shared toy library and rotations
  - Caregivers can view and log engagement feedback

Monetization & Subscription Rules (IMPORTANT):

- Free Tier (always available):
  - Unlimited manual toy entry
  - Manual toy categorization
  - Manual toy rotations
  - View child profile and rotation history
  - App remains fully usable without payment

- 21-Day Free Trial:
  - Access to paid features with limits
  - AI toy photo recognition (limited)
  - AI rotation suggestions capped at 1 per day per user
  - Insights and reminders enabled

- Paid Subscription – Level 1:
  - Continues AI-assisted features with limits
  - AI rotation suggestions capped at 1 per day per user
  - AI toy recognition with monthly limits
  - Insights and collaboration features enabled

- If a user does not renew:
  - All data remains accessible
  - Manual toy management and manual rotations remain available
  - AI features and insights are disabled
  - No data loss or blocking of core functionality

Data Model (per household / user):

- ChildProfile:
  - name
  - dateOfBirth
  - interests[]
  - rotationSettings (displayCount, durationDays, reminderTime)

- Toy:
  - name
  - category
  - ageRange
  - skillTags[]
  - source (manual | ai)
  - status (active | resting | retired)
  - createdAt / updatedAt

- Rotation:
  - startDate
  - endDate
  - toyIds[]
  - source (manual | ai)
  - insightSummary
  - createdAt / updatedAt

- Feedback:
  - toyId
  - engagement (liked | neutral | ignored)
  - timestamp

- SubscriptionStatus:
  - tier
  - trialEndDate
  - active
  - aiUsageCounters

UI Preferences:

- Calm, minimalist, parent-friendly design
- Card-based layout
- Clear explanations for AI suggestions
- Dark and light mode supported
- No medical language, no milestone scoring

Additional Notes:

- AI suggestions must be explainable and editable by the parent
- Avoid any diagnostic or prescriptive language
- The app supports decision-making, not parenting advice


Onboarding & Space Analysis (New):

- One-time Guided Onboarding (“Play Wizard”):
  - After first sign-in, show a skippable, step-by-step walkthrough explaining:
    - The problem of toy clutter and decision fatigue
    - The concept of limited, intentional toy display
    - How toy rotation works in the app
    - Example visuals (e.g., cluttered space → curated shelf)
  - This onboarding is shown only once per user
  - Users can replay it later from the Profile screen

- Space Photo Upload (Optional):
  - Users can optionally upload a photo of their current play area
  - Purpose is understanding and reflection, not interior redesign
  - The app must not promise room redesigns or furniture layouts

- Space Analysis Logic:
  - Free users:
    - Can upload one space photo
    - Receive basic, rule-based observations (e.g. toys stacked, no clear display boundary, large and small toys mixed)
  - Trial and Paid users:
    - Receive AI-generated, explainable insights based on the uploaded space photo
    - Insights connect the physical space to toy rotation concepts (e.g. display capacity, separating large toys)
    - Language must remain non-judgmental, non-prescriptive, and non-medical

- Visualization Guidelines:
  - Use illustrative examples of toy shelves or display setups
  - Do not generate custom interior design layouts
  - All visuals are examples, not guarantees

- Feature Gating:
  - Space photo upload is available to all users
  - AI-powered space insights are part of paid features (available during 21-day trial with limits)
  - If subscription ends, uploaded photos remain accessible, but AI insights are disabled

```

---

## Prompt for AI

You are an expert full-stack mobile/web developer. I have created a new project from the **expo-app-template** — a production-ready monorepo with Expo (React Native + Web), Firebase (Auth, Firestore, Cloud Functions), and Turborepo.

**Your job**: Transform this template into a fully polished, publish-ready app based on the details I've provided above. The app should work on iOS, Android, and Web.

### CRITICAL INSTRUCTIONS

1. **Think thoroughly first.** Before writing any code, analyze my app requirements and create a detailed implementation plan. Identify:
   - What new screens/tabs need to be created
   - What data models (Firestore collections/subcollections) are needed
   - What Cloud Functions need to be written
   - What shared types need to be added
   - What Firestore security rules are needed
   - Any questions or ambiguities in my requirements

2. **Ask me questions** if anything is unclear before proceeding. I'd rather clarify upfront than redo work later.

3. **Only proceed with implementation after I confirm the plan.**

---

### WHAT'S ALREADY BUILT (DO NOT REBUILD THESE)

The template already has these features fully implemented and working. **Use them, extend them, but do not recreate them:**

#### Authentication (complete flow)
- Email/password sign-up, sign-in, password reset, email verification
- Google Sign-In (native via `@react-native-google-signin/google-signin` + web popup)
- Apple Sign-In (native via `expo-apple-authentication` + web OAuth)
- Auth state persistence (survives app restart on both web and native)
- `AuthContext` with `user`, `userProfile`, `loading`, `needsProfileSetup`, `isScheduledForDeletion`
- Auth screens: `app/auth/sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`, `verify-email.tsx`
- `AuthBranding` component for consistent branding across auth screens
- `GoogleSignInButton` and `AppleSignInButton` reusable components

#### Profile Setup & Management
- First-login profile setup flow (`app/profile-setup.tsx`) with Terms/Privacy agreement
- Profile tab (`app/(tabs)/profile.tsx`) with edit name, email display, account management links
- `useFirebaseFunctions` hook with: `getUserInfo`, `updateUserProfile`, `scheduleAccountDeletion`, `cancelAccountDeletion`

#### Account Deletion (GDPR-compliant)
- Full 30-day grace period flow with schedule/cancel
- `DeleteAccountModal`, `DeletionScheduledBanner`, `account-deletion.tsx` blocked screen
- Cloud Functions: `scheduleAccountDeletion`, `cancelAccountDeletion`

#### Legal Pages
- `app/privacy.tsx`, `app/terms.tsx`, `app/support.tsx`, `app/delete-account.tsx` (public)
- Linked from profile tab and profile setup

#### Dashboard
- `app/(tabs)/index.tsx` — placeholder dashboard with welcome header
- **This is the main screen you should customize** for the app's primary view

#### Navigation & Layout
- Tab-based navigation (Dashboard + Profile by default)
- `WebNavigationBar` for desktop web (horizontal nav replaces bottom tabs)
- `WebContainer` (max 800px centered) for web readability
- Responsive utilities: `useIsDesktop('md')` hook

#### Infrastructure
- Firebase Analytics (`useAnalytics`, `useScreenTracking` hooks)
- Force/soft update system (`config/appVersion.ts`, `useVersionCheck`, `ForceUpdateModal`)
- EAS Build config (`eas.json` with development, preview, production profiles)
- OTA Updates via Expo Updates
- Firebase Hosting config for web deployment
- GitHub Actions workflow for web deploy
- `dev.sh` helper script for local development

---

### TEMPLATE ARCHITECTURE (reference this when building)

#### File Structure
```
apps/frontend/
├── app/
│   ├── _layout.tsx              # Root layout — auth state routing, version check, WebContainer
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab layout — tabs config, WebNavigationBar, logout button
│   │   ├── index.tsx            # Dashboard tab (customize this)
│   │   └── profile.tsx          # Profile tab (extend if needed)
│   ├── auth/                    # Auth screens (sign-in, sign-up, etc.)
│   ├── profile-setup.tsx        # First-login profile setup
│   ├── privacy.tsx              # Privacy policy
│   ├── terms.tsx                # Terms of service
│   ├── support.tsx              # Support page
│   ├── delete-account.tsx       # Public deletion info
│   └── account-deletion.tsx     # Blocked screen for scheduled deletion
├── components/
│   ├── AppleSignInButton.tsx    # Apple Sign-In button (iOS + web)
│   ├── AuthBranding.tsx         # Logo + title for auth screens
│   ├── GoogleSignInButton.tsx   # Google Sign-In button (native + web)
│   ├── WebContainer.tsx         # Width-limiting container for web
│   ├── WebNavigationBar.tsx     # Desktop web horizontal nav
│   ├── DeleteAccountModal.tsx   # Type "DELETE" confirmation modal
│   ├── DeletionScheduledBanner.tsx
│   ├── ForceUpdateModal.tsx     # App update prompt
│   └── Themed.tsx               # Theme-aware Text/View components
├── config/
│   ├── firebase.ts              # Firebase initialization (auth, firestore, functions, analytics)
│   └── appVersion.ts            # Version check configuration
├── context/
│   └── AuthContext.tsx           # Auth state, profile, deletion status
├── hooks/
│   ├── useAnalytics.ts          # Firebase Analytics (trackEvent, useScreenTracking)
│   ├── useFirebaseFunctions.ts  # Cloud Function callables
│   └── useVersionCheck.ts       # Semantic version comparison
└── utils/
    └── responsive.ts            # useIsDesktop, platform helpers

apps/functions/functions/src/
└── index.ts                     # Cloud Functions: helloWorld, getUserInfo, updateUserProfile,
                                 #   scheduleAccountDeletion, cancelAccountDeletion

packages/types/src/
└── index.ts                     # Shared types: UserProfile, UpdateProfileData, ApiResponse,
                                 #   DELETION_STATUS, DeletionStatus
```

#### Tech Stack
- **Expo SDK 54** / React Native 0.81 / React 19
- **TypeScript 5.9**
- **GlueStack UI** (`@gluestack-ui/themed`) — PRIMARY UI library with dark/light mode
- **FontAwesome icons** (`@expo/vector-icons/FontAwesome`)
- **Expo Router** — file-based routing
- **Firebase** 12.x — Auth, Firestore, Functions (v2 callable), Analytics
- **Turborepo + pnpm** workspaces

#### UI Guidelines (MUST FOLLOW)
- **ALWAYS use GlueStack UI components** as the primary library: `Box`, `VStack`, `HStack`, `Button`, `Input`, `Text`, `Heading`, etc. from `@gluestack-ui/themed`
- Use GlueStack theme tokens for colors: `$background`, `$textLight600`, `$primary500`, `$backgroundLight100`, etc.
- Use `$dark-` prefix for dark mode variants: `$dark-bg="$backgroundDark800"`, `$dark-color="$textDark50"`
- Use `@expo/vector-icons/FontAwesome` for all icons — **no emojis**
- Use `ScrollView` for scrollable content
- Avoid `StyleSheet.create` when possible — prefer GlueStack inline props
- All screens should work in both light and dark mode

#### Data Patterns (MUST FOLLOW)
- Firestore collection: `users/{userId}` — use Firebase Auth UID as document ID
- Use **subcollections** for user-owned lists: `users/{userId}/workouts/{workoutId}`
- Always include `createdAt` and `updatedAt` (Firestore `serverTimestamp()`)
- Cloud Functions: use **v2 callable** (`onCall`) with `request.auth` check
- Frontend calls functions via `useFirebaseFunctions` hook using `httpsCallable`
- Shared types in `packages/types/src/index.ts` — update for your data models
- After updating types, rebuild: `cd packages/types && pnpm build`

#### Environment Variables
- All client env vars use `EXPO_PUBLIC_` prefix
- Access directly: `process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- Firebase config is in `apps/frontend/config/firebase.ts`
- `.env.example` exists for reference

---

### WHAT I NEED YOU TO DO

Based on my app details above, implement the following:

#### 1. Rename & Brand the App
- Update `app.config.js`: name, slug, scheme, owner, bundleIdentifier/package
- Update `AuthBranding.tsx` default title and tagline
- Update `config/appVersion.ts` store URLs
- Update `WebNavigationBar.tsx` nav items if new tabs are added
- Update `privacy.tsx`, `terms.tsx`, `support.tsx` placeholder content with the app name
- Update `package.json` names if desired (root: org name, frontend: app name, packages: `@org/*`)

#### 2. Define & Implement Data Models
- Add new interfaces to `packages/types/src/index.ts`
- Create Firestore subcollections under `users/{userId}/...` for user data
- Update `firestore.rules` with security rules for new collections

#### 3. Create Cloud Functions
- Add new callable functions to `apps/functions/functions/src/index.ts`
- Follow existing patterns: auth check, Firestore operations, proper error handling
- Import types from `@my-app/types`

#### 4. Create Frontend Hooks
- Add new function callables to `apps/frontend/hooks/useFirebaseFunctions.ts`
- Create any new custom hooks in `apps/frontend/hooks/`

#### 5. Build the Screens
- **Customize Dashboard** (`app/(tabs)/index.tsx`) — the main screen users see after login
- **Add new tabs** if needed (create `app/(tabs)/newtab.tsx`, register in `app/(tabs)/_layout.tsx`)
- Update `WebNavigationBar.tsx` `navItems` array for any new tabs
- Create any additional non-tab screens as needed
- Use `useScreenTracking('Screen Name')` in every screen for analytics

#### 6. Extend Profile Setup (if needed)
- If the app needs additional profile fields, add them to `profile-setup.tsx`
- Update `UpdateProfileData` type and `updateUserProfile` function accordingly

#### 7. Update Context (if needed)
- If app-wide state is needed beyond auth, create new Context providers in `context/`
- Wrap them in `app/_layout.tsx`'s `AppContent`

#### 8. Firestore Security Rules
- Add rules for every new collection/subcollection
- Follow existing pattern: `isOwner(userId)` for user-scoped data

---

### AFTER IMPLEMENTATION — PROVIDE THESE NEXT STEPS

Once all code changes are complete, provide the user with:

#### Setup Instructions
1. **Firebase Project Setup**:
   - Create project at https://console.firebase.google.com
   - Enable Email/Password authentication
   - Enable Google Sign-In provider (set Web Client ID in `.env`)
   - Enable Apple Sign-In provider (configure Services ID for web)
   - Create Firestore database
   - Copy Firebase config to `.env` (reference `.env.example`)
   - Enable Analytics (optional)

2. **Local Development**:
   ```bash
   pnpm install
   cd apps/functions/functions && npm install && cd ../../..
   firebase login
   firebase use --add
   firebase emulators:start   # Terminal 1
   pnpm dev                   # Terminal 2
   ```
   Set `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env` for local testing.

3. **Deploy Functions & Rules**:
   ```bash
   pnpm run build:functions
   pnpm run deploy:functions
   pnpm run deploy:rules
   ```

4. **Deploy Web**:
   ```bash
   pnpm run deploy:web
   ```

5. **Native Builds** (when ready):
   ```bash
   cd apps/frontend
   eas build --platform ios --profile development
   eas build --platform android --profile development
   ```

#### Testing Checklist
- [ ] Sign up with email/password → verify email → complete profile setup
- [ ] Sign in with Google → complete profile setup
- [ ] Sign in with Apple (iOS/web) → complete profile setup
- [ ] Sign in → land on dashboard with correct data
- [ ] Test all new tabs/features
- [ ] Test data persistence (create, read, update)
- [ ] Test dark mode on all screens
- [ ] Test on web (desktop + mobile width)
- [ ] Test logout and re-login
- [ ] Test delete account flow (schedule → cancel)

---

### NOW, ANALYZE MY APP REQUIREMENTS AND CREATE YOUR PLAN.

Look at my `[YOUR APP DETAILS]` section above. Think step by step:
1. What screens and tabs do I need?
2. What Firestore data structure makes sense?
3. What Cloud Functions are needed?
4. What types need to be created?
5. Are there any ambiguities or questions you need answered?

**Present your plan and ask any clarifying questions before writing code.**
