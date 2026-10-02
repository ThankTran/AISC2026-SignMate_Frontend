# Responsive audit

Local fixture data, 2026-10-02. Checked one H1, heading order, text >=12px, hit areas >=44px on mobile / >=24px desktop, and document overflow. Radio/checkbox hit areas include their enclosing label. Wide leaderboard tables intentionally scroll within their container. Camera/WebRTC connections are not covered by this layout audit.

| Page | 360px | 768px | 1440px |
| --- | --- | --- | --- |
| /dashboard | PASS | PASS | PASS |
| /learning-path | PASS | PASS | PASS |
| /ranking | PASS | PASS | PASS |
| /account/stats | PASS | PASS | PASS |
| /account/profile | PASS | PASS | PASS |
| /friends/list | PASS | PASS | PASS |
| /friends/friend-requests | PASS | PASS | PASS |
| /friends/video-call-invites | PASS | PASS | PASS |
| /video | PASS | PASS | PASS |
| /practice-ai | PASS | PASS | PASS |
| /learning-path/lesson/1 | PASS | PASS | PASS |
| /learning-path/quiz/1 | PASS | PASS | PASS |
| /learning-path/quiz/1/result | PASS | PASS | PASS |
| / | PASS | PASS | PASS |
| /login | PASS | PASS | PASS |
| /register | PASS | PASS | PASS |
| /forgot-password | PASS | PASS | PASS |
| /reset-password | PASS | PASS | PASS |
| /verify-email | PASS | PASS | PASS |
| /level | PASS | PASS | PASS |
| /onboarding | PASS | PASS | PASS |
| /faq | PASS | PASS | PASS |
| /terms | PASS | PASS | PASS |
| /privacy | PASS | PASS | PASS |
| /contact | PASS | PASS | PASS |

Desktop page gutter increased from 20px to 28px; mobile stays 16px. Sidebar user area and app footer retain the shared 72px baseline.
