const SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary',
  'https://www.googleapis.com/auth/photoslibrary.appendonly',
].join(' ')

class GoogleAuthService {
  constructor() {
    this.accessToken = null
    this.tokenExpiry = null
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    this.preConfiguredToken = import.meta.env.VITE_GOOGLE_PHOTOS_TOKEN
  }

  async initialize() {
    // Load the Google Sign-In script
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
    if (!window.google) {
      throw new Error('Google Sign-In not loaded. Call initialize() first.')
    }

    return new Promise((resolve, reject) => {
      try {
        // Use implicit flow for browser
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response) => {
            if (response.credential) {
              this.accessToken = response.credential
              this.tokenExpiry = new Date(Date.now() + 3600 * 1000) // 1 hour
              resolve(response.credential)
            } else {
              reject(new Error('No credential received'))
            }
          },
          scope: SCOPES,
        })

        // Trigger the prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to redirect flow
            this.redirectToAuth()
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  redirectToAuth() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin,
      response_type: 'token',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  getAccessToken() {
    // If pre-configured token exists, use it
    if (this.preConfiguredToken) {
      return this.preConfiguredToken
    }
    // Otherwise return user-authenticated token
    return this.accessToken
  }

  isAuthenticated() {
    // Pre-configured token means we're always authenticated
    if (this.preConfiguredToken) {
      return true
    }
    // Check user-authenticated token
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
