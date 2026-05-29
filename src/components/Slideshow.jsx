import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'

const DISPLAY_DURATION = 5000 // 5 seconds in center
const MOVE_DURATION = 120000 // 120 seconds moving off screen
const TOTAL_DURATION = DISPLAY_DURATION + MOVE_DURATION // 125 seconds total

export const Slideshow = () => {
  const [currentPhoto, setCurrentPhoto] = useState(null)
  const [movingPhotos, setMovingPhotos] = useState([]) // {photo, direction, id}
  const [photoQueue, setPhotoQueue] = useState([])
  const [moveDirection, setMoveDirection] = useState('left')
  const [photoIdCounter, setPhotoIdCounter] = useState(0)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // Fetch a random photo from the backend
  const fetchRandomPhoto = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/slideshow/photo`, {
        headers: { 'ngrok-skip-browser-warning': 'skip-browser-warning' },
      })

      if (response.data.url) {
        return {
          id: response.data.id,
          url: response.data.url,
          width: response.data.width,
          height: response.data.height,
        }
      }
    } catch (error) {
      console.error('Error fetching photo:', error)
    }
    return null
  }

  // Load photos into queue
  const loadPhotosIntoQueue = async () => {
    if (photoQueue.length < 5) {
      const newPhoto = await fetchRandomPhoto()
      if (newPhoto) {
        setPhotoQueue(prev => [...prev, newPhoto])
      }
    }
  }

  // Initialize queue with first photo
  useEffect(() => {
    loadPhotosIntoQueue()
  }, [])

  // Load more photos when queue gets low
  useEffect(() => {
    if (photoQueue.length < 5) {
      loadPhotosIntoQueue()
    }
  }, [photoQueue.length])

  // Set initial photo
  useEffect(() => {
    if (currentPhoto === null && photoQueue.length > 0) {
      setCurrentPhoto(photoQueue[0])
      setPhotoQueue(prev => prev.slice(1))
    }
  }, [photoQueue])

  // Move current photo after 5 seconds, show next photo in center
  useEffect(() => {
    if (!currentPhoto) return

    const moveTimer = setTimeout(() => {
      const newMovingPhoto = {
        photo: currentPhoto,
        direction: moveDirection,
        displayId: photoIdCounter,
      }

      setMovingPhotos(prev => [...prev, newMovingPhoto])
      setPhotoIdCounter(prev => prev + 1)
      setMoveDirection(prev => prev === 'left' ? 'right' : 'left')

      // Set next photo to center
      if (photoQueue.length > 0) {
        setCurrentPhoto(photoQueue[0])
        setPhotoQueue(prev => prev.slice(1))
      }
    }, DISPLAY_DURATION)

    return () => clearTimeout(moveTimer)
  }, [currentPhoto, photoQueue, moveDirection, photoIdCounter])

  // Remove photos that finished moving
  useEffect(() => {
    const cleanupTimer = setInterval(() => {
      setMovingPhotos(prev =>
        prev.filter(mp => {
          const element = document.getElementById(`moving-photo-${mp.displayId}`)
          return element ? true : false
        })
      )
    }, 500)

    return () => clearInterval(cleanupTimer)
  }, [])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: '#121212',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        '@keyframes moveLeft': {
          '0%': {
            transform: 'translateX(0)',
            opacity: 1,
          },
          '100%': {
            transform: 'translateX(-150vw)',
            opacity: 0.3,
          },
        },
        '@keyframes moveRight': {
          '0%': {
            transform: 'translateX(0)',
            opacity: 1,
          },
          '100%': {
            transform: 'translateX(150vw)',
            opacity: 0.3,
          },
        },
      }}
    >
      {/* Moving photos */}
      {movingPhotos.map(movingPhoto => (
        <Box
          key={movingPhoto.displayId}
          id={`moving-photo-${movingPhoto.displayId}`}
          component="img"
          src={movingPhoto.photo.url}
          onError={(e) => {
            console.error('Image load error:', e)
          }}
          onAnimationEnd={() => {
            setMovingPhotos(prev => prev.filter(mp => mp.displayId !== movingPhoto.displayId))
          }}
          sx={{
            position: 'absolute',
            maxWidth: 'calc(100vh - 200px)',
            maxHeight: 'calc(100vh - 200px)',
            objectFit: 'contain',
            animation: `move${movingPhoto.direction === 'left' ? 'Left' : 'Right'} ${MOVE_DURATION}ms linear forwards`,
            zIndex: 1,
            backfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'antialiased',
          }}
        />
      ))}

      {/* Center photo */}
      {currentPhoto && (
        <Box
          component="img"
          src={currentPhoto.url}
          onError={(e) => {
            console.error('Image load error:', e)
          }}
          sx={{
            position: 'relative',
            maxWidth: 'calc(100vh - 200px)',
            maxHeight: 'calc(100vh - 200px)',
            objectFit: 'contain',
            zIndex: 2,
          }}
        />
      )}

      {/* Add your Photos QR section - bottom right */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#000' }}>
          Add your Photos
        </Typography>
        <QRCodeSVG
          value="https://my8bird.github.io/photo-booth/"
          size={120}
          level="H"
          includeMargin={true}
        />
      </Box>
    </Box>
  )
}
