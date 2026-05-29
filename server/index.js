const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS for GitHub Pages
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:3000', // Development
  'https://my8bird.github.io', // Production
];

app.use(cors({
  origin: function (origin, callback) {
	  console.log(origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/api/auth/callback';

let accessToken = null;
let refreshToken = null;

// Get authorization URL
app.get('/api/auth/url', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/photoslibrary',
    'https://www.googleapis.com/auth/photoslibrary.appendonly'
  ];

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  console.log('Generated auth URL with scopes:', scopes);
  res.json({ authUrl });
});

// Handle OAuth callback
app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code provided');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    accessToken = tokenResponse.data.access_token;
    refreshToken = tokenResponse.data.refresh_token;

    console.log('✅ Authorization successful!');
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>✅ Authorization Successful!</h1>
          <p>You can close this window and return to the Photo Booth app.</p>
          <p>Photos will now upload to your Google Photos account.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Authorization error:', error.message);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Authorization Failed</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Check authorization status
app.get('/api/auth/status', (req, res) => {
  res.json({
    authorized: !!accessToken,
    message: accessToken ? 'Authorized' : 'Not authorized',
  });
});

// Clear authorization (force re-auth with new scopes)
app.get('/api/auth/reset', (req, res) => {
  accessToken = null;
  refreshToken = null;
  res.json({
    message: 'Authorization cleared. Please re-authorize.',
  });
});

// Debug: Check token scopes
app.get('/api/auth/debug', async (req, res) => {
  if (!accessToken) {
    return res.json({ error: 'Not authorized' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      params: { access_token: accessToken },
    });

    res.json({
      scopes: response.data.scope?.split(' ') || [],
      expires_in: response.data.expires_in,
      email: response.data.email,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check token info',
      message: error.message,
    });
  }
});

// Refresh token if needed
async function refreshAccessToken() {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    accessToken = response.data.access_token;
    console.log('✅ Token refreshed');
    return accessToken;
  } catch (error) {
    console.error('Token refresh error:', error.message);
    accessToken = null;
    throw error;
  }
}

// Upload to Google Photos
async function uploadToGooglePhotos(imageBuffer) {
  if (!accessToken) {
    throw new Error('Not authorized. Please authorize first.');
  }

  console.log('Got access token, uploading to Google Photos...');

  try {
    // Step 1: Upload media bytes
    console.log('Uploading media bytes...');
    const uploadResponse = await axios.post(
      'https://photoslibrary.googleapis.com/v1/uploads',
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'image/jpeg',
          'X-Goog-Upload-Protocol': 'raw',
        },
      }
    );

    // The upload token is returned as plain text in the response body
    const uploadToken = uploadResponse.data;

    if (!uploadToken) {
      console.error('No uploadToken in response:', uploadResponse.data);
      throw new Error('No upload token returned from Google Photos API');
    }

    console.log('✅ Media uploaded, got token:', uploadToken.substring(0, 50) + '...');

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
          Authorization: `Bearer ${accessToken}`,
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
  } catch (error) {
    // Try to refresh token if it's expired
    if (error.response?.status === 401) {
      console.log('Token expired, refreshing...');
      try {
        await refreshAccessToken();
        // Retry upload with new token
        return uploadToGooglePhotos(imageBuffer);
      } catch (refreshError) {
        throw new Error('Authorization expired. Please authorize again.');
      }
    }

    console.error('Error uploading to Google Photos:', error.message);
    if (error.response) {
      console.error('Google API response:', error.response.status, error.response.data);
    }
    throw error;
  }
}

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!accessToken) {
      return res.status(401).json({
        error: 'Not authorized',
        message: 'Please authorize first',
      });
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
    console.error('Upload error:', error.message);
    res.status(500).json({
      error: 'Failed to upload',
      message: error.message,
    });
  }
});

// Get random photo from Google Photos for slideshow
app.get('/api/slideshow/photo', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({
      error: 'Not authorized',
      message: 'Please authorize first.',
    });
  }

  try {
    // Get list of media items from Google Photos
    const response = await axios.get(
      'https://photoslibrary.googleapis.com/v1/mediaItems',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          pageSize: 100,
        },
      }
    );

    const mediaItems = response.data.mediaItems || [];

    if (mediaItems.length === 0) {
      return res.status(404).json({
        error: 'No photos found',
        message: 'No photos in Google Photos library.',
      });
    }

    // Pick a random photo
    const randomPhoto = mediaItems[Math.floor(Math.random() * mediaItems.length)];

    res.json({
      id: randomPhoto.id,
      url: randomPhoto.baseUrl + '=w1024',
      width: randomPhoto.mediaMetadata?.width,
      height: randomPhoto.mediaMetadata?.height,
      mimeType: randomPhoto.mimeType,
    });
  } catch (error) {
    console.error('Error fetching photos:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Token:', accessToken ? 'Present' : 'Missing');

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Authentication expired',
        message: 'Please authorize again.',
      });
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch photos',
      message: error.message,
      details: error.response?.data,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});
