# Email Backend Setup Guide

This guide walks you through setting up the local Node.js email backend that sends photo booth composites to my8bird@gmail.com.

## Prerequisites

- Node.js 18+ installed
- Gmail account
- ngrok (for exposing to internet)

## Step 1: Get Gmail App Password

The backend uses Gmail SMTP to send emails. You need to:

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Make sure **2-Step Verification** is ON (enable it if not)
4. Scroll down to **App passwords** (appears only if 2-Step Verification is enabled)
5. Select **Mail** and **Windows Computer** (or your device)
6. Google will generate a 16-character app password
7. **Copy this password** - you'll use it in the next step

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

4. Replace with your values:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=YOUR_16_CHAR_APP_PASSWORD
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
4. Click "Send Email"
5. Wait a moment...
6. You should see: ✅ **Email sent with photo!**
7. Check your email inbox at my8bird@gmail.com - you should have the photo as an attachment!

## Troubleshooting

### "Error: Invalid login" or "Invalid credentials"
- Check that you used an **app password** (16 characters), not your regular Gmail password
- Verify 2-Step Verification is enabled in your Google account
- Make sure EMAIL_USER and EMAIL_PASSWORD are correct in `.env`

### "Connection refused" or "Cannot POST /api/upload"
- Make sure the backend server is running (`npm start`)
- Check that ngrok is exposing the correct port (3000)
- Verify `VITE_BACKEND_URL` in `.env` matches your ngrok URL

### ngrok URL changes every time
- ngrok's free tier generates new URLs each session
- Update `VITE_BACKEND_URL` in `.env` with the new URL
- Rebuild the frontend: `npm run build`
- Or upgrade to ngrok Pro for static URLs

### Email doesn't arrive
- Check spam/trash folder
- Verify `EMAIL_USER` is set to the Gmail account you want emails from
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

That's it! The app will be live at `http://localhost:5173` with emails going to my8bird@gmail.com.

## Production Deployment

For production (deploying to the internet):

1. Keep the backend running on your machine, OR
2. Deploy the server to a hosting platform:
   - Railway.app (easiest, free tier available)
   - Render.com
   - Heroku (paid)
   - AWS/Google Cloud

3. Update `.env` with the production URL

For now, ngrok is perfect for development and testing!
