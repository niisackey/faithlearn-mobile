# faithlearn-mobile

The faithlearn learner app: Bible stories, videos and songs, with a quiz after each lesson and class and global leaderboards. Children can start as guests with no login. It talks to **faithlearn-api**.

Stack: Expo (React Native), expo-router, TypeScript.

## Run locally

Start faithlearn-api with `--host 0.0.0.0`, then:

```bash
npm install
npx expo start     # scan the QR code with Expo Go, or press w for web
```

In development, the app calls the API on the machine running Metro (port 8000), so a phone on the same Wi-Fi works with no config. To use another API, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.

- Add libraries with `npx expo install <package>`; it picks versions that match the SDK.
- Before pushing, run `npm run typecheck` and `npx expo-doctor` (CI runs both).

## Code map

- `src/app/`: screens (expo-router; each file is a route)
  - `onboarding.tsx`: age picker, creates a guest
  - `(tabs)/index.tsx`, `(tabs)/leaderboard.tsx`, `(tabs)/profile.tsx`
  - `lesson/[id].tsx`, `quiz/[id].tsx`, `auth/login.tsx`, `auth/register.tsx`
- `src/api/`: API client and types (keep in sync with faithlearn-api)
- `src/state/session.tsx`: guest id / JWT, stored in SecureStore
- `src/components/`: buttons, inputs, lesson media player (YouTube embed or native video)

## Environments and builds (EAS)

| EAS profile | API | Use |
|---|---|---|
| `development` | your local API | dev client on your own device |
| `preview` | `https://faithlearn-api-staging.onrender.com` | installable test builds for the team and the church pilot |
| `production` | `https://faithlearn-api.onrender.com` | App Store / Google Play |

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview      # staging build to share
npx eas-cli@latest build --profile production   # store build
npx eas-cli@latest submit --platform android    # once store accounts exist
```

Branch flow is the same as the other repos: feature branch → pull request into `staging` → test a `preview` build → pull request from `staging` into `main` → `production` build. In GitHub, go to Settings → Branches and protect `main` and `staging` (require a pull request and the **CI** check).

Store accounts: Apple Developer is $99/yr and Google Play is $25 once. Fill in `submit.production` in [eas.json](eas.json) when they exist.
