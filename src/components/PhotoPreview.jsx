import { useEffect, useRef, useState } from 'react'
import { Box, Button, Card, Typography } from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export const PhotoPreview = ({ photoIndex, onRetake, onConfirm, isVisible }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (!isVisible) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Camera access error:', err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [isVisible])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)

      canvasRef.current.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        setPreviewImage(url)
        onConfirm(blob)
      }, 'image/jpeg', 0.95)
    }
  }

  if (!isVisible) return null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#000' }}>
      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', textAlign: 'center' }}>
        <Typography variant="h6">
          Photo {photoIndex + 1} of 3
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        {previewImage ? (
          <Box component="img" src={previewImage} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        )}
      </Box>

      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.9)', display: 'flex', gap: 2, justifyContent: 'center' }}>
        {!previewImage ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PhotoCameraIcon />}
            onClick={capturePhoto}
            sx={{ minWidth: 200 }}
          >
            Capture
          </Button>
        ) : (
          <>
            <Button variant="outlined" color="inherit" size="large" onClick={onRetake} sx={{ minWidth: 150 }}>
              Retake
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={() => {}}
              sx={{ minWidth: 150 }}
            >
              Next
            </Button>
          </>
        )}
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  )
}
