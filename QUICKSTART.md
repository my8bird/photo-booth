# Quick Start Guide

## 30-Second Setup

```bash
cd /Users/nlandis/src/dev/dean
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

## Using the App

### Without Google Photos Upload
The app works fully without Google OAuth setup:
1. Allow camera access
2. Take 3 photos (click "Capture Photo", then "Confirm")
3. View composite of all 3 photos stacked
4. Download as JPEG

### With Google Photos Upload

1. **Get Google OAuth Credentials**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable "Google Photos Library API"
   - Create OAuth 2.0 credentials (type: Web application)
   - Add redirect: `http://localhost:5173/`
   - Copy Client ID

2. **Set Credentials**
   ```bash
   # Edit .env file:
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/
   ```

3. **Use the App**
   - After compositing 3 photos, click "Sign in to Upload"
   - Select your Google account
   - Click "Upload to Google Photos"
   - Success! Photo saved to your Google Photos library

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app logic |
| `src/components/CameraCapture.jsx` | Camera & photo capture |
| `src/components/CompositePreview.jsx` | Composite display & upload |
| `src/hooks/usePhotoBooth.js` | State management |
| `src/services/imageComposite.js` | Photo stacking |
| `src/services/googleAuth.js` | OAuth flow |
| `src/services/googlePhotosApi.js` | API calls |

## Troubleshooting

**Camera not working?**
- Check browser permissions (Settings → Camera)
- Try a different browser
- Ensure HTTPS for production (localhost HTTP ok for dev)

**Upload fails?**
- Verify OAuth Client ID is correct
- Check Google API is enabled
- Look at browser Network tab for errors

**Image looks cut off?**
- All 3 photos must be captured successfully
- Check browser console for JavaScript errors

## Next Steps

- See `README.md` for full documentation
- See `TESTING.md` for testing procedures
- Production deployment requires HTTPS and proper OAuth redirect URIs
