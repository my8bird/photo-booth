# Photo Booth App

A mobile-first React application that captures three sequential photos, composites them together, and uploads to Google Photos.

🚀 **[Try the live app →](https://my8bird.github.io/photo-booth/)**

## Features

- ✅ **Multi-Photo Capture**: Take 3 sequential photos with camera access
- ✅ **Retake Capability**: Retake any photo before proceeding
- ✅ **Image Compositing**: Automatically stack photos vertically with spacing
- ✅ **Google Photos Integration**: Upload final composite directly to Google Photos
- ✅ **Download Option**: Save composite as JPEG locally
- ✅ **Mobile Optimized**: Full-screen camera view optimized for mobile devices
- ✅ **Material Design UI**: Clean Material UI components for consistent experience

## Setup

### Prerequisites
- Node.js 16+ and npm
- Google OAuth 2.0 credentials (Client ID)

### Installation

1. **Clone or navigate to the project**
```bash
cd /Users/nlandis/src/dev/dean
npm install
```

2. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable "Google Photos Library API"
   - Create OAuth 2.0 credentials (Web application)
   - Add redirect URI: `http://localhost:5173/` (for dev)
   - Copy your Client ID

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/
   ```

4. **Run Development Server**
```bash
npm run dev
```

The app will open at `http://localhost:5173/`

### Production Build

```bash
npm run build
npm run preview
```

### Deployment to GitHub Pages

The app is deployed to GitHub Pages at `https://my8bird.github.io/photo-booth/`

To configure GitHub Pages for this repository:
1. Go to repository **Settings** → **Pages**
2. Under "Build and deployment", select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
3. Save

The deployment is handled automatically via GitHub Actions when changes are pushed to the main branch.

## Usage Flow

1. **Camera Access**: Grant camera permission when prompted
2. **Photo 1-3**: 
   - Press "Capture Photo" to take a picture
   - Review in preview
   - "Retake" to recapture, or "Confirm" to proceed to next photo
3. **Review**: After 3 photos, view the composite
4. **Upload Options**:
   - **Download**: Save composite to device
   - **Upload to Google Photos**: Sign in with Google and upload
   - **New Session**: Start over with fresh photos

## Architecture

### Components
- **CameraCapture.jsx**: Handles camera access, photo capture, and preview
- **CompositePreview.jsx**: Displays final composite, handles upload/download
- **App.jsx**: Main orchestration and navigation

### Hooks
- **usePhotoBooth.js**: State management for photo flow

### Services
- **imageComposite.js**: Canvas-based image stacking with JPEG export
- **googleAuth.js**: OAuth 2.0 authentication flow
- **googlePhotosApi.js**: Google Photos Library API integration

## API Details

### Image Compositing
- **Dimensions**: 800px width, 2400px height (3x 800px photos + spacing)
- **Spacing**: 30px between photos
- **Format**: JPEG (quality 0.9)
- **Processing**: Client-side using Canvas API

### Google OAuth
- **Flow**: Authorization code flow with implicit fallback
- **Scopes**: 
  - `photoslibrary` - Read/write access to photos
  - `photoslibrary.appendonly` - Append-only mode
- **Token Storage**: In-memory (sessionStorage for persistence)

### Google Photos Upload
- **API**: Photos Library API v1
- **Endpoint**: `https://photoslibrary.googleapis.com/v1/uploads`
- **Process**:
  1. Upload media bytes to get upload token
  2. Create media item using token
  3. Media saved to Google Photos library

## Mobile Browser Support

- ✅ Chrome/Chromium (Android)
- ✅ Safari (iOS 14+)
- ✅ Firefox (Android)
- ✅ Edge (Android)

## Important Notes

### Camera Permissions
- Users must grant camera access for the app to work
- On iOS, requires HTTPS in production (localhost HTTP is allowed for dev)
- On Android, users can grant/deny permission in system settings

### Google OAuth
- Must be configured with proper redirect URIs
- For production, add your domain to authorized redirect URIs
- OAuth credentials should never be hardcoded; use environment variables

### CORS
- Google Photos API requires proper CORS headers
- Image URLs must support CORS for compositing to work

## Troubleshooting

### Camera not working
- Check browser permissions (Settings → Microphone/Camera)
- Try a different browser
- Verify HTTPS in production

### Google Photos upload fails
- Verify OAuth credentials are correct
- Check that "Google Photos Library API" is enabled in Google Cloud Console
- Ensure redirect URI matches exactly
- Check network tab for 401 (auth) or 403 (permissions) errors

### Composite image cuts off
- Ensure all 3 photos are captured successfully
- Check browser console for JavaScript errors
- Try a different device/browser

## Development

### File Structure
```
src/
├── components/
│   ├── CameraCapture.jsx
│   └── CompositePreview.jsx
├── services/
│   ├── googleAuth.js
│   ├── googlePhotosApi.js
│   └── imageComposite.js
├── hooks/
│   └── usePhotoBooth.js
├── App.jsx
└── main.jsx
```

### Key Technologies
- React 18 (hooks, functional components)
- Material-UI 5 (components, styling)
- Canvas API (image compositing)
- getUserMedia API (camera access)
- Google OAuth 2.0 (authentication)
- Google Photos Library API (upload)

## Future Enhancements

- [ ] Photo filters and effects
- [ ] Custom spacing/layout options
- [ ] Album selection for upload
- [ ] Photo editing before composite
- [ ] Background blur effects
- [ ] Progressive Web App (PWA)
- [ ] Video recording mode
- [ ] Social media sharing

## License

MIT

## Support

For issues or questions, please check the browser console for error messages and verify:
1. Camera permissions are granted
2. Google OAuth credentials are configured
3. Network connectivity is stable
4. Browser is supported and up-to-date
