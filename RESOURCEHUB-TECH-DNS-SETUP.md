# ResourceHub.tech Domain Setup

## 🎯 DNS Configuration for resourcehub.tech

### Required DNS Records

Add these records in your domain provider's DNS settings:

```
Type: CNAME
Name: @
Value: resilient-transformation-production.up.railway.app
TTL: 3600 (or Auto)
```

**Alternative (if CNAME @ doesn't work):**
```
Type: A
Name: @
Value: [Railway will provide IP after domain setup]
```

## 🛠️ Step-by-Step Setup

### 1. Railway Dashboard Configuration
- Go to: https://railway.app/dashboard
- Open project: `resilient-transformation`
- Navigate to: Settings → Domains
- Remove: `resourcehub.com`
- Add: `resourcehub.tech`

### 2. Domain Provider Configuration
**If you bought from Namecheap:**
- Go to Domain List → Manage
- Advanced DNS → Add New Record
- Add the CNAME record above

**If you bought from GoDaddy:**
- Go to DNS Management
- Add CNAME record as specified

**If you bought from Cloudflare:**
- Go to DNS → Records
- Add CNAME record (disable proxy initially)

### 3. WWW Subdomain (Optional)
```
Type: CNAME
Name: www
Value: resourcehub.tech
TTL: 3600
```

## ✅ Verification Steps

1. **DNS Propagation Check**: https://whatsmydns.net/#CNAME/resourcehub.tech
2. **SSL Certificate**: Railway auto-generates SSL (may take 5-10 minutes)
3. **Test Access**: https://resourcehub.tech

## 🔧 Troubleshooting

- **DNS Propagation**: Can take 24-48 hours
- **SSL Issues**: Wait 10 minutes after DNS setup
- **Still not working**: Check DNS records are exactly as specified

## 📱 Current URLs After Setup

- **Custom Domain**: https://resourcehub.tech (primary)
- **Railway Backup**: https://resilient-transformation-production.up.railway.app (backup)
- **GitHub Repo**: https://github.com/palakigdtuw28/ResourceHub

## 🎉 Final Result

Your ResourceHub app will be accessible at:
**https://resourcehub.tech**

With the same functionality:
- Admin login: username `admin`, password `CampusVault2025!`
- Full backend and database functionality
- File upload and download capabilities