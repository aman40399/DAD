# Complete WordPress to Vercel Migration Guide

## Why You're Seeing Both Sites

**DNS Caching** - Different locations/devices cache DNS records for different times:
- Your ISP caches DNS (can take 1-48 hours)
- Your browser caches DNS
- Your computer caches DNS
- Different geographic locations see updates at different times

---

## IMMEDIATE STEPS - Remove WordPress Completely

### Step 1: Verify DNS Records in GoDaddy (CRITICAL)

Go to GoDaddy DNS Management and **DELETE ALL** references to old WordPress IPs:

#### ❌ DELETE These Records:
```
Type: A, Name: @, Value: 160.153.0.59  ← DELETE THIS
Type: A, Name: @, Value: 216.198.79.1  ← DELETE THIS
```

#### ✅ ONLY Keep These Records:
```
Type: A, Name: @, Value: 76.76.21.21 (Vercel)
Type: CNAME, Name: www, Value: cname.vercel-dns.com
Type: NS, Name: @, Value: ns69.domaincontrol.com
Type: NS, Name: @, Value: ns70.domaincontrol.com
Type: SOA, Name: @, Value: Primary nameserver...
Type: TXT, Name: @, Value: google-site-verification...
```

### Step 2: Force DNS Update on Your Computer

#### On Linux:
```bash
# Clear DNS cache
sudo systemd-resolve --flush-caches

# Or if using nscd
sudo /etc/init.d/nscd restart

# Verify DNS
dig chhkwa.com A
nslookup chhkwa.com
```

#### On Windows:
```cmd
ipconfig /flushdns
```

#### On Mac:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Step 3: Clear Browser Cache

#### Chrome/Edge:
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "All time"
3. Check: Cached images and files, Cookies
4. Click "Clear data"

#### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Everything"
3. Check: Cache, Cookies
4. Click "Clear Now"

#### Or Just Use Incognito/Private Mode:
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`

### Step 4: Test from Different Locations

Use these online tools to verify DNS propagation:

1. **DNS Checker**: https://dnschecker.org
   - Enter: `chhkwa.com`
   - Check: A record should show `76.76.21.21` worldwide

2. **What's My DNS**: https://www.whatsmydns.net
   - Enter: `chhkwa.com`
   - Should see Vercel IP globally

3. **MX Toolbox**: https://mxtoolbox.com/SuperTool.aspx
   - DNS lookup for verification

---

## If WordPress Is Still Showing

### Option A: Disable WordPress Site (If You Have Access)

If you still have access to WordPress hosting:

1. **Login to WordPress hosting** (check your GoDaddy hosting panel)
2. **Put site in maintenance mode** or **delete WordPress files**
3. **Cancel WordPress hosting** (if separate from domain)

### Option B: Remove WordPress Hosting from GoDaddy

1. Go to: https://account.godaddy.com/products
2. Find "Web Hosting" or "WordPress Hosting"
3. Click on it → Click "Cancel" or "Remove"
4. This will stop the WordPress server

### Option C: Check If WordPress Is on a Subdomain

Sometimes WordPress runs on a subdomain. Check if you have:
- `www.chhkwa.com` (WordPress)
- `chhkwa.com` (Vercel)

**Solution**: Update BOTH A record and CNAME:
```
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

---

## Verify Current DNS Status

Run these commands to check what DNS records exist:

```bash
# Check A record (should be 76.76.21.21)
dig chhkwa.com A +short

# Check www CNAME (should point to cname.vercel-dns.com)
dig www.chhkwa.com CNAME +short

# Detailed DNS info
dig chhkwa.com ANY

# Check from multiple DNS servers
dig @8.8.8.8 chhkwa.com A  # Google DNS
dig @1.1.1.1 chhkwa.com A  # Cloudflare DNS
```

---

## Force Users to See New Site Immediately

### Method 1: Use Your Local Hosts File (Testing Only)

On your computer, edit hosts file to force DNS:

#### Linux/Mac:
```bash
sudo nano /etc/hosts
```

Add this line:
```
76.76.21.21 chhkwa.com www.chhkwa.com
```

Save and test. (Remove this line after DNS propagates globally)

#### Windows:
```
C:\Windows\System32\drivers\etc\hosts
```

Add same line, save as Administrator.

### Method 2: Lower TTL in GoDaddy

1. Go to DNS settings in GoDaddy
2. Change TTL for A record to **600 seconds** (10 minutes)
3. This makes updates propagate faster

---

## Timeline for Complete Switch

| Time | What Happens |
|------|-------------|
| **0 minutes** | You update DNS in GoDaddy |
| **10-60 minutes** | Major DNS servers update |
| **1-4 hours** | Most ISPs update their cache |
| **24-48 hours** | 99% of internet sees new site |

---

## Checklist: Complete WordPress Removal

- [ ] Login to GoDaddy DNS Management
- [ ] Delete A record pointing to 160.153.0.59
- [ ] Delete A record pointing to 216.198.79.1
- [ ] Verify ONLY Vercel A record (76.76.21.21) exists
- [ ] Verify www CNAME points to cname.vercel-dns.com
- [ ] Set TTL to 600 seconds (10 minutes)
- [ ] Clear DNS cache on your computer
- [ ] Clear browser cache or use incognito
- [ ] Test at https://dnschecker.org
- [ ] Cancel WordPress hosting (if separate)
- [ ] Wait 2-4 hours for global propagation
- [ ] Test from multiple devices/locations
- [ ] Verify HTTPS works (Vercel auto-SSL)

---

## Emergency: Revert to WordPress

If you need to go back to WordPress temporarily:

```
Type: A, Name: @, Value: 160.153.0.59
(Keep or add back the old IP)
```

Wait 10-60 minutes for propagation.

---

## Verification Script

Save this as `check-dns.sh` and run it:

```bash
#!/bin/bash
echo "Checking DNS for chhkwa.com..."
echo "================================"
echo ""
echo "Current A Record:"
dig chhkwa.com A +short
echo ""
echo "Expected: 76.76.21.21 (Vercel)"
echo ""
echo "Current www CNAME:"
dig www.chhkwa.com CNAME +short
echo ""
echo "Expected: cname.vercel-dns.com"
echo ""
echo "Google DNS says:"
dig @8.8.8.8 chhkwa.com A +short
echo ""
echo "Cloudflare DNS says:"
dig @1.1.1.1 chhkwa.com A +short
echo ""
echo "================================"
```

Make executable and run:
```bash
chmod +x check-dns.sh
./check-dns.sh
```

---

## After Complete Migration

Once DNS is fully propagated:

1. ✅ Test all pages work on https://chhkwa.com
2. ✅ Test authentication (Google login)
3. ✅ Test image uploads
4. ✅ Verify database connections
5. ✅ Check admin panel works
6. ✅ Update NEXTAUTH_URL in Vercel to `https://chhkwa.com`
7. ✅ Cancel old WordPress hosting
8. ✅ Download WordPress backup (if needed)
9. ✅ Monitor analytics for traffic

---

## Still Seeing WordPress?

If after 24 hours you still see WordPress in some locations:

1. **Check DNS propagation**: https://dnschecker.org
2. **Verify GoDaddy DNS**: Make sure old IPs are DELETED
3. **Contact GoDaddy Support**: They can force a DNS flush
4. **Check Vercel Dashboard**: Ensure domain shows "Valid" status
5. **Try different network**: Mobile data vs WiFi

---

## Need Help Now?

```bash
# Run this to check your current DNS status
dig chhkwa.com A
```

If it shows anything other than `76.76.21.21`, the DNS hasn't updated yet or GoDaddy still has old records.

**Post the output here and I can help debug!**
