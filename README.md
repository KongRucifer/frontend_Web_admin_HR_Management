# HR_App — Web Admin (React)

Admin dashboard for the check-in/check-out system.
**Vite + React + TypeScript + Tailwind + shadcn/ui**, blue & white theme,
Lao/English (react-i18next), Zustand (auth) + TanStack Query (server data).

## Requirements
- Node 18+ and pnpm
- The backend running on `http://127.0.0.1:3000` (see `../backend`)

## Run (dev)
```bash
cd web-admin
pnpm install
pnpm dev
```
Open http://localhost:5173 and log in with **admin / admin123**.

Vite proxies `/api` → `http://127.0.0.1:3000`, so the API is same-origin and the
**httpOnly auth cookie** works over plain HTTP in dev (SameSite=Lax).

## Build
```bash
pnpm build      # type-check + production bundle in dist/
pnpm preview    # preview the built bundle
```

## Structure
```
src/
├── api/hooks.ts          TanStack Query hooks per resource
├── components/
│   ├── ui/               shadcn/ui components (button, input, card, table, dialog, ...)
│   ├── layout/           Sidebar, Topbar, AppLayout
│   ├── PageHeader.tsx
│   └── ProtectedRoute.tsx
├── i18n/                 lo.json / en.json + config
├── lib/                  api (axios), utils (cn, date formatters)
├── pages/                Login, Dashboard, Attendance, Employees, Departments,
│                         Schedules, Wifi, Users
├── store/auth.store.ts   Zustand auth (httpOnly-cookie backed)
└── types/                shared API types
```

## Auth model
- Login calls `POST /api/auth/login`; the backend sets an **httpOnly cookie**
  (JS can't read it). We keep a light copy of the user profile for the UI.
- On load, `fetchMe()` re-validates the session via `GET /api/auth/me`.
- Logout calls `POST /api/auth/logout` to clear the cookie.

## Theme & i18n
- Blue/white via CSS variables in `src/index.css` (light + dark).
- Language toggle (ລາວ / English) in the top bar and login page; default Lao.

## Responsive
Sidebar collapses to an off-canvas drawer under `lg`; stat grids and filter
rows reflow from 1 column (sm) up to 4 (xl).
