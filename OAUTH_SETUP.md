# OAuth 2.0 Setup for Photo Booth

This guide explains how to set up OAuth 2.0 so you can authorize the Photo Booth backend to upload photos to your Google Photos account.

## Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: `photo-booth`
3. Go to **APIs & Services** → **Library**
4. Enable **Google Photos Library API**
5. Go to **APIs & Services** → **Credentials**
6. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
7. Choose **Web application**
8. Add Authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback`
9. Click **CREATE**
10. You'll see your **Client ID** and **Client Secret**
    - Copy both of these

## Step 2: Update Backend .env

```bash
nano /Users/nlandis/src/dev/dean/server/.env
```

Add your credentials:
```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
REDIRECT_URI=http://localhost:3001/api/auth/callback
PORT=3001
```

Save: Ctrl+X, Y, Enter

## Step 3: Install & Start Backend

```bash
cd /Users/nlandis/src/dev/dean/server
npm install
npm start
```

Should show:
```
Server running on port 3001
```

## Step 4: Update Frontend & Start

```bash
cd /Users/nlandis/src/dev/dean
npm run build
npm run dev
```

## Step 5: Authorize the App

1. Open the Photo Booth app: `http://localhost:5173`
2. **You should see an "Authorize" button** (or similar)
3. Click it
4. A Google login window opens
5. Sign in with your Google account
6. Grant permission for "Photo Booth" to access Google Photos
7. You'll be redirected back with a success message
8. The app is now authorized!

## Step 6: Upload Photos

1. Click "Start Taking Photos"
2. Take 3 photos
3. Click "Upload"
4. Photos upload to your Google Photos account!
5. Check [photos.google.com](https://photos.google.com) to see them

## How It Works

1. **Authorization**: You click "Authorize" → signs into Google → grants permission
2. **Token Storage**: Backend stores your access token and refresh token in memory
3. **Upload**: When you upload photos, backend uses your token to upload to your Google Photos
4. **Token Refresh**: If token expires, backend automatically refreshes it

## Troubleshooting

### "No authorization code provided"
- Make sure `REDIRECT_URI` in `.env` matches exactly: `http://localhost:3001/api/auth/callback`
- Restart backend after updating `.env`

### "Invalid client" error during authorization
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure they're from the same OAuth 2.0 credential set
- Restart backend

### Upload says "Not authorized"
- You haven't clicked "Authorize" yet
- Or your session expired (restart backend to reset)

### Photos don't appear in Google Photos
- Check that you logged in with the correct Google account
- Make sure Google Photos Library API is enabled
- Check backend console for error messages

## Production Deployment

For production, you'll need to:
1. Change `REDIRECT_URI` to your production domain
2. Add production domain to authorized redirect URIs in Google Cloud Console
3. Update frontend to point to production backend URL
4. Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as environment variables on your server

## Notes

- Authorization tokens are stored in memory (not persisted)
- Each time backend restarts, you'll need to authorize again
- Tokens refresh automatically when needed
- Frontend never sees the credentials - all handled by backend
