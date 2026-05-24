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
- No other credentials or configuration needed!

### Installation

1. **Clone or navigate to the project**
```bash
cd /Users/nlandis/src/dev/dean
npm install
```

2. **Run Development Server**
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
2. **Take Photos 1-3**: 
   - Camera automatically counts down from 5 and captures
   - Review in preview
   - "Retake" to recapture, or auto-advances to next photo
3. **Review Composite**: View the final stacked image
4. **Share Options**:
   - **Share via Email**: Download image and open email client with pre-filled message
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

### Email Sharing
- **Method**: `mailto:` URI scheme with pre-filled subject and body
- **Image**: Automatically downloaded as `photo-booth.jpg`
- **User Flow**: Download + open default email client
- **Compatibility**: Works on all devices and browsers with email support

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

### Email Sharing
- The app opens the user's default email client
- The image is downloaded locally (`photo-booth.jpg`)
- Users must manually attach the image to the email
- Works with all email clients: Gmail, Outlook, Apple Mail, etc.

## Troubleshooting

### Camera not working
- Check browser permissions (Settings → Microphone/Camera)
- Try a different browser
- Verify HTTPS in production
- On iOS, make sure you're in Safari (not in-app browser)

### Email client won't open
- Check that your device has an email app configured
- Try clicking "Share via Email" again
- Some browsers may require user confirmation for opening email

### Image doesn't download
- Check browser download permissions
- Ensure you have storage space on your device
- Try a different browser

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
