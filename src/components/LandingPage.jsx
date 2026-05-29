import { useEffect, useState } from 'react'
import { Box, Button, Typography, Container, CircularProgress, Alert } from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import axios from 'axios'

export const LandingPage = ({ onStart }) => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_BACKEND_URL)

  useEffect(() => {
    if (!backendUrl) {
      console.error('VITE_BACKEND_URL is not set!')
      setIsCheckingAuth(false)
      return
    }
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const url = `${backendUrl}/api/auth/status`
      console.log('Checking auth status at:', url)
      const response = await axios.get(url, {
        headers: { 'ngrok-skip-browser-warning': 'skip-browser-warning' }
      })
      setIsAuthorized(response.data.authorized)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthorized(false)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleAuthorize = async () => {
    setIsAuthorizing(true)
    try {
      const url = `${backendUrl}/api/auth/url`
      console.log('Getting auth URL from:', url)
      const response = await axios.get(url, {
        headers: { 'ngrok-skip-browser-warning': 'skip-browser-warning' }
      })
      window.open(response.data.authUrl, '_blank')

      // Check auth status after a delay to see if user authorized
      setTimeout(() => {
        checkAuthStatus()
      }, 3000)
    } catch (error) {
      console.error('Error getting auth URL:', error)
    } finally {
      setIsAuthorizing(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        bgcolor: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        color: 'white',
      }}
    >
      {/* Top Bar - matches composite page style */}
      <Box sx={{ p: 1, px: 2, bgcolor: '#0d1117', color: 'white', textAlign: 'center', flexShrink: 0, borderBottom: '1px solid #333' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', margin: 0 }}>
          📸 Photo Booth
        </Typography>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
      <Container maxWidth="sm">
        <Box sx={{ mb: 4 }}>
          <PhotoCameraIcon sx={{ fontSize: 120, mb: 2 }} />
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Photo Booth
        </Typography>

        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Capture 3 photos, create a composite, and upload to Google Photos
        </Typography>

        <Typography variant="body1" sx={{ mb: 6, opacity: 0.8 }}>
          Get ready! Each photo will auto-capture after a 5 second countdown. You can retake any photo if needed.
        </Typography>

        {/* Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          {!isAuthorized && (
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#4285f4',
                color: 'white',
                fontSize: '16px',
                padding: '12px 32px',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#357ae8',
                },
              }}
              onClick={handleAuthorize}
              disabled={isAuthorizing || isCheckingAuth}
            >
              {isAuthorizing ? 'Authorizing...' : 'Authorize with Google'}
            </Button>
          )}

          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              fontSize: '18px',
              padding: '12px 48px',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#f0f0f0',
              },
            }}
            onClick={onStart}
            disabled={isCheckingAuth}
            startIcon={<PhotoCameraIcon />}
          >
            Start Taking Photos
          </Button>
        </Box>
      </Container>
    </Box>
    </Box>
  )
}
