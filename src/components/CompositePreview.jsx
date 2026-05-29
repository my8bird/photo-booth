import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  Alert,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import StartIcon from '@mui/icons-material/Start'
import { composePhotos, downloadComposite } from '../services/imageComposite'
import { googleAuthService } from '../services/googleAuth'
import { uploadToGooglePhotos } from '../services/googlePhotosApi'

export const CompositePreview = ({ photos, onReset }) => {
  const [compositeImage, setCompositeImage] = useState(null)
  const [isComposing, setIsComposing] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    // Compose the photos
    const compose = async () => {
      try {
        const blob = await composePhotos(photos)
        const url = URL.createObjectURL(blob)
        setCompositeImage({ blob, url })
        setIsComposing(false)
      } catch (error) {
        console.error('Composite error:', error)
        setSnackbar({ open: true, message: error.message, severity: 'error' })
        setIsComposing(false)
      }
    }

    compose()
  }, [photos])

  const handleAuthenticate = async () => {
    try {
      await googleAuthService.initialize()
      await googleAuthService.startOAuthFlow()
      setIsAuthenticated(true)
      setSnackbar({
        open: true,
        message: '✅ Authenticated! You can now upload to Google Photos.',
        severity: 'success',
      })
    } catch (error) {
      console.error('Auth error:', error)
      setSnackbar({
        open: true,
        message: `Authentication failed: ${error.message}`,
        severity: 'error',
      })
    }
  }

  const handleUpload = async () => {
    if (!compositeImage?.blob || !isAuthenticated) return

    setIsUploading(true)
    try {
      const result = await uploadToGooglePhotos(compositeImage.blob, 'Photo Booth Composite')
      if (result.success) {
        setSnackbar({
          open: true,
          message: '✅ Successfully uploaded to Google Photos!',
          severity: 'success',
        })
        setTimeout(() => onReset(), 2500)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setSnackbar({
        open: true,
        message: `Upload failed: ${error.message}`,
        severity: 'error',
      })
      setIsUploading(false)
    }
  }

  const handleDownload = () => {
    if (compositeImage?.blob) {
      downloadComposite(compositeImage.blob, 'photo-booth.jpg')
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', bgcolor: '#121212', overflow: 'hidden' }}>
      {/* Header - doesn't shrink */}
      <Box sx={{ p: 1, px: 2, bgcolor: '#0d1117', color: 'white', textAlign: 'center', flexShrink: 0, borderBottom: '1px solid #333' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', margin: 0 }}>Your Photo Booth Composite</Typography>
      </Box>

      {/* Composite image display - takes remaining space */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', width: '100%', minHeight: 0, p: '10px' }}>
        {isComposing ? (
          <CircularProgress />
        ) : compositeImage?.url ? (
          <Box
            sx={{
              border: '4px solid #444',
              borderRadius: '2px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              padding: '4px',
              bgcolor: '#1e1e1e',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={compositeImage.url}
              onError={(e) => console.error('Image load error:', e)}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </Box>
        ) : (
          <Typography color="error">Failed to create composite image</Typography>
        )}
      </Box>

      {/* Action buttons - doesn't shrink */}
      <Box
        sx={{
          p: 1,
          px: 2,
          bgcolor: '#1e1e1e',
          borderTop: '1px solid #333',
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0,
          width: '100%'
        }}
      >
        <Button
          variant="contained"
          color="success"
          size="medium"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!compositeImage || isComposing}
        >
          Download
        </Button>

        {!isAuthenticated ? (
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleAuthenticate}
            disabled={isComposing || isUploading}
          >
            Sign in to Google Photos
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            onClick={handleUpload}
            disabled={!compositeImage || isComposing || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload to Google Photos'}
          </Button>
        )}

        <Button variant="outlined" size="medium" startIcon={<StartIcon />} onClick={onReset} disabled={isUploading}>
          New
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
