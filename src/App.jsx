import { useState, useEffect } from 'react'
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { LandingPage } from './components/LandingPage'
import { CameraCapture } from './components/CameraCapture'
import { CompositePreview } from './components/CompositePreview'
import { Slideshow } from './components/Slideshow'
import { usePhotoBooth } from './hooks/usePhotoBooth'

function App() {
  const photoBooth = usePhotoBooth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'photobooth', 'slideshow'

  // Check URL for slideshow route
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes('/slideshow')) {
      setCurrentPage('slideshow')
    }
  }, [])

  const handleStart = () => {
    setHasStarted(true)
  }

  const handleCapture = (photoBlob) => {
    photoBooth.capturePhoto(photoBlob)
  }

  const handleConfirm = () => {
    photoBooth.confirmPhoto()
  }

  const handleRetake = () => {
    photoBooth.retakePhoto()
  }

  const handleReset = () => {
    photoBooth.reset()
    setHasStarted(false)
    setCurrentPage('home')
  }

  // Slideshow route
  if (currentPage === 'slideshow') {
    return <Slideshow />
  }

  if (!hasStarted) {
    return <LandingPage onStart={handleStart} />
  }

  return (
    <Box sx={{ width: '100%', height: '100vh' }}>

      {/* Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            <ListItem>
              <ListItemText primary="Photo Booth Status" secondary={`Step: ${photoBooth.currentStep}`} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Photos Captured"
                secondary={`${photoBooth.photos.filter(p => p !== null).length}/3`}
              />
            </ListItem>
            {photoBooth.currentStep !== 'composite' && (
              <ListItemButton onClick={() => { photoBooth.reset(); setDrawerOpen(false); setHasStarted(false) }}>
                <ListItemText primary="Back to Home" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ width: '100%', height: '100vh' }}>
        {(photoBooth.currentStep === 'capture' || photoBooth.currentStep === 'preview') && (
          <CameraCapture
            photoIndex={photoBooth.currentPhotoIndex}
            onCapture={handleCapture}
            onConfirm={handleConfirm}
            onRetake={handleRetake}
          />
        )}

        {photoBooth.currentStep === 'composite' && (
          <CompositePreview
            photos={photoBooth.photos}
            onReset={handleReset}
          />
        )}
      </Box>
    </Box>
  )
}

export default App
