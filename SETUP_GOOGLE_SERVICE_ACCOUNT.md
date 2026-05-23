# Setup Guide: Direct Google Photos Upload with Service Account

This guide walks you through setting up automatic uploads to Google Photos without user authentication.

## Prerequisites
- A Google Cloud project
- The Google Cloud Console accessible
- The ability to create and manage service accounts

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project selector at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Photo Booth")
5. Click "CREATE"

## Step 2: Enable the Google Photos Library API

1. In the Cloud Console, make sure your new project is selected
2. Go to "APIs & Services" → "Library"
3. Search for "Google Photos Library API"
4. Click on it and then click "ENABLE"

## Step 3: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "Service Account"
3. Fill in the details:
   - Service account name: `photo-booth`
   - Service account ID: (auto-generated, keep as-is)
   - Service account description: `Service account for Photo Booth auto-upload`
4. Click "CREATE AND CONTINUE"
5. Skip the optional steps and click "DONE"

## Step 4: Generate and Download the Service Account Key

1. Go to "APIs & Services" → "Service Accounts"
2. Click on the `photo-booth` service account
3. Go to the "KEYS" tab
4. Click "ADD KEY" → "Create new key"
5. Choose "JSON"
6. Click "CREATE" - the JSON file will download automatically
7. Save this file somewhere secure (you'll use it to get the access token)

## Step 5: Generate an Access Token

You need to exchange the service account key for an access token. There are two ways:

### Option A: Using Google's OAuth 2.0 Token Endpoint (Recommended)

Run this in your terminal (replace the paths):

```bash
# First, extract the key from the JSON file
KEY_FILE="/path/to/downloaded/service-account-key.json"
PRIVATE_KEY=$(jq -r '.private_key' "$KEY_FILE")
CLIENT_EMAIL=$(jq -r '.client_email' "$KEY_FILE")

# Create a JWT (JSON Web Token)
HEADER=$(echo -n '{"alg":"RS256","typ":"JWT"}' | base64 | tr '+/' '-_' | tr -d '=')
NOW=$(date +%s)
EXPIRY=$((NOW + 3600))
PAYLOAD=$(echo -n "{\"iss\":\"$CLIENT_EMAIL\",\"scope\":\"https://www.googleapis.com/auth/photoslibrary\",\"aud\":\"https://oauth2.googleapis.com/token\",\"exp\":$EXPIRY,\"iat\":$NOW}" | base64 | tr '+/' '-_' | tr -d '=')

# Create signature (this requires openssl)
MESSAGE="$HEADER.$PAYLOAD"
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -sign <(jq -r '.private_key' "$KEY_FILE") | base64 | tr '+/' '-_' | tr -d '=')

JWT="$MESSAGE.$SIGNATURE"

# Exchange JWT for access token
RESPONSE=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$JWT")

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
echo "Access Token: $ACCESS_TOKEN"
```

### Option B: Using a Node.js Script

Create a temporary file `get-token.js`:

```javascript
const fs = require('fs');
const jwt = require('jsonwebtoken');

const keyFile = process.argv[2]; // Path to your JSON key file
const key = JSON.parse(fs.readFileSync(keyFile));

const token = jwt.sign(
  {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/photoslibrary',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  },
  key.private_key,
  { algorithm: 'RS256' }
);

fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
})
  .then((r) => r.json())
  .then((data) => console.log('Access Token:', data.access_token));
```

Run it:
```bash
node get-token.js /path/to/service-account-key.json
```

## Step 6: Add the Token to Your Environment

1. Open `.env` in the photo booth project:
   ```bash
   nano .env
   ```

2. Find the line `VITE_GOOGLE_PHOTOS_TOKEN=` and paste your access token:
   ```
   VITE_GOOGLE_PHOTOS_TOKEN=ya29.your-actual-token-here...
   ```

3. Save the file (Ctrl+X, Y, Enter in nano)

## Step 7: Build and Test

```bash
npm run build
npm run dev
```

1. Open the app in your browser
2. Click "Start Taking Photos"
3. Take 3 photos
4. On the final composite screen, click "Share"
5. The photo should upload without any auth dialog appearing
6. Check your Google Photos account to verify the upload

## Troubleshooting

### "Upload token not configured" error
- Verify `VITE_GOOGLE_PHOTOS_TOKEN` is in your `.env` file
- Make sure the token value is not empty
- Rebuild with `npm run build`

### "Failed to upload to Google Photos" error
- Check that the token is valid and not expired
- Verify the Google Photos Library API is enabled in your project
- Check the browser console for more details

### Token expires after 1 hour
Google's access tokens expire after 1 hour. If you need long-term uploads, you'll need to:
1. Store the service account key file on a backend server
2. Generate new tokens periodically
3. Update the frontend with fresh tokens

For now, you can manually refresh the token and update `.env` when needed.

## Security Notes

- **Never commit `.env` to Git** - it contains sensitive credentials
- The `.env` file is in `.gitignore` by default
- If you accidentally commit it, rotate the service account key immediately
- Only use this setup for internal/personal use
- For public deployments, use a proper backend with token management

## Additional Resources

- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Photos Library API](https://developers.google.com/photos)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
