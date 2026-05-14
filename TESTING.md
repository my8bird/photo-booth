# Testing Guide

## Local Development Testing

### Prerequisites
- Node.js 16+ installed
- Webcam or camera device available
- Modern browser (Chrome, Firefox, Safari, or Edge)

### Running Dev Server

```bash
npm run dev
```

This starts a dev server at `http://localhost:5173/` with hot module reloading.

## Testing Checklist

### Basic Functionality

- [ ] **Camera Access**
  - Browser asks for camera permission
  - Video preview shows live camera feed (mirrored)
  - No errors in browser console

- [ ] **Photo Capture**
  - Clicking "Capture Photo" freezes the video frame
  - Captured image appears in preview
  - Photo number increments (1/3, 2/3, 3/3)

- [ ] **Retake Flow**
  - "Retake" button unfreezes camera
  - Can retake unlimited times without proceeding
  - UI remains responsive

- [ ] **Multi-Photo Sequence**
  - Capture 3 photos successfully
  - Progress shown correctly (Photo 1/3 → 2/3 → 3/3)
  - After 3rd confirmation, transitions to composite screen

- [ ] **Composite Creation**
  - Final composite displays correctly
  - All 3 photos visible in vertical stack
  - Spacing between photos is visible
  - Image loads without artifacts

### UI/UX

- [ ] **Mobile Responsiveness**
  - Full-screen camera on mobile (portrait)
  - Buttons accessible and sized for touch
  - Header/footer visible and readable
  - No horizontal scrolling

- [ ] **Desktop Compatibility**
  - Works on full desktop view
  - Buttons properly aligned
  - Camera preview scales appropriately

- [ ] **Visual Polish**
  - Material Design theme applied
  - Icons display correctly
  - Colors are consistent
  - No console warnings/errors

### Download Feature

- [ ] **Download Button**
  - "Download" button appears on composite screen
  - Clicking downloads `photo-booth.jpg`
  - File is valid JPEG with correct dimensions

### Google Photos Integration (Optional without real credentials)

- [ ] **Auth Flow**
  - "Sign in to Upload" button appears if not authenticated
  - Clicking shows Google sign-in dialog
  - After signing in, button changes to "Upload to Google Photos"

- [ ] **Upload**
  - Composite uploads successfully (with real credentials)
  - Success notification appears
  - App automatically resets or shows upload confirmation

- [ ] **Error Handling**
  - Auth errors show helpful message
  - Network errors are caught and displayed
  - User can retry failed uploads

### Navigation

- [ ] **Menu Button** (on composite screen)
  - Opens navigation drawer
  - Shows current step and photo count
  - "Start Over" resets the app

- [ ] **Start Over Flow**
  - "New Session" button resets everything
  - Camera restarts
  - Back to Photo 1/3

## Browser-Specific Testing

### Chrome/Chromium (Desktop & Android)
- [ ] Camera permission dialog appears
- [ ] Video preview is smooth
- [ ] Capture/composite works correctly
- [ ] Download works

### Firefox (Desktop & Android)
- [ ] Camera access works
- [ ] Video rendering is correct
- [ ] No color/orientation issues

### Safari (macOS & iOS)
- [ ] Camera request works
- [ ] Video plays properly (may be slightly different rendering)
- [ ] Touch interactions work smoothly
- [ ] Composite displays correctly

### Edge (Desktop & Android)
- [ ] All features functional
- [ ] No Chromium-specific issues

## Mobile Device Testing

### Setup
1. Get IP address: `ipconfig getifaddr en0` (macOS) or `hostname -I` (Linux)
2. Run dev server: `npm run dev`
3. On mobile device, open `http://YOUR_IP:5173/`

### Testing Points
- [ ] Portrait orientation is primary
- [ ] Landscape works but may need viewport handling
- [ ] Touch buttons are at least 44x44px
- [ ] Camera feed updates smoothly
- [ ] No memory leaks after repeated captures
- [ ] App continues after device sleep (if permissions allow)

## Performance Testing

### Metrics to Check
- [ ] Page load time < 3 seconds
- [ ] Camera start < 1 second
- [ ] Composite creation < 2 seconds
- [ ] Upload time depends on image size and network

### Tools
```bash
# Build size check
npm run build
# Check dist/ folder size (should be ~120KB gzipped)

# Dev performance
# Open DevTools → Performance tab
# Record capture/composite actions
# Check for jank or long tasks
```

## Error Scenarios to Test

1. **Camera Permission Denied**
   - Should show error message
   - "Start Over" should be disabled or show helpful message

2. **Network Error During Upload**
   - Should show error snackbar
   - Retry should be possible

3. **OAuth Failure**
   - Should catch and display error
   - User can try again

4. **Image Composite Failure**
   - Should handle gracefully
   - Show error message, allow retake

## Debugging

### Browser DevTools
```javascript
// Check photo state
// In console: Open App.jsx and add console logs to usePhotoBooth hook

// Camera debug
console.log(navigator.mediaDevices)

// Canvas debug
// Add canvas rendering logs in imageComposite.js

// API debug
// Check Network tab for Google Photos API calls
// Look for proper Authorization headers
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Black camera preview | Camera not loading | Check permissions, try different browser |
| Composite image cuts off | Canvas drawing issue | Check image dimensions in browser |
| Upload fails with 401 | Token expired | Need to re-authenticate |
| Video shows vertically flipped | Transform/orientation | Check video element CSS |

## Sign-Off Checklist

Before considering the app production-ready:

- [ ] All tests pass on latest Chrome/Firefox/Safari
- [ ] Mobile testing complete on iOS and Android
- [ ] No console errors or warnings
- [ ] Performance acceptable on slower devices
- [ ] Accessibility check (keyboard nav, screen readers)
- [ ] Security review (no hardcoded secrets, HTTPS in prod)
- [ ] Google Photos integration tested (if using real credentials)
- [ ] Error handling for all failure scenarios
- [ ] Documentation complete and accurate
