# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
│         (React Components + Material UI)             │
│                                                      │
│  ┌──────────────┐         ┌──────────────────┐     │
│  │  CameraCapture│        │ CompositePreview │     │
│  │  - Video feed│        │ - Display result │     │
│  │  - Capture   │        │ - Download btn   │     │
│  │  - Retake    │        │ - Upload btn     │     │
│  └──────────────┘        └──────────────────┘     │
└──────────────┬──────────────────┬──────────────────┘
               │                  │
       ┌───────▼────────┐  ┌──────▼──────────┐
       │  usePhotoBooth │  │  Service Layers │
       │  Hook (State)  │  │                 │
       └───────┬────────┘  │ ┌─────────────┐ │
               │           │ │  Auth      │ │
               │           │ │  Service   │ │
               │           │ └─────────────┘ │
               │           │                 │
               │           │ ┌─────────────┐ │
               │           │ │  Composite  │ │
               │           │ │  Service    │ │
               │           │ └─────────────┘ │
               │           │                 │
               │           │ ┌─────────────┐ │
               │           │ │  Photos API │ │
               │           │ │  Service    │ │
               │           │ └─────────────┘ │
               │           └──────┬──────────┘
               └────────────────┬─┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼────────┐ ┌────▼────────┐ ┌──▼────────────┐
        │   Canvas API   │ │ Google OAuth│ │ Google Photos │
        │  (Browser)     │ │ (Google)    │ │ API (Google)  │
        └────────────────┘ └─────────────┘ └───────────────┘
```

## Component Hierarchy

```
App (Main)
│
├─ AppBar (conditional - composite only)
├─ Navigation Drawer
│
└─ Main Content (conditional rendering)
    ├─ CameraCapture (Photo 1, 2, 3)
    │  ├─ Video element (live feed)
    │  ├─ Canvas element (hidden - for capture)
    │  └─ Button controls
    │
    └─ CompositePreview (when step === 'composite')
       ├─ Composite image display
       └─ Button controls
```

## Data Flow

### Capture Sequence
```
User Actions → Component State → Parent Hook → Updated UI
     ↓
[Capture] → videoRef → canvas.drawImage → blob
     ↓
onCapture() → usePhotoBooth → photos[index] = blob
     ↓
setCurrentStep('preview') → CameraCapture shows preview
     ↓
[Retake] → resetPreview → stay in capture
     ↓
[Confirm] → confirmPhoto() → nextPhoto or composite
```

### Composite Creation Flow
```
photos [blob1, blob2, blob3]
     ↓
composePhotos() service called
     ↓
Load 3 blobs as images
     ↓
Create canvas (800×2400)
     ↓
drawImage() for each photo at positions:
  - Photo 1: y=0
  - Photo 2: y=830 (800 + 30)
  - Photo 3: y=1660 (800*2 + 30*2)
     ↓
canvas.toBlob() → JPEG blob
     ↓
Display in UI + enable upload/download
```

### Upload Flow
```
User clicks "Upload"
     ↓
Check authentication
     ├─ No → Show OAuth dialog
     │   ├─ googleAuthService.initialize()
     │   ├─ googleAuthService.startOAuthFlow()
     │   └─ Set isAuthenticated = true
     │
└─ Yes → uploadToGooglePhotos()
     ↓
POST /uploads with image blob
     ↓
Receive uploadToken
     ↓
POST /mediaItems:batchCreate with token
     ↓
mediaItem created in Google Photos
     ↓
Show success notification
```

## State Management

### App-Level State (usePhotoBooth Hook)
```javascript
{
  photos: [blob|null, blob|null, blob|null],
  currentStep: 'capture' | 'preview' | 'composite',
  currentPhotoIndex: 0 | 1 | 2,
  methods: {
    capturePhoto(blob),
    retakePhoto(),
    confirmPhoto(),
    reset()
  }
}
```

### Component-Level State
**CameraCapture**:
- `hasCamera`: boolean
- `isLoading`: boolean
- `error`: string
- `isCaptured`: boolean
- `previewImage`: URL string

**CompositePreview**:
- `compositeImage`: { blob, url }
- `isComposing`: boolean
- `isUploading`: boolean
- `isAuthenticated`: boolean
- `snackbar`: { open, message, severity }

## Service Architecture

### imageComposite.js
```
composePhotos(photos: [Blob, Blob, Blob])
  ├─ Load images from blobs
  ├─ Create canvas (800×2400)
  ├─ Draw 3 photos with spacing
  └─ Return JPEG Blob

downloadComposite(blob, filename)
  ├─ Create ObjectURL
  ├─ Trigger download
  └─ Cleanup
```

### googleAuth.js
```
googleAuthService
  ├─ initialize()
  │   └─ Load Google Identity Services script
  ├─ startOAuthFlow()
  │   ├─ Initialize OAuth client
  │   ├─ Show prompt/dialog
  │   └─ Handle callback
  ├─ getAccessToken()
  ├─ isAuthenticated()
  └─ logout()
```

### googlePhotosApi.js
```
uploadToGooglePhotos(blob, description)
  ├─ Step 1: POST /uploads → uploadToken
  ├─ Step 2: POST /mediaItems:batchCreate → mediaItem
  └─ Return { success, mediaItem, url }

listAlbums()
  └─ GET /albums → [Album]
```

## API Integration Points

### Google OAuth 2.0
```
Browser → accounts.google.com
  ├─ User signs in
  ├─ Grants permissions
  └─ Returns credential/token

Token stored in googleAuthService.accessToken
```

### Google Photos Library API
```
HTTP Requests to: https://photoslibrary.googleapis.com/v1/

1. Upload endpoint:
   POST /uploads
   Header: Authorization: Bearer {token}
   Body: JPEG image bytes
   Response: { uploadToken }

2. Create media endpoint:
   POST /mediaItems:batchCreate
   Header: Authorization: Bearer {token}
   Body: { newMediaItems: [{ simpleMediaItem: { uploadToken } }] }
   Response: { newMediaItemResults: [...] }
```

## Browser APIs Used

### getUserMedia (Camera Access)
```javascript
navigator.mediaDevices.getUserMedia(constraints)
  ├─ facingMode: 'user' (front camera)
  ├─ width/height ideals
  └─ audio: false
  
Returns: MediaStream
  └─ Assigned to video.srcObject
```

### Canvas API (Image Processing)
```javascript
canvas.getContext('2d')
  ├─ drawImage(img, x, y, width, height)
  ├─ fillRect, fillStyle for backgrounds
  └─ toBlob(callback, type, quality)
```

### File API (Download)
```javascript
URL.createObjectURL(blob)
  ├─ Creates downloadable link
  └─ Revoked after use
```

## Error Handling Strategy

```
Try-Catch Hierarchy:
└─ Component level (try-catch in handlers)
   └─ Service level (try-catch in API calls)
   └─ User feedback (Snackbar/Alert)

Key Error Scenarios:
├─ Camera access denied
│  └─ Show Card with helpful message
├─ OAuth failure
│  └─ Show dialog, allow retry
├─ API upload failure
│  └─ Show Snackbar with error
└─ Image composite failure
   └─ Show error, allow retake
```

## Performance Considerations

### Image Size Optimization
- JPEG quality: 0.9 (balance between size & quality)
- Canvas size: 800×2400 (reasonable for mobile)
- Estimated output: 200-400KB per composite

### Memory Management
```
Photo Capture:
  └─ Canvas → Blob → ObjectURL
     └─ Cleanup: URL.revokeObjectURL() after use

Image Compositing:
  ├─ Load 3 images
  ├─ Create canvas
  └─ toBlob() with callback
     └─ Cleanup: URLs revoked

Upload:
  └─ FormData with single blob
     └─ Cleanup: Handled by service
```

### Network Optimization
- Single image upload (composite)
- OAuth token caching (reuse for multiple uploads)
- Progressive upload feedback

## Security Model

```
Client-Side Operations (Browser):
├─ Camera capture (user device only)
├─ Image compositing (local Canvas API)
└─ OAuth token storage (memory/sessionStorage)

Server-Side Operations (Google):
├─ OAuth token validation
├─ Image storage
└─ Media library management

No backend = no middleman
  ├─ Photos never stored on intermediary
  ├─ Direct browser → Google Photos
  └─ User remains in control
```

## Scalability Considerations

### Current Limitations
- Fixed 3-photo composition
- Single image size (800×2400)
- Memory-only storage

### Future Scaling Options
- User-configurable layouts
- Multiple composition templates
- Session history/persistence
- Cloud storage integration
- Analytics/reporting

## Testing Strategy

### Unit Tests
- `imageComposite.js`: Canvas operations
- `googleAuth.js`: Token management
- `usePhotoBooth.js`: State transitions

### Integration Tests
- Camera → Capture → Preview flow
- Multi-photo sequence
- Composite creation
- Upload workflow

### E2E Tests
- Full user flow on real devices
- OAuth completion
- Google Photos verification

### Performance Tests
- Bundle size
- Runtime performance
- Memory leaks
- Network latency

## Deployment Architecture

```
Source Code (Git)
    ↓
Build (npm run build)
    ↓
dist/ folder (optimized)
    ↓
CDN / Static Hosting
    ├─ Vercel
    ├─ Netlify
    ├─ Firebase
    ├─ AWS Amplify
    └─ GitHub Pages
    ↓
Browser
    ├─ Load assets
    ├─ Initialize React app
    └─ Ready for user interaction
```

## Monitoring & Analytics (Optional)

```
Recommended Integrations:
├─ Error Tracking: Sentry, LogRocket
├─ Analytics: Google Analytics, Mixpanel
├─ Performance: Web Vitals, Lighthouse
└─ Logging: LogRocket, Datadog
```

---

This architecture is designed for:
- ✅ Mobile-first experience
- ✅ Direct user control of data
- ✅ Minimal external dependencies
- ✅ Clear separation of concerns
- ✅ Scalability for enhancements
- ✅ Easy maintenance and testing
