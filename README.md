# 🤟 SignMate

**Learn sign language. Practice together. Connect with confidence.**

A React frontend built for **AISC 2026**, featuring guided learning, camera-based practice, and the **SignConnect** peer practice experience. The app interface is primarily in Vietnamese.

## ✨ Features

- **Learning:** learning paths, lessons, quizzes, and progress tracking interfaces.
- **AI Practice:** local camera preview with simulated feedback.
- **SignConnect:** demo matching, split-screen camera layout, floating chat, emoji reactions, reviews, and rewards.
- **Community:** friends, requests, and video invitation/scheduling interfaces.
- **Account:** Firebase authentication, dashboard, profile, statistics, and leaderboard.

> **Demo status:** Firebase authentication and local camera/microphone controls are integrated. AI feedback, matching, and much of the learning/social data are simulated. Live peer-to-peer calling, remote chat delivery, and screen sharing are not connected yet.

## 🛠️ Tech Stack

**React 19 · Vite 8 · React Router 7 · Firebase 12 · Tailwind CSS 4 · Lucide React**

## 🚀 Getting Started

**Requirements:** Node.js 22.13+ within the 22.x series, or Node.js 24+, npm, and access to the team's Firebase web app configuration.

### 1. Install

```sh
git clone https://github.com/ThankTran/AISC2026-SignMate_Frontend.git
cd AISC2026-SignMate_Frontend
npm ci
```

### 2. Configure Firebase

Copy [`.env.example`](.env.example) to `.env` in the project root:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```sh
# macOS / Linux
cp .env.example .env
```

Fill in all six `VITE_FIREBASE_*` variables using the team's Firebase configuration from **Project settings → General → Your apps**. The project needs Email/Password authentication, Google authentication for Google sign-in, and Firestore permissions for registration to write `users/{uid}`.

Keep `.env` out of Git. Never place server secrets in `VITE_*` variables, since they are exposed to the browser.

### 3. Run

```sh
npm run dev
```

Open the **Local** URL printed by Vite, then register or sign in. Restart Vite after editing `.env`. An empty or invalid Firebase API key can cause a blank page.

For an optional lesson backend, add `VITE_API_BASE_URL` to `.env`; failed lesson API requests currently use local demo fallbacks.

## 📦 Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

Run the video-call utility and storage tests:

```sh
node --test src/utils/videoCall/videoCall.test.mjs src/services/videoCall/demoSessionStorage.test.mjs
```

**Deployment:** serve `dist/` over HTTPS, configure an `index.html` fallback for client-side routes, and supply Firebase variables at build time. Camera/microphone access requires browser permission and localhost or HTTPS.

## 📁 Project Structure

```text
src/
  components/   Shared and feature-specific UI
  pages/        Route-level screens
  layouts/      Main and authentication layouts
  routes/       Routes and access guards
  contexts/     Authentication context
  hooks/        Stateful behavior and media controls
  lib/          Firebase initialization
  mockdata/     Demo data by feature
  services/     API clients and demo storage
  utils/        Helpers and tests
```

See [route definitions](src/routes/AppRoutes.jsx) and the [video-call feature guide](src/pages/VideoCall/README.md) for implementation details.

## 👥 Contributors

- **[Trần Thị Hồng Thanh](https://github.com/ThankTran)**
- **[Nguyễn Ngọc Lan Anh](https://github.com/ngnlananh)**
- **[Đào Thị Mai Chi](https://github.com/maichidao)**

Thanks to everyone building SignMate! See the [contribution history](https://github.com/ThankTran/AISC2026-SignMate_Frontend/graphs/contributors).

## 📄 License

Licensed under the [MIT License](LICENSE).

### Firestore UI flags
Postgres owns name, bio, user type, privacy, curriculum level and progress. Firestore `users/{uid}` only stores `onboardingComplete`; legacy profile fields are ignored. Rules allow only the owner to read/delete the document and change that boolean. XP, roles, level and profile writes are denied.

To deploy, select the intended Firebase project, configure `firestore.rules` in `firebase.json` (`{"firestore":{"rules":"firestore.rules"}}`), then run `firebase deploy --only firestore:rules --project <project-id>`. Review the project ID before deployment. These rules have not been deployed by this task.
