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

### 2. Configure the backend URL

Copy [`.env.example`](.env.example) to `.env` in the project root:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```sh
# macOS / Linux
cp .env.example .env
```

Set `VITE_API_BASE_URL=http://localhost:8080` and `VITE_USE_MOCK=false`. Start the backend, then register an email/password account. Firebase is no longer required.

Keep `.env` out of Git. Never place server secrets in `VITE_*` variables, since they are exposed to the browser.

### 3. Run

```sh
npm run dev
```

Open the **Local** URL printed by Vite, then register or sign in. Restart Vite after editing `.env`. The backend must be reachable for registration and login.

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

**Deployment:** serve `dist/` over HTTPS, configure an `index.html` fallback for client-side routes, and supply `VITE_API_BASE_URL` at build time. Camera/microphone access requires browser permission and localhost or HTTPS.

## 📁 Project Structure

```text
src/
  components/   Shared and feature-specific UI
  pages/        Route-level screens
  layouts/      Main and authentication layouts
  routes/       Routes and access guards
  contexts/     Authentication context
  hooks/        Stateful behavior and media controls
  services/     Backend API and local session client
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

### Database accounts
Registration, login, password changes, deletion and onboarding use the backend database. The session token is kept in sessionStorage and expires after seven days on the server. Logout revokes the current session; password changes revoke all previous sessions. Google login is removed; email recovery is not configured. Existing Firebase accounts require a separate verified migration and are not linked automatically by email.

Camera trên điện thoại cần HTTPS (ví dụ tunnel HTTPS tới Vite, hoặc cấu hình chứng chỉ HTTPS cho Vite). getUserMedia chỉ hoạt động trên HTTPS hoặc localhost; UUID fallback không loại bỏ yêu cầu bảo mật của camera.

