import axios from 'axios'
import { googleAuthService } from './googleAuth'

const API_BASE = 'https://photoslibrary.googleapis.com/v1'

export const uploadToGooglePhotos = async (imageBlob, description = 'Photo Booth Composite') => {
  const token = googleAuthService.getAccessToken()

  if (!token) {
    throw new Error('Not authenticated. Please sign in first.')
  }

  try {
    // Step 1: Upload the media bytes
    const uploadUrl = `${API_BASE}/uploads`

    const uploadResponse = await axios.post(uploadUrl, imageBlob, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
        'X-Goog-Upload-Protocol': 'raw',
      },
    })

    const uploadToken = uploadResponse.data.uploadToken

    // Step 2: Create media item with the uploaded token
    const createResponse = await axios.post(
      `${API_BASE}/mediaItems:batchCreate`,
      {
        newMediaItems: [
          {
            description,
            simpleMediaItem: {
              uploadToken,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (createResponse.data.newMediaItemResults && createResponse.data.newMediaItemResults.length > 0) {
      const result = createResponse.data.newMediaItemResults[0]
      if (result.mediaItem) {
        return {
          success: true,
          mediaItem: result.mediaItem,
          url: result.mediaItem.productUrl,
        }
      }
    }

    throw new Error('Failed to create media item')
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please sign in again.')
    }
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to upload to Google Photos')
  }
}

export const listAlbums = async () => {
  const token = googleAuthService.getAccessToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  try {
    const response = await axios.get(`${API_BASE}/albums`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.albums || []
  } catch (error) {
    console.error('Failed to list albums:', error)
    return []
  }
}
