#!/bin/bash

# Google Photos Service Account Access Token Generator
# This script exchanges a service account JSON key for an access token
# that can be used for direct Google Photos uploads

set -e

# Check if a key file was provided
if [ $# -eq 0 ]; then
    echo "Usage: ./get-google-token.sh /path/to/service-account-key.json"
    echo ""
    echo "Example:"
    echo "  ./get-google-token.sh ~/Downloads/photo-booth-key.json"
    exit 1
fi

KEY_FILE="$1"

# Verify the file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "Error: File not found: $KEY_FILE"
    exit 1
fi

echo "📸 Google Photos Service Account Token Generator"
echo "=================================================="
echo ""
echo "Reading service account key from: $KEY_FILE"
echo ""

# Extract values from JSON key file
PRIVATE_KEY=$(jq -r '.private_key' "$KEY_FILE" 2>/dev/null)
CLIENT_EMAIL=$(jq -r '.client_email' "$KEY_FILE" 2>/dev/null)

if [ -z "$PRIVATE_KEY" ] || [ -z "$CLIENT_EMAIL" ]; then
    echo "Error: Could not read service account key file."
    echo "Make sure it's a valid Google service account JSON key."
    exit 1
fi

echo "Service Account Email: $CLIENT_EMAIL"
echo ""
echo "Generating JWT..."

# Create JWT header and payload
HEADER=$(echo -n '{"alg":"RS256","typ":"JWT"}' | base64 | tr '+/' '-_' | tr -d '=')

NOW=$(date +%s)
EXPIRY=$((NOW + 3600))

PAYLOAD=$(echo -n "{\"iss\":\"$CLIENT_EMAIL\",\"scope\":\"https://www.googleapis.com/auth/photoslibrary\",\"aud\":\"https://oauth2.googleapis.com/token\",\"exp\":$EXPIRY,\"iat\":$NOW}" | base64 | tr '+/' '-_' | tr -d '=')

# Create signature
MESSAGE="$HEADER.$PAYLOAD"
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -sign <(echo "$PRIVATE_KEY") | base64 | tr '+/' '-_' | tr -d '=')

JWT="$MESSAGE.$SIGNATURE"

echo "Exchanging JWT for access token..."
echo ""

# Exchange JWT for access token
RESPONSE=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$JWT")

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token' 2>/dev/null)
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo "❌ Error: Failed to get access token"
    echo ""
    echo "Response from Google:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo "✅ Success! Access token generated"
echo ""
echo "=================================================="
echo ""
echo "📋 Your Access Token (expires in $EXPIRES_IN seconds):"
echo ""
echo "$ACCESS_TOKEN"
echo ""
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Copy the token above"
echo "2. Open .env in your photo booth project"
echo "3. Set: VITE_GOOGLE_PHOTOS_TOKEN=$ACCESS_TOKEN"
echo "4. Save and rebuild: npm run build"
echo ""
echo "The token will expire after 1 hour. When it does, run this script again to get a fresh one."
