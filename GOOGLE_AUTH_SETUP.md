# Google OAuth Setup Guide

## 📋 Overview
This guide will help you set up Google OAuth authentication for the admin panel, replacing the username/password system.

---

## 🔧 Step 1: Install NextAuth.js

```bash
npm install next-auth
```

---

## 🌐 Step 2: Create Google OAuth Credentials

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" → "New Project"
- Name: "Chhkwa News CMS"
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Application type: "Web application"
- Name: "Chhkwa News Admin"

### 5. Configure Authorized URLs
**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://your-production-domain.com/api/auth/callback/google
```

### 6. Copy Your Credentials
- Copy the **Client ID**
- Copy the **Client Secret**

---

## ⚙️ Step 3: Update Environment Variables

Edit `.env.local`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Allowed admin emails (comma-separated)
ADMIN_EMAILS=your-email@gmail.com,admin2@gmail.com
```

### Generate NEXTAUTH_SECRET
Run this command to generate a random secret:
```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📝 Step 4: Replace Files

### 1. Update Root Layout
Edit `app/layout.tsx` - wrap children with AuthProvider:

```tsx
import AuthProvider from '@/components/AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. Replace Admin Login Page
```bash
mv app/admin/page.tsx app/admin/page-old.tsx
mv app/admin/page-google.tsx app/admin/page.tsx
```

### 3. Update Auth Check in Protected Pages

Replace the auth check in:
- `app/admin/dashboard/page.tsx`
- `app/admin/articles/new/page.tsx`
- `app/admin/articles/[id]/edit/page.tsx`
- `app/admin/homepage-layout/page.tsx`

**Old code:**
```tsx
const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/session')
    const data = await response.json()
    
    if (!data.authenticated) {
      router.push('/admin')
    }
  } catch (error) {
    router.push('/admin')
  }
}
```

**New code:**
```tsx
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()

useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/admin')
  }
}, [status, router])

if (status === 'loading') {
  return <div>Loading...</div>
}
```

### 4. Update API Routes

Replace session check in API routes:
- `app/api/articles/route.ts`
- `app/api/articles/[id]/route.ts`  
- `app/api/articles/swap-positions/route.ts`

**Old code:**
```tsx
import { cookies } from 'next/headers'

const session = cookies().get('admin_session')
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**New code:**
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 5. Add Logout Button

Update `app/admin/dashboard/page.tsx`:

```tsx
import { signOut } from 'next-auth/react'

const handleLogout = async () => {
  await signOut({ callbackUrl: '/admin' })
}
```

---

## 🧪 Step 5: Test the Setup

1. **Start the dev server:**
```bash
npm run dev
```

2. **Visit admin page:**
```
http://localhost:3000/admin
```

3. **Click "Sign in with Google"**
   - You'll be redirected to Google login
   - Sign in with an email from your ADMIN_EMAILS list
   - You'll be redirected to the dashboard

4. **Test authorization:**
   - Try logging in with an email NOT in ADMIN_EMAILS
   - It should reject the login

---

## 🚀 Deployment Setup

### Vercel Deployment

1. **Add environment variables in Vercel:**
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (set to your production URL)
   - ADMIN_EMAILS

2. **Update Google OAuth redirect URIs:**
   - Add your production URL to authorized redirect URIs
   - Example: `https://your-site.vercel.app/api/auth/callback/google`

3. **Redeploy**

---

## 🔒 Security Features

### Email Whitelist
Only emails in `ADMIN_EMAILS` can access the admin panel.

### Session Management
- Sessions last 7 days
- JWT-based (no database needed)
- Secure httpOnly cookies

### Automatic Redirects
- Logged-in users redirected to dashboard
- Unauthorized users redirected to login
- Protected API routes return 401

---

## 🐛 Troubleshooting

### Error: "Redirect URI mismatch"
- Make sure redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/callback/google`

### Error: "Access denied"
- Check that your email is in ADMIN_EMAILS
- Make sure there are no extra spaces in .env.local

### Error: "NEXTAUTH_SECRET not set"
- Generate a secret using `openssl rand -base64 32`
- Add it to .env.local

### Session not persisting
- Clear browser cookies
- Check NEXTAUTH_URL is correct
- Restart dev server after changing .env.local

---

## 📱 User Experience

### Login Flow
1. User visits `/admin`
2. Clicks "Sign in with Google"
3. Google popup opens
4. User selects Google account
5. If authorized → redirected to `/admin/dashboard`
6. If not authorized → error message

### Logout Flow
1. User clicks "Logout" button
2. Session cleared
3. Redirected to `/admin` login page

---

## ✅ Checklist

- [ ] Install `next-auth`
- [ ] Create Google OAuth credentials
- [ ] Add credentials to `.env.local`
- [ ] Generate NEXTAUTH_SECRET
- [ ] Add admin emails to ADMIN_EMAILS
- [ ] Update `app/layout.tsx` with AuthProvider
- [ ] Replace admin login page
- [ ] Update protected pages auth checks
- [ ] Update API routes auth checks
- [ ] Test login with authorized email
- [ ] Test login with unauthorized email
- [ ] Test logout
- [ ] Deploy and update production URLs

---

## 🎯 Benefits of Google OAuth

✅ No password management
✅ Secure Google authentication
✅ Easy to add/remove admin users
✅ No database needed for users
✅ Familiar login experience
✅ Mobile-friendly
✅ Multi-factor auth (if enabled on Google account)

---

## 📚 Next Steps

After setup:
1. Remove old auth system files:
   - `app/api/auth/login/route.ts`
   - `app/api/auth/logout/route.ts`
   - `app/api/auth/session/route.ts`

2. Remove admin_users table from database (optional)

3. Update SETUP.md with new login instructions

---

Need help? Check the official NextAuth.js docs: https://next-auth.js.org/
