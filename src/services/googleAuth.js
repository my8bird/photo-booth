const SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary',
  'https://www.googleapis.com/auth/photoslibrary.appendonly',
].join(' ')

class GoogleAuthService {
  constructor() {
    this.accessToken = null
    this.tokenExpiry = null
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    this.redirectUri = window.location.origin + window.location.pathname
  }

  async initialize() {
    // Load the Google APIs script for OAuth
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
      document.head.appendChild(script)
    })
  }

  async startOAuthFlow() {
    if (!this.clientId) {
      throw new Error('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in environment variables.')
    }

    // Use OAuth 2.0 implicit flow for browser-based apps
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'token',
      scope: SCOPES,
      prompt: 'consent',
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

    return new Promise((resolve, reject) => {
      // Check if hash contains access token (returned from OAuth redirect)
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const token = params.get('access_token')

      if (token) {
        // Token already in URL from redirect
        this.accessToken = token
        this.tokenExpiry = new Date(Date.now() + 3600 * 1000) // 1 hour
        // Clean up hash
        window.history.replaceState({}, document.title, window.location.pathname)
        resolve(token)
      } else {
        // Open OAuth consent screen
        const popup = window.open(authUrl, 'google_oauth', 'width=500,height=600')

        if (!popup) {
          reject(new Error('Popup blocked. Please allow popups for this site.'))
          return
        }

        // Listen for OAuth response
        const checkInterval = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkInterval)
              // Check if token was saved after popup closes
              if (this.accessToken) {
                resolve(this.accessToken)
              } else {
                reject(new Error('Authentication cancelled'))
              }
            }
          } catch (e) {
            // Popup access denied (cross-origin)
          }
        }, 1000)

        // Also listen for message from popup (if on same domain)
        const messageHandler = (event) => {
          if (event.data?.type === 'google_oauth_token') {
            clearInterval(checkInterval)
            if (popup) popup.close()
            this.accessToken = event.data.token
            this.tokenExpiry = new Date(Date.now() + 3600 * 1000)
            window.removeEventListener('message', messageHandler)
            resolve(event.data.token)
          }
        }
        window.addEventListener('message', messageHandler)
      }
    })
  }

  getAccessToken() {
    return this.accessToken
  }

  isAuthenticated() {
    return this.accessToken && (!this.tokenExpiry || new Date() < this.tokenExpiry)
  }

  logout() {
    this.accessToken = null
    this.tokenExpiry = null
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
  }
}

export const googleAuthService = new GoogleAuthService()
