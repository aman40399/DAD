# Vercel Environment Variables Setup

## 🚀 How to Fix the Deployment Error

Your deployment is failing because environment variables are missing. Follow these steps:

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com
2. Log in with your account
3. Select your **DAD** project

### Step 2: Add Environment Variables

1. Click on **Settings** tab
2. Click on **Environment Variables** in the sidebar
3. Add each variable below one by one:

---

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://sgnqnllnnhhrzvdwwktz.supabase.co`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbnFubGxubmhocnp2ZHd3a3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODgzMzYsImV4cCI6MjA3NjQ2NDMzNn0.i4nKvJxXA3TEVIMsg6bn4zTuMSqhUIYyJeI0FVrGMNQ`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbnFubGxubmhocnp2ZHd3a3R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODMzNiwiZXhwIjoyMDc2NDY0MzM2fQ.BcACG4fhQ6sP0tSS-IVGlFUOfVtX-H6CD7jRZ5tGHKs`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 4: GOOGLE_CLIENT_ID
- **Name:** `GOOGLE_CLIENT_ID`
- **Value:** `336032787722-n3p7g8msir9tl0uli0lj93se5cg150ml.apps.googleusercontent.com`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 5: GOOGLE_CLIENT_SECRET
- **Name:** `GOOGLE_CLIENT_SECRET`
- **Value:** `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`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 6: NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://YOUR-PROJECT-NAME.vercel.app` ← **Replace with your actual Vercel URL**
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

**Example:** If your project is at `https://dad-chi.vercel.app`, use that URL

---

#### Variable 7: NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `boIJNogDx1rNuNjQn3OxQhxIThpoxrhAIJpm+xb49AQ=`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 8: ADMIN_EMAILS
- **Name:** `ADMIN_EMAILS`
- **Value:** `dhananjay.singh1975@gmail.com`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 9: NEXT_PUBLIC_GA_MEASUREMENT_ID
- **Name:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Value:** `G-WMEW8GDNT5`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

---

#### Variable 10: NEXT_PUBLIC_BASE_URL
- **Name:** `NEXT_PUBLIC_BASE_URL`
- **Value:** `https://chhkwa.com` (or your Vercel URL)
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

**Important:** This must be your production domain WITHOUT trailing slash

---

#### Variable 11: NVIDIA_API_KEY
- **Name:** `NVIDIA_API_KEY`
- **Value:** `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`
- **Environments:** ✓ Production, ✓ Preview, ✓ Development

**Important:** This enables AI-powered article writing and editing features (GPT-OSS-120B model)

---

### Step 3: Redeploy

After adding all variables:

1. Go to **Deployments** tab
2. Click on the three dots (**...**) on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache: No**
5. Click **Redeploy**

---

## ⚠️ Important Notes

1. **NEXTAUTH_URL**: Must be your production Vercel URL (not localhost)
2. **Google OAuth**: Make sure to add your Vercel domain to Google Cloud Console:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select your OAuth 2.0 Client ID
   - Add Authorized JavaScript origins: `https://your-domain.vercel.app`
   - Add Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

3. **Security**: Never commit `.env.local` to Git (it's already in `.gitignore`)

---

## ✅ Verification

After redeployment:
1. Visit your live site
2. Try to login at `/admin`
3. Check if articles load properly

---

## 🆘 Still Having Issues?

If you see the error again:
1. Check all variable names are spelled correctly (case-sensitive)
2. Verify no extra spaces in values
3. Make sure all 8 variables are added
4. Check deployment logs for specific errors
