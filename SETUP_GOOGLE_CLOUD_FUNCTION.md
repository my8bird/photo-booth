# Setup Guide: Google Cloud Function for Photo Booth Upload

This guide walks you through setting up the Google Cloud Function backend to handle automatic uploads to Google Photos.

## Prerequisites
- A Google Cloud project
- Access to Google Cloud Console
- Service account with JSON key (see "Get Service Account Key" below)
- The ability to deploy Cloud Functions

## Step 1: Prepare Your Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled for the project

## Step 2: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Google Photos Library API**
   - **Cloud Functions API**
   - **Cloud Logging API**
   - **Cloud Build API**

## Step 3: Create a Service Account

1. Go to **APIs & Services** → **Service Accounts**
2. Click **CREATE SERVICE ACCOUNT**
3. Fill in:
   - Service account name: `photo-booth`
   - Service account ID: (auto-generated, keep as-is)
   - Description: `Service account for Photo Booth auto-upload`
4. Click **CREATE AND CONTINUE**
5. Skip the optional steps and click **DONE**

## Step 4: Get Service Account Key

1. Go to **APIs & Services** → **Service Accounts**
2. Click on the `photo-booth` service account
3. Go to the **KEYS** tab
4. Click **ADD KEY** → **Create new key**
5. Choose **JSON**
6. Click **CREATE** - the JSON file will download
7. **Save this file securely** - you'll need its contents for the Cloud Function

## Step 5: Grant Service Account Google Photos Access

1. In the same service account page, copy the **Service Account Email** (format: `photo-booth@PROJECT_ID.iam.gserviceaccount.com`)
2. Go to [Google Photos Settings](https://photos.google.com/settings)
3. Look for Connected apps/services section
4. Add your service account email to allowed access (if available, or skip if not)

**Note:** Google Photos API requires the service account to have explicit access. You may need to sign in with the account where photos should be uploaded and authorize the service account there.

## Step 6: Deploy the Cloud Function

### Option A: Using Google Cloud Console (Easiest)

1. Go to **Cloud Functions**
2. Click **CREATE FUNCTION**
3. Configure:
   - **Environment**: Node.js 20
   - **Function name**: `uploadPhoto`
   - **Trigger type**: HTTPS
   - **Authentication**: Allow unauthenticated invocations (required for browser access)
   - **Memory**: 256 MB
   - **Timeout**: 60 seconds

4. In the **Runtime settings** (click to expand):
   - Add runtime environment variable:
     - **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY`
     - **Value**: Paste the entire contents of your downloaded JSON key file

5. In the code editor:
   - **Runtime**: Node.js 20
   - **Entry point**: `uploadPhoto`
   - **Source**: Inline editor

6. **index.js** tab:
   - Copy contents from `backend/upload-function.js` in this repo

7. **package.json** tab:
   - Copy contents from `backend/package.json` in this repo

8. Click **DEPLOY** and wait for completion (2-3 minutes)

### Option B: Using Google Cloud CLI

```bash
# Install gcloud CLI if not already installed
# (instructions at: https://cloud.google.com/sdk/docs/install)

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create environment file
cat > /tmp/env.yaml << EOF
GOOGLE_SERVICE_ACCOUNT_KEY: $(cat /path/to/your/service-account-key.json)
EOF

# Deploy the function
gcloud functions deploy uploadPhoto \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point uploadPhoto \
  --env-vars-file /tmp/env.yaml \
  --source ./backend
```

## Step 7: Get Your Function URL

After deployment:
1. Go to **Cloud Functions** → **uploadPhoto**
2. Copy the **Trigger URL** (format: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/uploadPhoto`)

## Step 8: Update Frontend Configuration

1. Open `.env` in the photo booth project
2. Update `VITE_UPLOAD_FUNCTION_URL` with your function URL:
   ```
   VITE_UPLOAD_FUNCTION_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/uploadPhoto
   ```

3. Rebuild the app:
   ```bash
   npm run build
   npm run dev
   ```

## Step 9: Test the Integration

1. Open the app: `http://localhost:5173`
2. Click "Start Taking Photos"
3. Take 3 photos
4. On final composite screen, click "Share to Google Photos"
5. Wait for upload (should take 2-5 seconds)
6. You should see: ✅ Successfully uploaded to Google Photos!
7. Check your Google Photos account - the image should appear there

## Troubleshooting

### Function returns 500 error
- Check Cloud Function logs: **Cloud Functions** → **uploadPhoto** → **Logs**
- Common issues:
  - Service account key environment variable not set correctly
  - Google Photos Library API not enabled
  - Service account doesn't have access to Google Photos

### "Access not granted" error
- The service account needs explicit access to Google Photos
- Sign into the Google Photos account where you want photos uploaded
- Check if there's a way to authorize the service account in Photos settings
- You may need to use a personal Google account, not a Google Cloud service account

### Uploads work locally but fail in production
- Verify `VITE_UPLOAD_FUNCTION_URL` is correctly set in production `.env`
- Make sure the function URL is publicly accessible
- Check browser console (F12) for CORS errors

### Function timeout
- Cloud Function memory may be too low
- Increase to 512 MB in Cloud Function settings
- Or increase timeout to 120 seconds

### "CORS error"
- This shouldn't happen - the function sets CORS headers
- Clear browser cache and try again
- Check that function was redeployed successfully

## Monitoring and Logs

To check function logs:
1. Go to **Cloud Functions** → **uploadPhoto**
2. Click **LOGS** tab
3. Look for errors or execution details

## Cost

Google Cloud Functions has a generous free tier:
- First 2 million invocations per month: **FREE**
- Beyond that: ~$0.40 per million invocations
- For a small photo booth: typically $0/month (stays within free tier)

## Security Notes

✅ Service account key stored on Google Cloud (not in Git)
✅ Function requires HTTPS only
✅ CORS headers set for browser access
✅ Input validation on image parameter
❌ No rate limiting (optional enhancement)
❌ No authentication required (by design - function is public)

## Next Steps

1. Test with actual photos
2. Monitor logs for any errors
3. Share the app URL and start taking photos!

## Support

For issues:
- Check Cloud Function logs in Google Cloud Console
- Verify service account has Google Photos permissions
- Ensure VITE_UPLOAD_FUNCTION_URL is correctly set
- Test function directly: `curl -X POST -H "Content-Type: application/json" -d '{"image":"INVALID"}' YOUR_FUNCTION_URL`
