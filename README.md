# Photo Booth App

A mobile-first React application that captures three sequential photos, composites them together, and shares via email.

🚀 **[Try the live app →](https://my8bird.github.io/photo-booth/)**

## Features

- ✅ **Multi-Photo Capture**: Take 3 sequential photos with camera access
- ✅ **Retake Capability**: Retake any photo before proceeding
- ✅ **Image Compositing**: Automatically stack photos vertically with spacing and rounded corners
- ✅ **Email Sharing**: Share composite via email with one click - downloads image and opens email client
- ✅ **Mobile Optimized**: Full-screen camera view optimized for mobile devices
- ✅ **Material Design UI**: Clean Material UI components for consistent experience
- ✅ **Zero Configuration**: No authentication or credentials needed - just use it

## Setup

### Prerequisites
- Node.js 16+ and npm
- Google Cloud Function deployed (see SETUP_GOOGLE_CLOUD_FUNCTION.md)
- Service account with access to Google Photos

### Installation

1. **Clone or navigate to the project**
```bash
cd /Users/nlandis/src/dev/dean
npm install
```

2. **Configure Backend URL**
   - Open `.env`
   - Update `VITE_UPLOAD_FUNCTION_URL` with your Cloud Function URL
   - Example: `https://us-central1-my-project.cloudfunctions.net/uploadPhoto`

3. **Run Development Server**
```bash
npm run dev
```

The app will open at `http://localhost:5173/`

### Backend Setup

For detailed instructions on setting up the Google Cloud Function backend:
1. Read [SETUP_GOOGLE_CLOUD_FUNCTION.md](SETUP_GOOGLE_CLOUD_FUNCTION.md)
2. Deploy the function from `backend/` directory
3. Update `.env` with your function URL

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
2. **Take Photos 1-3**: 
   - Camera automatically counts down from 5 and captures
   - Review in preview
   - "Retake" to recapture, or auto-advances to next photo
3. **Review Composite**: View the final stacked image
4. **Share Options**:
   - **Share to Google Photos**: One click uploads the image directly to Google Photos (automatic, no authentication needed)
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

## Technical Details

### Image Compositing
- **Dimensions**: 800px width, calculated height based on photo dimensions
- **Spacing**: 80px between photos
- **Rounded Corners**: 16px radius on each photo
- **Format**: JPEG (quality 0.9)
- **Processing**: Client-side using Canvas API
- **Background**: White

### Google Photos Upload
- **Backend**: Google Cloud Function (Node.js 20)
- **Architecture**: 
  1. Frontend converts composite image to base64
  2. Sends to Cloud Function via HTTPS POST
  3. Function authenticates with service account
  4. Function calls Google Photos Library API v1
  5. Photo uploaded to shared Google Photos account
- **User Flow**: One click → automatic upload → confirmation message
- **No User Authentication**: Service account handles all auth

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

### Google Photos Upload
- No user login required - happens automatically via service account
- Photos upload to the shared Google Photos account configured in the service account
- Uploads happen in the background with user confirmation
- Image is sent as base64-encoded JPEG to the backend function
- Backend function handles all Google authentication and API calls

## Troubleshooting

### Camera not working
- Check browser permissions (Settings → Microphone/Camera)
- Try a different browser
- Verify HTTPS in production
- On iOS, make sure you're in Safari (not in-app browser)

### Upload to Google Photos fails
- Verify `VITE_UPLOAD_FUNCTION_URL` is set correctly in `.env`
- Check that the Cloud Function is deployed and accessible
- Verify service account has Google Photos permissions
- Check Cloud Function logs in Google Cloud Console
- See [SETUP_GOOGLE_CLOUD_FUNCTION.md](SETUP_GOOGLE_CLOUD_FUNCTION.md) for detailed troubleshooting

### "Upload token not configured" error
- Make sure `VITE_UPLOAD_FUNCTION_URL` is not empty in `.env`
- Rebuild the app after updating `.env`: `npm run build`

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
