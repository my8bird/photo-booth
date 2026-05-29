import { useState, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import axios from 'axios'

const ANIMATION_DURATION = 10000 // 10 seconds for animation
const LOAD_INTERVAL = 10000 // Request new photo every 10 seconds
const MAX_IMAGES = 4
const IMAGE_SIZE = 800 // Match composite image width

export const Slideshow = () => {
  const [images, setImages] = useState([])
  const [nextId, setNextId] = useState(0)
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const imagesRef = useRef([])
  const loadIntervalRef = useRef(null)
  const loadTimeoutRef = useRef(null)

  // Fetch a random photo from the backend
  const fetchRandomPhoto = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/slideshow/photo`, {
        headers: { 'ngrok-skip-browser-warning': 'skip-browser-warning' },
      })

      if (response.data.url) {
        return {
          id: nextId,
          url: response.data.url,
          width: response.data.width,
          height: response.data.height,
          photoId: response.data.id,
        }
      }
    } catch (error) {
      console.error('Error fetching photo:', error)
    }
    return null
  }

  // Get random entry position (top, left, bottom, right)
  const getRandomEntryPosition = () => {
    const positions = ['top', 'left', 'bottom', 'right']
    return positions[Math.floor(Math.random() * positions.length)]
  }

  // Get random animation direction
  const getRandomDirection = (entryPosition) => {
    const directions = {
      top: { x: 0, y: 1 },
      bottom: { x: 0, y: -1 },
      left: { x: 1, y: 0 },
      right: { x: -1, y: 0 },
    }
    return directions[entryPosition]
  }

  // Add new image to slideshow
  const addImage = async () => {
    const photo = await fetchRandomPhoto()
    if (!photo) return

    const entryPosition = getRandomEntryPosition()
    const direction = getRandomDirection(entryPosition)

    const newImage = {
      ...photo,
      entryPosition,
      direction,
      createdAt: Date.now(),
    }

    setNextId(prev => prev + 1)
    setImages(prev => [...prev, newImage])
  }

  // Remove image that finished animation
  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  // Initialize slideshow - load first image
  useEffect(() => {
    addImage()
  }, [])

  // Load new images every 10 seconds until we have 4, then wait for space
  useEffect(() => {
    const scheduleNextLoad = () => {
      if (images.length < MAX_IMAGES) {
        // Load immediately if we have space
        loadTimeoutRef.current = setTimeout(() => {
          addImage()
        }, LOAD_INTERVAL)
      }
    }

    scheduleNextLoad()

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [images.length])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: '#121212',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {images.map(image => (
        <AnimatedImage
          key={image.id}
          image={image}
          onAnimationComplete={() => removeImage(image.id)}
        />
      ))}
    </Box>
  )
}

const AnimatedImage = ({ image, onAnimationComplete }) => {
  const getInitialPosition = (entryPosition, viewportWidth, viewportHeight) => {
    const positions = {
      top: { x: Math.random() * (viewportWidth - IMAGE_SIZE), y: -IMAGE_SIZE },
      bottom: { x: Math.random() * (viewportWidth - IMAGE_SIZE), y: viewportHeight },
      left: { x: -IMAGE_SIZE, y: Math.random() * (viewportHeight - IMAGE_SIZE) },
      right: { x: viewportWidth, y: Math.random() * (viewportHeight - IMAGE_SIZE) },
    }
    return positions[entryPosition]
  }

  const getExitPosition = (entryPosition, viewportWidth, viewportHeight, direction) => {
    if (entryPosition === 'top' || entryPosition === 'bottom') {
      return {
        x: Math.random() * (viewportWidth - IMAGE_SIZE),
        y: direction.y > 0 ? viewportHeight : -IMAGE_SIZE,
      }
    } else {
      return {
        x: direction.x > 0 ? viewportWidth : -IMAGE_SIZE,
        y: Math.random() * (viewportHeight - IMAGE_SIZE),
      }
    }
  }

  const getKeyframes = () => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const start = getInitialPosition(image.entryPosition, viewportWidth, viewportHeight)
    const end = getExitPosition(image.entryPosition, viewportWidth, viewportHeight, image.direction)

    return {
      from: { x: start.x, y: start.y, opacity: 1 },
      to: { x: end.x, y: end.y, opacity: 0.7 },
    }
  }

  const keyframes = getKeyframes()

  useEffect(() => {
    const timer = setTimeout(onAnimationComplete, ANIMATION_DURATION)
    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  return (
    <Box
      component="img"
      src={image.url}
      onError={(e) => {
        console.error('Image load error:', e)
        onAnimationComplete()
      }}
      sx={{
        position: 'absolute',
        width: `${IMAGE_SIZE}px`,
        height: `${IMAGE_SIZE}px`,
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        animation: `slideshow-move ${ANIMATION_DURATION}ms linear forwards`,
        '@keyframes slideshow-move': {
          from: {
            transform: `translate(${keyframes.from.x}px, ${keyframes.from.y}px)`,
            opacity: keyframes.from.opacity,
          },
          to: {
            transform: `translate(${keyframes.to.x}px, ${keyframes.to.y}px)`,
            opacity: keyframes.to.opacity,
          },
        },
      }}
    />
  )
}
