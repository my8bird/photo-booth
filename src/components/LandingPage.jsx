import { Box, Button, Typography, Container } from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

export const LandingPage = ({ onStart }) => {
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
          startIcon={<PhotoCameraIcon />}
        >
          Start Taking Photos
        </Button>
      </Container>
    </Box>
    </Box>
  )
}
