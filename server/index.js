const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Load service account from environment variable
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

async function uploadToGooglePhotos(imageBuffer) {
  const token = await getAccessToken();

  // Step 1: Upload media bytes
  const uploadResponse = await axios.post(
    'https://photoslibrary.googleapis.com/v1/uploads',
    imageBuffer,
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

app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // Upload to Google Photos
    const result = await uploadToGooglePhotos(imageBuffer);

    res.json({
      success: true,
      message: 'Successfully uploaded to Google Photos!',
      ...result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload to Google Photos',
      message: error.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Expose with ngrok: ngrok http ${PORT}`);
});
