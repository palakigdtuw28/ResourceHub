# Custom Domain Setup Guide

## Method 1: Buy Domain + Point to Railway (Recommended)

### Step 1: Purchase Domain
- Buy from: Namecheap, GoDaddy, Cloudflare, or Google Domains
- Suggested names: `resourcehub.com`, `campusvault.com`, `yourname-resources.com`

### Step 2: Configure DNS
In your domain provider's DNS settings:
```
Type: CNAME
Name: @
Value: resilient-transformation-production.up.railway.app
TTL: Auto/3600
```

### Step 3: Add Domain to Railway
```bash
# Remove current custom domain first (if needed)
railway domain resourcehub.com
```

### Step 4: SSL Certificate
Railway automatically provides SSL certificates for custom domains.

## Method 2: GitHub Pages (Static Only)

### If you want to deploy as static site:

1. Build your app for production:
```bash
npm run build
```

2. Create GitHub Pages deployment:
```bash
# Create gh-pages branch
git checkout -b gh-pages
git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

3. Configure in GitHub:
   - Go to Settings → Pages
   - Select `gh-pages` branch
   - Add custom domain

⚠️ **Note**: This won't work for your app because it needs a backend!

## Current Working URLs

- **Railway App**: https://resilient-transformation-production.up.railway.app/
- **GitHub Repo**: https://github.com/palakigdtuw28/ResourceHub

## Recommended Domain Names

- `resourcehub.com` (if available)
- `campusvault.app` 
- `yourname-resources.com`
- `studyresources.app`

## Cost Estimates

- **Domain**: $10-15/year
- **Railway Hosting**: Free tier (current) or $5/month for Pro
- **Total**: ~$10-75/year depending on your needs