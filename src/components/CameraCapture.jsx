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
      el.play().catch(err => console.error('Video play error:', err))
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

          // Wait for both metadata AND actual video dimensions
          let readyTimeout
          const checkAndSetReady = () => {
            if (videoRef.current?.videoWidth > 0 && videoRef.current?.videoHeight > 0) {
              clearTimeout(readyTimeout)
              console.log('Camera ready with dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
              setCameraReady(true)
            }
          }

          videoRef.current.onloadedmetadata = checkAndSetReady
          videoRef.current.onplaying = checkAndSetReady

          // Fallback: if metadata doesn't load within 3 seconds, mark ready anyway
          readyTimeout = setTimeout(() => {
            console.warn('Camera ready timeout, proceeding with dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
            setCameraReady(true)
          }, 3000)
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
      videoRef.current.play().catch(err => console.error('Play error:', err))

      // Since stream is already active, immediately set ready
      // (we already waited for it to be ready on initial load)
      if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        setCameraReady(true)
      } else {
        // If for some reason dimensions aren't available, quick check with timeout
        const checkReady = () => {
          if (videoRef.current?.videoWidth > 0 && videoRef.current?.videoHeight > 0) {
            setCameraReady(true)
          } else {
            // Just set ready anyway after a short delay
            setTimeout(() => setCameraReady(true), 500)
          }
        }
        checkReady()
      }
    }
  }, [photoIndex])

  const capturePhotoAuto = (retryCount = 0) => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas not available')
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Check if video has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('Video dimensions not ready, attempt', retryCount + 1)
        // Retry up to 3 times with 100ms delay
        if (retryCount < 3) {
          setTimeout(() => capturePhotoAuto(retryCount + 1), 100)
        } else {
          console.error('Video dimensions still not ready after retries')
          setError('Unable to capture photo. Please check camera permissions.')
        }
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0)

      // Convert canvas to blob with better error handling
      canvas.toBlob(
        blob => {
          if (!blob) {
            console.error('Canvas toBlob returned null')
            return
          }
          try {
            const url = URL.createObjectURL(blob)
            setPreviewImage(url)
            setIsCaptured(true)
            onCapture(blob)
          } catch (e) {
            console.error('Error creating object URL:', e)
          }
        },
        'image/jpeg',
        0.95
      )
    } catch (err) {
      console.error('Capture error:', err)
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', bgcolor: '#000', overflow: 'hidden' }}>
      {/* Loading state message */}
      {!cameraReady && !isCaptured && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5, bgcolor: 'rgba(0,0,0,0.5)' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: 'white', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              Starting camera...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header with photo counter - fixed height */}
      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', textAlign: 'center', flexShrink: 0, zIndex: 2 }}>
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
          {!isCaptured && cameraReady && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            >
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
            </Box>
          )}
        </Box>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  )
}
