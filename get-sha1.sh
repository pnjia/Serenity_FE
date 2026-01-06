#!/bin/bash

# Script to get SHA-1 fingerprint for Google OAuth Android configuration
# Run this from the project root directory

echo "=========================================="
echo "Getting Android Debug SHA-1 Fingerprint"
echo "=========================================="
echo ""

# Check if keytool is available
if ! command -v keytool &> /dev/null; then
    echo "❌ Error: keytool not found!"
    echo "Make sure Java JDK is installed and in your PATH"
    exit 1
fi

# Path to Android debug keystore
KEYSTORE_PATH="$HOME/.android/debug.keystore"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ Error: Debug keystore not found at $KEYSTORE_PATH"
    echo "Run an Android build first to generate the debug keystore"
    exit 1
fi

echo "Debug Keystore: $KEYSTORE_PATH"
echo ""
echo "SHA-1 Fingerprint:"
echo "------------------"

# Get SHA-1 fingerprint
keytool -list -v -keystore "$KEYSTORE_PATH" -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | sed 's/.*SHA1: //'

echo ""
echo "=========================================="
echo "Instructions:"
echo "=========================================="
echo "1. Copy the SHA-1 fingerprint above"
echo "2. Go to Google Cloud Console"
echo "3. Navigate to: APIs & Services → Credentials"
echo "4. Find your Android OAuth 2.0 Client ID"
echo "5. Click Edit"
echo "6. Add the SHA-1 fingerprint"
echo "7. Save"
echo ""
echo "Package name should be: com.pnjia.serenity"
echo "(or check your app.json for the correct package name)"
echo ""
