# Deployment Guide

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Google OAuth credentials obtained
- [ ] Environment variables configured
- [ ] Production domain ready
- [ ] HTTPS enabled on production domain
- [ ] Google OAuth redirect URIs updated
- [ ] Build verified: `npm run build` succeeds

## Deployment Options

### Option 1: Vercel (Recommended for Vite)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Photo Booth app"
git remote add origin https://github.com/your-username/photo-booth.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Select GitHub repository
   - Framework: Vite
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add `VITE_GOOGLE_CLIENT_ID`
   - Add `VITE_GOOGLE_REDIRECT_URI` (e.g., https://yourapp.vercel.app)
   - Redeploy

4. **Update Google OAuth Credentials**
   - Add Vercel domain to authorized redirect URIs
   - Approved Redirect URIs: `https://yourapp.vercel.app/`

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com/)
   - Click "New site from Git"
   - Select your GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy"

2. **Add Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add variables:
     - `VITE_GOOGLE_CLIENT_ID=your-client-id`
     - `VITE_GOOGLE_REDIRECT_URI=https://yoursite.netlify.app`

3. **Trigger Redeploy**
   - Navigate to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

### Option 3: GitHub Pages

1. **Modify vite.config.js**
```javascript
export default {
  base: '/photo-booth/', // if using subdirectory
  // ... rest of config
}
```

2. **Add deployment script to package.json**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

4. **Deploy**
```bash
npm run deploy
```

5. **Configure OAuth**
   - Add GitHub Pages domain to Google OAuth redirect URIs
   - Approved Redirect URIs: `https://username.github.io/photo-booth/`

### Option 4: AWS Amplify

1. **Connect Repository**
```bash
npm install -g @aws-amplify/cli
amplify init
```

2. **Configure Hosting**
```bash
amplify add hosting
# Select: Hosting with Amplify Console
# Build and deploy settings: use defaults
```

3. **Deploy**
```bash
amplify publish
```

4. **Add Environment Variables**
   - AWS Amplify Console → App Settings → Environment variables
   - Add `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_REDIRECT_URI`

### Option 5: Firebase Hosting

1. **Initialize Firebase**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

2. **Configure firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

3. **Build and Deploy**
```bash
npm run build
firebase deploy
```

4. **Configure Environment**
   - Firebase Console → Project settings → Environment variables
   - Or add to .env before building

## Google OAuth Setup for Production

### Step 1: Add Production Domain to Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click your OAuth 2.0 Client ID
5. Add Authorized redirect URIs:
   - For production: `https://yourdomain.com/`
   - For staging: `https://staging.yourdomain.com/`
6. Save

### Step 2: Update Environment Variables

Set these on your hosting platform:

```env
VITE_GOOGLE_CLIENT_ID=your-production-client-id
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/
```

### Step 3: Verify OAuth Flow

1. Visit your production app
2. Click "Sign in to Upload"
3. Google OAuth dialog should appear
4. Complete authentication
5. Verify composite uploads successfully

## HTTPS Configuration

✅ **Automatic** (Most platforms handle this):
- Vercel: Automatic SSL/TLS
- Netlify: Automatic SSL/TLS
- GitHub Pages: Automatic SSL/TLS
- AWS Amplify: Automatic SSL/TLS
- Firebase: Automatic SSL/TLS

⚠️ **Custom Domain**: Ensure your domain has valid SSL certificate

## Performance Optimization

### Build Analysis
```bash
npm run build
# Check dist folder size

# For detailed analysis:
npm install -D vite-plugin-visualizer
# Update vite.config.js to use visualizer
```

### Current Bundle Size
- Uncompressed: ~359KB
- Gzipped: ~118KB

### Tips to Reduce Size
1. Tree-shake unused MUI components
2. Lazy load components if needed
3. Consider image optimization for uploads

## Monitoring & Analytics

### Add Google Analytics (Optional)
```bash
npm install react-ga4
```

### Monitor Errors
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor Google API quota usage

## Rollback

### Vercel Rollback
- Vercel dashboard → Deployments
- Click previous version
- Click "Redeploy"

### Netlify Rollback
- Site settings → Deploys
- Click deploy history
- Select previous version

### GitHub Pages Rollback
```bash
git revert <commit-hash>
git push origin main
npm run deploy
```

## Post-Deployment Checklist

- [ ] App loads on production domain
- [ ] Camera works on mobile
- [ ] OAuth redirect works correctly
- [ ] Upload to Google Photos works
- [ ] Download functionality works
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile responsiveness verified

## Troubleshooting

### OAuth Fails on Production
- Verify redirect URI matches exactly
- Check Google Cloud Console has production domain listed
- Ensure HTTPS is enabled
- Clear browser cookies and retry

### Upload Fails
- Check Google Photos Library API is enabled
- Verify quota limits not exceeded
- Check image size is reasonable
- Review browser Network tab for 401/403 errors

### App Not Loading
- Check vite.config.js base URL is correct
- Verify environment variables are set
- Check browser console for errors
- Verify dist folder deployed successfully

### Performance Issues
- Enable gzip compression on server
- Use CDN for assets
- Check image optimization
- Monitor Core Web Vitals

## Maintenance

### Regular Updates
```bash
npm update
npm audit fix
```

### Monitor Logs
- Set up error tracking
- Monitor API quota usage
- Track user sessions

### Refresh OAuth Credentials Periodically
- Rotate client secrets annually
- Update redirect URIs as needed
- Review API scopes annually

## Cost Considerations

| Platform | Cost | Notes |
|----------|------|-------|
| Vercel | Free tier available | Generous free limits |
| Netlify | Free tier available | $19+/mo for pro |
| GitHub Pages | Free | 1GB limit |
| AWS Amplify | Pay-as-you-go | Usually <$1/mo |
| Firebase | Free tier | 1GB storage/month |

## Advanced: Custom Domain

1. **Buy domain** from registrar (GoDaddy, Namecheap, Route53, etc.)
2. **Point DNS** to hosting provider
3. **Wait for propagation** (5 minutes to 48 hours)
4. **Update OAuth credentials** with new domain
5. **Test thoroughly** before announcing

## Support

For deployment issues:
- Check hosting platform's documentation
- Review browser console for errors
- Verify Google OAuth configuration
- Test locally with `npm run dev`

---

**Quick Deploy Links**:
- [Vercel Deploy](https://vercel.com/new)
- [Netlify Deploy](https://app.netlify.com/start)
- [GitHub Pages](https://pages.github.com)
- [AWS Amplify Console](https://console.amplify.aws)
- [Firebase Console](https://console.firebase.google.com)
