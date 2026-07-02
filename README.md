# Together — Frontend

Friends start a routine, invite each other to it, and keep a shared streak
alive by completing it every day — either by self check-in, or by uploading
proof that the rest of the group approves.

This repo is the **frontend only**. It runs standalone with sample data right
now, and is wired to drop in a [Back4App](https://www.back4app.com/) (Parse
Server) backend as soon as you add credentials — no code changes required.

## Stack

| Piece | Choice | Why |
|---|---|---|
| Build tool | Vite | Fast dev server, builds to plain static files any host can serve |
| UI | React + TypeScript | Matches most AI/design-tool exports, large ecosystem |
| Styling | Tailwind CSS v4 | Easy to re-skin once real designs arrive |
| Routing | React Router | Standard client-side routing |
| Data layer | TanStack Query | Caching/loading/error states for Back4App queries |
| Forms | react-hook-form + zod | Ready for validation as forms grow |
| Backend SDK | `parse` (Back4App's client SDK) | Talks to Back4App directly from the browser — no custom server needed |

There's no server-rendering or API routes here on purpose: Back4App **is**
the API, called straight from the browser, so a plain static build is all
this app needs. That's also what makes it deployable anywhere without
platform-specific glue.

## Project structure

```
src/
  components/
    layout/        AppLayout, Navbar, ProtectedRoute
    ui/             Button, Input, Card — small primitives everything else uses
  contexts/
    AuthContext.tsx wraps Parse.User (signUp / logIn / logOut / current user)
  lib/
    parse.ts         Back4App SDK initialization
    utils.ts         cn() classname helper
  pages/
    auth/            LoginPage, SignupPage
    routines/        CreateRoutinePage, RoutineDetailPage
    DashboardPage, FriendsPage, ProfilePage, LandingPage, NotFoundPage
  services/
    routineService.ts   typed stubs for routine/streak actions (TODO once backend exists)
  types/
    models.ts        TypeScript types documenting the intended Back4App schema
```

Pages currently show **sample data** so you can click through the whole flow
before the backend is connected. Search the codebase for `mock` to find it —
it's all meant to be swapped for real queries.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs and is fully navigable even with an empty `.env` — auth pages
will just show a "backend not connected" message instead of erroring.

## Connecting Back4App

1. Create an app at [back4app.com](https://www.back4app.com/) if you haven't already.
2. In the dashboard, go to **App Settings → Security & Keys** and copy your
   **Application ID** and **JavaScript Key**.
3. Paste them into `.env`:
   ```
   VITE_PARSE_APP_ID=your-app-id
   VITE_PARSE_JS_KEY=your-js-key
   VITE_PARSE_SERVER_URL=https://parseapi.back4app.com/
   ```
4. Restart `npm run dev`. Sign up / log in on the app now calls real
   `Parse.User` methods.
5. Never put your **Master Key** in this project — it belongs on a trusted
   server only, and this is frontend code that ships to the browser.

### Classes to create in Back4App

`_User` is built in. You'll want these custom classes for the rest of the
app (see `src/types/models.ts` for the full field list with types):

- **Friendship** — friend requests between two users
- **Routine** — a shared habit, with a `verificationType` of either
  `self_check` or `proof_approval`
- **StreakEntry** — one day's check-in for one user on one routine, including
  approval state for proof-based routines

## Deployment

Both configs are already in the repo — connect a git repo and pick a host.

### Vercel
Import the repo, framework preset auto-detects as Vite. Add the three
`VITE_PARSE_*` env vars in **Project Settings → Environment Variables**.
`vercel.json` handles the rewrite so client-side routes don't 404 on refresh.

### Render
Create a **Static Site**, connect the repo. `render.yaml` already sets the
build command (`npm ci && npm run build`), publish directory (`./dist`), and
the SPA rewrite rule. You'll be prompted for the two secret env vars
(`VITE_PARSE_APP_ID`, `VITE_PARSE_JS_KEY`) the first time you sync the
Blueprint.

## Where your designs go

Pages and the `ui/` primitives are intentionally plain right now — Tailwind
utility classes, no strong visual identity — since real designs are coming.
The `@/` import alias (e.g. `@/components/ui/Button`) is already set up in
both `vite.config.ts` and `tsconfig.app.json`, which is the convention most
AI design tools (v0, Bolt, Lovable, etc.) also use, so dropping in generated
components should mostly be a copy-paste plus an import-path fix.

## Notes for later

- **`events` is a direct dependency on purpose.** The `parse` package uses
  Node's built-in `EventEmitter` internally (for its LiveQuery client, which
  gets touched even by a plain `Parse.initialize()` call). Vite doesn't
  polyfill Node built-ins the way older bundlers did, so without a real
  `events` package installed, that import gets silently stubbed out and
  `Parse.initialize()` throws `TypeError: Emitter is not a constructor` at
  runtime. Don't remove this dependency even though nothing here imports it
  directly.
- The production bundle is one JS chunk (~580 kB / 176 kB gzipped). That's
  fine for now; once real pages replace the placeholders, route-level
  `React.lazy()` code-splitting is a quick win if it grows further.
- `npm audit` flags a transitive `ws` vulnerability inside the `parse`
  package (used only for optional Live Query features we're not using). It
  doesn't affect a browser-only SPA build; revisit if you enable Live Query.
- An `EBADENGINE` warning from `parse` about your Node version is safe to
  ignore — it's about the Node version running your tooling, not the browser
  environment the bundle actually runs in.
