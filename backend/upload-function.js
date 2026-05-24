const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

// Load service account from environment variable (set in Cloud Function config)
const SERVICE_ACCOUNT_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: SERVICE_ACCOUNT_KEY,
    scopes: [
      'https://www.googleapis.com/auth/photoslibrary',
      'https://www.googleapis.com/auth/photoslibrary.appendonly',
    ],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.credentials.access_token;
}

async function uploadToGooglePhotos(imageBlob) {
  const token = await getAccessToken();

  // Step 1: Upload media bytes
  const uploadResponse = await axios.post(
    'https://photoslibrary.googleapis.com/v1/uploads',
    imageBlob,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
        'X-Goog-Upload-Protocol': 'raw',
      },
    }
  );

  const uploadToken = uploadResponse.data.uploadToken;

  // Step 2: Create media item
  const createResponse = await axios.post(
    'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate',
    {
      newMediaItems: [
        {
          description: 'Photo Booth Composite',
          simpleMediaItem: { uploadToken },
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const result = createResponse.data.newMediaItemResults[0];
  if (result.mediaItem) {
    return {
      success: true,
      mediaId: result.mediaItem.id,
      url: result.mediaItem.productUrl,
    };
  }

  throw new Error('Failed to create media item');
}

functions.http('uploadPhoto', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // Upload to Google Photos
    const result = await uploadToGooglePhotos(imageBuffer);

    res.status(200).json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
});
