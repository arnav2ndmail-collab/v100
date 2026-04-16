# TestZyro — BITSAT/JEE CBT Platform

## Setup Guide

### Step 1: Create a Supabase Project (FREE)
1. Go to https://supabase.com → Sign Up (free)
2. Create a new project (pick any region)
3. Wait for it to initialize (~2 min)
4. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Set up the Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` and paste → Run
3. Done! Tables are created automatically.

### Step 3: Add Environment Variables

#### On Render:
- Go to your service → **Environment** tab
- Add these variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```

#### On Vercel:
- Go to Project → **Settings → Environment Variables**
- Add the same 3 variables

#### For local dev:
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Step 4: Upload Tests
Put your test JSON files in: `public/tests/BITSAT/`
- Example: `public/tests/BITSAT/bitsat_paper_1.json`
- Generate JSON files from Admin page → BITSAT ZIP processor

### Step 5: Deploy

#### Render:
- Build command: `yarn install; yarn build`
- Start command: `yarn start`

#### Vercel:
- Just connect your GitHub repo, Vercel auto-detects Next.js

## Features
- ✅ Login/Signup with Supabase Auth
- ✅ Full-length CBT with timer
- ✅ Auto-save & resume
- ✅ Analytics dashboard (scores, accuracy, subject breakdown)
- ✅ Bookmarks & notebooks
- ✅ Bonus questions
- ✅ Admin ZIP uploader
- ✅ Dark/light mode

## Works on: Render, Vercel, Railway, Fly.io (any Node.js host)
