# PharmaPro — Android APK

## Method 1: GitHub Actions (Recommended)

### Step 1 — GitHub Repo
1. github.com → New repository → Name: `pharmapro-android`
2. Upload ALL files from this ZIP

### Step 2 — Expo Token
1. expo.dev → Account Settings → Access Tokens → Create
2. GitHub repo → Settings → Secrets → New secret
   - Name: `EXPO_TOKEN`
   - Value: (paste token)

### Step 3 — Build
Actions → Run workflow → Wait 15-20 min

### Step 4 — Download APK
expo.dev → Projects → pharmapro → Builds → Download

---

## Method 2: Local Build (CMD)

Requirements: Node.js 20+

```bash
npm install
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## Login Credentials
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| manager | manager123 | Manager |
| employee | emp123 | Employee |

## Notes
- Internet required for first load (React CDN)
- All data saved in local storage
- Supabase sync available in Settings
