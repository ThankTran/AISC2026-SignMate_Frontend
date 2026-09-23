# SignMate Frontend

SignMate is a sign language learning and practice web application developed for AISC 2026. It brings together guided lessons, quizzes, camera-based practice, and a peer practice experience called **SignConnect**.

This repository contains the React frontend. The interface is primarily in Vietnamese. Firebase authentication is integrated; several learning, social, and video-call experiences currently use demo data or simulated results.

## Features and implementation status

| Area | Current implementation |
| --- | --- |
| Authentication | Email/password sign-in and registration, Google sign-in on the login page, and Firebase auth state management. Registration also creates a Firestore user document. |
| Learning | Learning path, lesson exercises, chapter quizzes, results, and progress interfaces. Lesson answer checking and completion can call an API, with local demo fallbacks. |
| AI practice | Local camera preview, practice controls, and simulated feedback/metrics. A production sign-recognition model is not connected. |
| Community | Friends, friend requests, recent connections, and video invitation/scheduling interfaces backed by mock data and frontend state. |
| SignConnect | Topic selection, simulated matching, partner profiles, local camera/microphone controls, split-screen layout, chat, emoji reactions, reviews, and demo rewards. |
| Account | Dashboard, profile, statistics, and leaderboard interfaces. Displayed demo data should not be treated as synchronized account records. |

### SignConnect call experience

- Switch between a small self-camera preview and an edge-to-edge, equal-width split view: partner on the left, local camera on the right.
- Reveal the expand/collapse control by hovering over the local camera or focusing the control with the keyboard. The control remains available on touch devices.
- Toggle the microphone from the toolbar or the camera overlay. The overlay uses a red crossed-out mic when muted and a green mic when enabled.
- Send local chat messages through a livestream-style overlay, with emoji insertion and retained message history while the chat panel is hidden.
- Open the reaction picker and repeatedly send floating emoji without closing the picker after each selection.
- Complete a call review, view demo XP, or use the block/report dialogs.

**This is not yet a live peer-to-peer calling service.** Matching uses a timer and sample profiles. The remote camera is a placeholder; chat and reactions are local UI state. WebRTC, signaling, remote message delivery, and screen sharing are not implemented. Reviews and reports are stored in browser session storage, and blocking applies to the current demo flow.

## Technology stack

| Technology | Purpose |
| --- | --- |
| React 19 | Component UI and state management |
| Vite 8 | Development server and production build |
| React Router 7 | Client-side routing and route guards |
| Firebase 12 | Authentication and Firestore client |
| Tailwind CSS 4 and CSS stylesheets | Styling and responsive layouts |
| Lucide React | Interface icons |
| ESLint 10 | Static code checks |
| Node.js test runner | Video-call utility and storage tests |

Exact dependency versions are recorded in `package-lock.json`.

## Getting started

### Prerequisites

- Node.js **22.13 or later in the 22.x series**, or Node.js **24 or later**, with npm. These versions satisfy the installed Vite and ESLint engine requirements.
- Access to the team's Firebase project and its web app configuration.
- A browser with camera/microphone support for local media features.

### 1. Clone and install

```sh
git clone https://github.com/ThankTran/AISC2026-SignMate_Frontend.git
cd AISC2026-SignMate_Frontend
npm ci
```

Use `npm ci` for an installation based on the committed lockfile. Use `npm install` when intentionally changing dependencies, and commit the updated lockfile with the dependency change.

### 2. Configure the environment

Create `.env` in the repository root, next to `package.json`.

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```sh
cp .env.example .env
```

Populate all six Firebase variables with the configuration for the same Firebase web app:

```dotenv
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-web-app-id
```

These are placeholders, not working credentials. Copy the exact values supplied by your project maintainer or the Firebase web app configuration. Do not guess the storage bucket or app ID.

| Variable | Firebase configuration field |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

The Firebase client is initialized in [`src/lib/firebase.js`](src/lib/firebase.js). `.env` is ignored by Git. Vite exposes `VITE_*` values to the browser bundle; never put service-account private keys or server-only secrets in these variables.

#### Firebase project setup

In the team's [Firebase Console](https://console.firebase.google.com/):

1. Open **Project settings → General → Your apps** and select the web app to obtain its configuration.
2. Under **Authentication → Sign-in method**, enable **Email/Password**. Enable **Google** if Google sign-in is needed.
3. Check the authentication authorized domains for the local development and deployed hosts.
4. Configure Cloud Firestore for registration. The registration page writes a document at `users/{uid}` with the user's name, email, `hasSetLevel`, and creation timestamp. Firestore rules must permit the intended authenticated write while protecting other users' records.

Use the existing team project when contributing. Firebase rules, project provisioning, and backend deployment are not configured by this repository.

#### Optional lesson API

Add this variable to `.env` only when connecting a lesson backend:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

The address above is an example; use the actual backend origin, without a trailing slash. The client in [`src/services/lessonApi.js`](src/services/lessonApi.js) sends JSON POST requests to:

- `/api/lessons/check-answer`
- `/api/lessons/finish`

Without a base URL, these requests target the frontend origin. Failed requests currently fall back to simulated answer checking and a local lesson summary. No lesson backend or development proxy is included here. A separate backend origin must allow the frontend origin through its CORS configuration.

### 3. Start the app

```sh
npm run dev
```

Open the **Local** URL printed by Vite. Restart the development server after changing `.env`.

Create an account or sign in to access protected pages. Email/password registration signs the new user out after creating the profile and redirects to the login page.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Generate the production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally for inspection |
| `npm run lint` | Run ESLint across the repository |

Run the existing video-call tests directly with Node.js:

```sh
node --test src/utils/videoCall/videoCall.test.mjs src/services/videoCall/demoSessionStorage.test.mjs
```

There is currently no `npm test` script. These tests cover pure utility behavior and demo storage, not browser media permissions or end-to-end calling.

## Routes

Routes are centralized in [`src/routes/AppRoutes.jsx`](src/routes/AppRoutes.jsx).

| Route | Page | Access |
| --- | --- | --- |
| `/` | Welcome | Public |
| `/login` | Login | Public |
| `/register` | Registration | Public |
| `/dashboard` | Dashboard | Signed in |
| `/learning-path` | Learning path | Signed in |
| `/learning-path/lesson/:lessonId` | Lesson | Signed in |
| `/learning-path/quiz/:quizId` | Quiz | Signed in; quiz access guard also applies |
| `/learning-path/quiz/:quizId/result` | Quiz results | Signed in |
| `/practice-ai` | AI practice | Signed in |
| `/ranking` | Leaderboard | Signed in |
| `/video`, `/video-call` | SignConnect | Signed in |
| `/friends`, `/friends/list` | Friends | Signed in |
| `/friends/friend-requests` | Friend requests | Signed in |
| `/friends/video-call-invites` | Video invitations | Signed in |
| `/account/profile` | Profile | Signed in |
| `/account/stats` | Statistics | Signed in |

Protected pages render inside `MainLayout`, which provides the sidebar, header, scrollable page area, and footer. The call room overlays this layout while a demo call is active.

## Project structure

```text
public/                   Static assets served from the site root
src/
  assets/                 Assets imported by application modules
  components/             Reusable and feature-specific UI components
    VideoCall/            Call screens, controls, chat, and feature styles
  contexts/               Shared React context, including authentication
  hooks/                  Stateful behavior and browser integrations
    videoCall/            Matching flow, local media, chat, and dialog hooks
  layouts/                Authentication and main application layouts
  lib/                    Firebase client initialization
  mockdata/               Sample data organized by feature
  pages/                  Route-level screens
  routes/                 Route definitions and access guards
  services/               API clients and demo persistence boundaries
  utils/                  Pure helpers and utility tests
  App.jsx                 Router, authentication provider, and app routes
  main.jsx                React application entry point
  index.css               Shared styles, theme tokens, and Tailwind import
```

For the video-call feature's internal organization, see its [feature README](src/pages/VideoCall/README.md) (currently in Vietnamese).

## Development guidelines

- Keep page composition in `pages/`, UI components in `components/`, and shared stateful behavior in `hooks/`.
- Keep mock data separate from UI components and replace it through hooks/services when connecting a backend.
- Add routes in `AppRoutes.jsx` while preserving the authentication provider and route guards.
- Scope feature styles to avoid collisions. Video-call styles use the `vc-` prefix, with responsive overrides imported last.
- Preserve keyboard access, accessible button names, visible focus indicators, and reduced-motion behavior.
- Release media tracks and clear timers when the owning component unmounts.
- Run the build, applicable tests, and lint before submitting a change. Report existing failures separately from new regressions.

### Manual video-call checks

1. Sign in, open `/video`, select topics, and start or cancel matching.
2. View a partner profile, search again, and start the demo call.
3. Toggle camera and microphone; check permission-denied behavior and red/green microphone indicators.
4. Switch between the small camera preview and split view; verify hover, keyboard, and touch access to the layout control.
5. Send chat messages and insert emoji. Hide and reopen chat to check message history.
6. Open the reaction picker and send several emoji without closing it.
7. End the call, submit a review, and view demo rewards. Check block/report dialogs and storage-error feedback.
8. Repeat layout checks at desktop and mobile widths. Confirm that camera labels, controls, and chat do not overlap unexpectedly.

## Production build

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host. Configure a single-page application fallback to `index.html` so direct visits to routes such as `/video` work. Supply the Firebase environment variables when building; changing server environment variables after the bundle is built does not update the compiled frontend configuration.

Use HTTPS for deployed camera/microphone features and configure the deployed domain in Firebase Authentication. `npm run preview` is a local verification server, not a production hosting setup.

## Troubleshooting and known limitations

| Symptom | What to check |
| --- | --- |
| Blank page with `auth/invalid-api-key` | Confirm that `.env` exists at the repository root and contains a valid Firebase web API key. Restart Vite after editing it. Copying the empty example alone is insufficient. |
| Redirected to `/login` | The requested route is protected. Sign in with an account from the configured Firebase project. |
| Registration fails | Check Email/Password authentication, Firestore availability, and permissions for the `users/{uid}` write. |
| Google sign-in fails | Check the Google provider, authorized domains, and whether the browser blocked the popup. |
| Camera or microphone unavailable | Check browser/site permissions and device availability. Use localhost during development or HTTPS when deployed. |
| Lesson API requests fail | Verify `VITE_API_BASE_URL`, backend endpoints, and CORS. The current lesson page uses demo fallbacks on failure. |
| A deployed route returns 404 after refresh | Configure the host to serve `index.html` for client-side routes. |
| Lesson videos do not load | The lesson page references `/videos/ky-hieu-1.mp4` through `/videos/ky-hieu-8.mp4`; these assets are not currently included in `public/`. |

Additional implementation notes:

- AI scores, matching compatibility, rewards, and much of the learning/social data are demo values.
- Email verification, password recovery/reset, and level-selection routes are currently commented out. Some UI links still point to these unfinished flows.
- The registration page's Google button is not wired; Google sign-in is implemented on the login page.
- Unknown routes currently render a placeholder inside the protected layout instead of a dedicated 404 screen.
- At the time of this README update, repository-wide lint reports six existing errors in `AuthContext.jsx`, `Login.jsx`, `Welcome.jsx`, and `PublicOnlyRoute.jsx`. These are unused-variable and Fast Refresh export issues.
- Vite currently reports a large JavaScript chunk warning during production builds. Route-level code splitting remains an optimization opportunity.

## License

This project is licensed under the [MIT License](LICENSE).
