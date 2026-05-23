import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, Card, CircularProgress, Typography } from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum'

export const CameraCapture = ({ photoIndex, onCapture, onConfirm, onRetake }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [isCaptured, setIsCaptured] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [countdown, setCountdown] = useState(5)
  const [cameraReady, setCameraReady] = useState(false)

  const setVideoRef = useCallback((el) => {
    videoRef.current = el
    if (el && streamRef.current) {
      el.srcObject = streamRef.current
    }
  }, [])

  // Countdown timer for auto-capture
  useEffect(() => {
    if (isCaptured || !cameraReady) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Auto-capture when countdown reaches 0
          capturePhotoAuto()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isCaptured, cameraReady])

  // Reset countdown when moving to new photo
  useEffect(() => {
    setCountdown(5)
  }, [photoIndex])

  // Auto-advance to next photo after capture
  useEffect(() => {
    if (!isCaptured) return

    const timer = setTimeout(() => {
      handleConfirm()
    }, 2000)

    return () => clearTimeout(timer)
  }, [isCaptured])

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Wait for video to be ready before starting countdown
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true)
          }
        }
      } catch (err) {
        console.error('Camera error:', err)
        setError('Unable to access camera. Please check permissions.')
      }
    }

    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Reset capture state when moving to a new photo
  useEffect(() => {
    setIsCaptured(false)
    setPreviewImage(null)
    setCountdown(5)

    // Make sure video is reconnected to stream
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current

      // If video already has metadata, immediately set ready
      if (videoRef.current.readyState >= 1) {
        setCameraReady(true)
      } else {
        // Otherwise wait for metadata to load
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true)
        }
      }

      videoRef.current.play().catch(err => console.error('Play error:', err))
    }
  }, [photoIndex])

  const capturePhotoAuto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)

      canvasRef.current.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        setPreviewImage(url)
        setIsCaptured(true)
        onCapture(blob)
      }, 'image/jpeg', 0.95)
    }
  }

  const capturePhoto = () => {
    capturePhotoAuto()
  }

  const handleRetake = () => {
    setIsCaptured(false)
    setPreviewImage(null)
    onRetake?.()
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card sx={{ p: 3, maxWidth: 400, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please allow camera access and try again.
          </Typography>
        </Card>
      </Box>
    )
  }

  if (!cameraReady && !isCaptured) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', bgcolor: '#000', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <Typography variant="h4" sx={{ color: 'white', fontSize: '2.5rem', textAlign: 'center', px: 2 }}>
          Start your photo booth by enabling your camera
        </Typography>
        <video
          ref={setVideoRef}
          autoPlay
          muted
          playsInline
          style={{
            display: 'none',
          }}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', bgcolor: '#000', overflow: 'hidden' }}>
      {/* Header with photo counter - fixed height */}
      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', textAlign: 'center', flexShrink: 0 }}>
        <Typography variant="h6">
          Photo {photoIndex + 1} of 3
        </Typography>
      </Box>

      {/* Camera or preview area - takes remaining space */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, bgcolor: '#000', minHeight: 0, overflow: 'auto' }}>
        <Box sx={{ width: '100%', maxWidth: 'calc(100vh - 200px)', aspectRatio: '1 / 1', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
          {isCaptured && previewImage ? (
            <Box
              component="img"
              src={previewImage}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <video
              ref={setVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: 'scaleX(-1)',
                display: 'block',
                backgroundColor: '#000',
              }}
            />
          )}

          {/* Countdown overlay - centered on video */}
          {!isCaptured && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            >
              {cameraReady ? (
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: '120px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 0 20px rgba(0,0,0,0.8)',
                    margin: 0,
                  }}
                >
                  {countdown}
                </Typography>
              ) : (
                <CircularProgress sx={{ color: 'white' }} />
              )}
            </Box>
          )}
        </Box>
      </Box>


      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  )
}
