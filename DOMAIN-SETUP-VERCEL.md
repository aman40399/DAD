# Connect GoDaddy Domain (chhkwa.com) to Vercel

## Current Situation
- Domain: **chhkwa.com**
- Registrar: GoDaddy
- Current Setup: WordPress site (pointing to 160.153.0.59 and 216.198.79.1)
- Target: Deploy Next.js site from Vercel

## Step-by-Step Guide

### Option 1: Replace WordPress with Vercel (Recommended for production)

#### Step 1: Add Domain in Vercel
1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project (DAD)
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `chhkwa.com`
6. Also add: `www.chhkwa.com`
7. Vercel will provide DNS records to configure

#### Step 2: Update DNS Records in GoDaddy

**You need to REPLACE the current A records with Vercel's:**

**For Root Domain (chhkwa.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600 (or 1 Hour)
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour
```

#### Step 3: Delete Old Records (After Vercel is working)
Remove these current records:
- A record pointing to `160.153.0.59`
- A record pointing to `216.198.79.1`

**Keep these records (they're for email/verification):**
- NS records (ns69.domaincontrol.com, ns70.domaincontrol.com)
- SOA record
- TXT records (Google verification)
- CNAME record (_domainconnect)

---

### Option 2: Use Subdomain (Keep WordPress on main domain)

If you want to keep WordPress on chhkwa.com and use a subdomain for the new site:

#### Add a subdomain in GoDaddy:
```
Type: CNAME
Name: app (or news, blog, etc.)
Value: cname.vercel-dns.com
TTL: 1 Hour
```

Then in Vercel, add domain as: `app.chhkwa.com`

---

## Detailed Instructions

### In GoDaddy DNS Management:

1. **Login to GoDaddy:** https://dcc.godaddy.com/
2. Go to **My Products** → **All Products and Services**
3. Find **chhkwa.com** and click **DNS**
4. **Edit the A records:**
   - Click the pencil icon on the A record with value `160.153.0.59`
   - Change value to: `76.76.21.21`
   - Save
   - **Delete** the second A record (`216.198.79.1`)

5. **Update or Add CNAME for www:**
   - If CNAME record exists for `www`, edit it
   - If not, click **ADD** → Select **CNAME**
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: 1 Hour
   - Save

### In Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **Add** button
5. Type: `chhkwa.com`
6. Click **Add**
7. Repeat for `www.chhkwa.com`
8. Vercel will verify the DNS configuration

---

## Important Notes

⚠️ **DNS Propagation Time:** 
- Changes can take 1-48 hours to propagate globally
- Usually works within 1-4 hours
- Use https://dnschecker.org to check propagation status

⚠️ **SSL Certificate:**
- Vercel automatically provisions SSL certificates
- After DNS is configured, certificate will be issued within minutes
- Your site will be available at https://chhkwa.com

⚠️ **WordPress Backup:**
- If replacing WordPress, make sure you have a backup
- Download WordPress files and database if needed
- The old site won't be accessible once DNS changes

⚠️ **Testing Before Switch:**
- First deploy to Vercel's default domain (e.g., project-name.vercel.app)
- Test everything works
- Then add custom domain

---

## Verification Commands

After DNS changes, verify from terminal:

```bash
# Check A record
dig chhkwa.com A

# Check CNAME for www
dig www.chhkwa.com CNAME

# Check if pointing to Vercel
nslookup chhkwa.com
```

Expected results:
- `chhkwa.com` should resolve to `76.76.21.21`
- `www.chhkwa.com` should show CNAME to `cname.vercel-dns.com`

---

## Troubleshooting

### Domain not verified in Vercel:
- Wait for DNS propagation (check dnschecker.org)
- Verify A and CNAME records are correct
- Try clicking "Refresh" in Vercel domain settings

### SSL Certificate Error:
- Wait a few minutes after DNS propagation
- Vercel auto-provisions Let's Encrypt certificates
- Check domain settings in Vercel dashboard

### Site not loading:
- Clear browser cache
- Try incognito/private window
- Check Vercel deployment logs
- Verify environment variables are set in Vercel

---

## Quick Start Commands

Deploy to Vercel (if not already deployed):

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add DATABASE_URL production
```

---

## Final Checklist

- [ ] Backup WordPress site (if replacing)
- [ ] Deploy site to Vercel first (test on .vercel.app domain)
- [ ] Add all environment variables in Vercel dashboard
- [ ] Add chhkwa.com domain in Vercel project settings
- [ ] Update DNS A record in GoDaddy to 76.76.21.21
- [ ] Add/Update CNAME for www to cname.vercel-dns.com
- [ ] Wait for DNS propagation (1-4 hours typically)
- [ ] Verify domain in Vercel dashboard
- [ ] Test site at https://chhkwa.com
- [ ] Verify SSL certificate is working
- [ ] Test all functionality (auth, images, database)
- [ ] Update NEXTAUTH_URL to https://chhkwa.com
- [ ] Monitor for any issues

---

## Support Links

- Vercel Domain Documentation: https://vercel.com/docs/concepts/projects/domains
- GoDaddy DNS Help: https://www.godaddy.com/help/manage-dns-records-680
- DNS Propagation Checker: https://dnschecker.org
- Vercel Support: https://vercel.com/support

---

**Need help?** Vercel support is very responsive, and their documentation is excellent!
