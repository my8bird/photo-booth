# Local Backend Setup Guide

This guide walks you through setting up the local Node.js backend that uploads photo booth composites directly to Google Photos.

## Prerequisites

- Node.js 18+ installed
- Google Cloud service account with Google Photos Library API access
- Service account JSON key
- ngrok (for exposing to internet)

## Step 1: Create Google Service Account

The backend uses a Google service account to upload to Google Photos. Follow these steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named `photo-booth` (or select existing)
3. Go to **APIs & Services** → **Library**
4. Enable **Google Photos Library API**
5. Go to **APIs & Services** → **Service Accounts**
6. Click **CREATE SERVICE ACCOUNT**
   - Name: `photo-booth`
   - Click **CREATE AND CONTINUE** → **DONE**
7. Click the service account, go to **KEYS** tab
8. Click **ADD KEY** → **Create new key** → **JSON**
9. A JSON file will download - **save it securely**

## Step 2: Setup Backend Environment

1. Navigate to the server directory:
```bash
cd /Users/nlandis/src/dev/dean/server
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Edit `.env`:
```bash
nano .env
```

4. Paste your entire service account JSON key:
   - Open the downloaded JSON file
   - Copy ALL of its contents
   - In `.env`, replace the entire value after `GOOGLE_SERVICE_ACCOUNT_KEY=` with the JSON
   - Example:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"photo-booth-12345",...}
   PORT=3000
   ```

5. Save the file (Ctrl+X, Y, Enter)

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start Backend Server

```bash
npm start
```

You should see:
```
Server running on port 3000
Local: http://localhost:3000
Expose with ngrok: ngrok http 3000
```

## Step 5: Expose with ngrok

**In a new terminal** (keep the server running):

1. Install ngrok if you don't have it:
```bash
# macOS with Homebrew
brew install ngrok

# Or download from https://ngrok.com/download
```

2. Authenticate ngrok (one-time setup):
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
# Get YOUR_AUTH_TOKEN from https://dashboard.ngrok.com/auth
```

3. Expose your local server:
```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       your-email@gmail.com
Version                       3.3.0
Region                        us
Forwarding                    https://1234-56-789-012-34.ngrok.io -> http://localhost:3000
```

**Copy the `https://...` URL** (the forwarding address)

## Step 6: Update Frontend Configuration

In your **main terminal** (third terminal):

1. Open `.env` in the photo booth project:
```bash
nano /Users/nlandis/src/dev/dean/.env
```

2. Update `VITE_BACKEND_URL` with your ngrok URL:
```
VITE_BACKEND_URL=https://1234-56-789-012-34.ngrok.io
```

3. Save (Ctrl+X, Y, Enter)

4. Rebuild the frontend:
```bash
cd /Users/nlandis/src/dev/dean
npm run build
npm run dev
```

## Step 7: Test the Setup

1. Open the app at `http://localhost:5173`
2. Click "Start Taking Photos"
3. Take 3 photos
4. Click "Upload"
5. Wait a moment...
6. You should see: ✅ **Successfully uploaded to Google Photos!**
7. Check Google Photos (photos.google.com) - your composite should appear there!

## Troubleshooting

### "Invalid service account" or "Permission denied"
- Verify the entire JSON key is pasted in `.env` (not truncated)
- Make sure Google Photos Library API is enabled in Google Cloud Console
- Check that service account has proper permissions

### "Connection refused" or "Cannot POST /api/upload"
- Make sure the backend server is running (`npm start`)
- Check that ngrok is exposing the correct port (3000)
- Verify `VITE_BACKEND_URL` in `.env` matches your ngrok URL

### ngrok URL changes every time
- ngrok's free tier generates new URLs each session
- Update `VITE_BACKEND_URL` in `.env` with the new URL
- Rebuild the frontend: `npm run build`
- Or upgrade to ngrok Pro for static URLs

### Upload fails with "403 Forbidden"
- Service account may not have access to Google Photos
- Try uploading from a Google account that has photos
- Check backend logs for detailed error

### Photo doesn't appear in Google Photos
- Check the Google account associated with your service account
- May need to sign in and authorize the service account first
- Check backend console for errors

## Running Everything (Quick Start)

After first-time setup, to run everything:

**Terminal 1** (Backend):
```bash
cd /Users/nlandis/src/dev/dean/server
npm start
```

**Terminal 2** (ngrok):
```bash
ngrok http 3000
# Copy the https://... URL
```

**Terminal 3** (Frontend):
```bash
cd /Users/nlandis/src/dev/dean
# Update .env with new ngrok URL if it changed
npm run dev
```

That's it! The app will be live at `http://localhost:5173` with photos uploading directly to Google Photos.

## Production Deployment

For production (deploying to the internet):

1. Keep the backend running on your machine using a process manager, OR
2. Deploy the server to a hosting platform:
   - Google Cloud Run (recommended, integrates with service account)
   - Railway.app (easy, free tier available)
   - Render.com
   - AWS/Lambda

3. Update frontend `.env` with the production URL
4. Store `GOOGLE_SERVICE_ACCOUNT_KEY` as environment variable on hosting platform

For now, ngrok is perfect for development and testing!
