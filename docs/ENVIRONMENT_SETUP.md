# Environment Setup Documentation

## Overview
This document provides comprehensive setup instructions for all environments (development, staging, production) of the Sonnet Survey application.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **Firebase CLI**: Latest version
- **Operating System**: macOS, Linux, or Windows with WSL2

### Account Requirements
- **Firebase Project**: With Authentication and Firestore enabled
- **Google Cloud Project**: Linked to Firebase project
- **GitHub Account**: For repository access
- **Domain Access**: Organization email domain for testing

## Environment Variables

### Required Environment Variables

#### `.env.local` (Development)
```bash
# Firebase Configuration (Public - can be exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=survey-sonnet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=survey-sonnet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=survey-sonnet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012

# Firebase Admin (Server-side only - KEEP SECRET)
FIREBASE_PROJECT_ID=survey-sonnet
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@survey-sonnet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Production Environment Variables
```bash
# Same as development but with production values
NEXT_PUBLIC_FIREBASE_API_KEY=production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-production-domain.firebaseapp.com
# ... other production Firebase config

# Production settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://survey-sonnet.web.app

# Additional production variables
FIREBASE_FUNCTIONS_URL=https://europe-west1-survey-sonnet.cloudfunctions.net
```

### Environment Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Web API key (public) | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID | `survey-sonnet` |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account email | `service@project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account private key | `-----BEGIN PRIVATE KEY-----...` |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL | `https://domain.com` |
| `NODE_ENV` | Auto | Environment mode | `development`/`production` |

## Firebase Project Setup

### 1. Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new project (or use existing)
firebase projects:create survey-sonnet

# Initialize project in directory
firebase init
```

### 2. Configure Authentication
```bash
# Enable Google Auth provider
# This must be done in Firebase Console:
# 1. Go to Authentication > Sign-in method
# 2. Enable Google provider
# 3. Add authorized domains (localhost:3000, your-domain.com)
```

### 3. Setup Firestore Database
```bash
# Initialize Firestore
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 4. Configure Cloud Functions
```bash
# Initialize functions (already done in this project)
firebase init functions

# Install dependencies
cd functions && npm install

# Deploy functions
firebase deploy --only functions
```

### 5. Generate Service Account Key
```bash
# Go to Firebase Console > Project Settings > Service Accounts
# Click "Generate new private key"
# Download JSON file and extract values for environment variables

# Or use CLI (requires project owner permissions)
firebase serviceaccount:create firebase-adminsdk
```

## Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Kyan-Health/sonnet-survey.git
cd sonnet-survey
```

### 2. Install Dependencies
```bash
# Install main project dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### 4. Firebase Emulator Setup (Optional)
```bash
# Install emulator components
firebase init emulators

# Start emulators for local development
firebase emulators:start

# Use emulator endpoints in development
export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Verify Setup
Navigate to `http://localhost:3000` and verify:
- [ ] Login with Google works
- [ ] Organization detection works
- [ ] Survey form loads
- [ ] Admin dashboard accessible (if user has admin claims)

## Production Deployment

### 1. Build Configuration
```bash
# Verify production build
npm run build

# Test production build locally
npm start
```

### 2. Environment Variables Setup

#### Vercel (if using)
```bash
# Install Vercel CLI
npm install -g vercel

# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add FIREBASE_PRIVATE_KEY
# ... repeat for all variables

# Deploy
vercel --prod
```

#### Firebase Hosting
```bash
# Build for static export
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 3. Cloud Functions Deployment
```bash
# Deploy functions to production
firebase deploy --only functions

# Set function environment variables
firebase functions:config:set \
  firebase.client_email="service@project.iam.gserviceaccount.com" \
  firebase.private_key="-----BEGIN PRIVATE KEY-----..."

# Verify function deployment
firebase functions:log
```

## Environment-Specific Configurations

### Development Environment
```typescript
// next.config.js
const nextConfig = {
  // Enable source maps in development
  productionBrowserSourceMaps: false,
  
  // Disable telemetry in development
  telemetry: false,
  
  // Development-specific webpack config
  webpack: (config, { dev }) => {
    if (dev) {
      // Development-specific webpack modifications
    }
    return config;
  }
};
```

### Production Environment
```typescript
// next.config.js
const nextConfig = {
  // Static export for Firebase Hosting
  output: 'export',
  trailingSlash: true,
  
  // Optimize images
  images: {
    unoptimized: true
  },
  
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ]
    }
  ]
};
```

## Troubleshooting

### Common Issues

#### 1. Firebase Authentication Errors
```bash
# Error: Firebase Auth domain not authorized
# Solution: Add domain to Firebase Console > Authentication > Settings > Authorized domains

# Error: API key restrictions
# Solution: Configure API key restrictions in Google Cloud Console
```

#### 2. Firestore Permission Errors
```bash
# Error: Missing or insufficient permissions
# Solution: Verify security rules and user authentication

# Check current user claims
firebase auth:export users.json
```

#### 3. Environment Variable Issues
```bash
# Error: Environment variable not found
# Verify variable names (check for typos)
# Restart development server after changes
npm run dev

# Debug environment variables
console.log('Environment check:', {
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  nodeEnv: process.env.NODE_ENV
});
```

#### 4. Build Errors
```bash
# Error: Type errors during build
npm run type-check

# Error: Lint errors
npm run lint:fix

# Error: Missing dependencies
rm -rf node_modules package-lock.json
npm install
```

### Health Check Endpoints

#### Development Health Check
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebase: {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasServiceAccount: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }
  };
  
  res.status(200).json(health);
}
```

### Performance Monitoring

#### Enable Performance Monitoring
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';

const app = initializeApp(firebaseConfig);

// Only in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const perf = getPerformance(app);
}
```

## Security Checklist

### Development Security
- [ ] `.env.local` in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Local HTTPS for testing (if needed)
- [ ] Firebase emulators for offline development

### Production Security
- [ ] Environment variables encrypted
- [ ] API keys restricted by domain/IP
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Firestore rules tested and verified
- [ ] Regular dependency updates
- [ ] Monitoring and alerting enabled

## Backup and Recovery

### Database Backup
```bash
# Export Firestore data
firebase firestore:delete --all-collections  # BE CAREFUL!
gcloud firestore export gs://your-bucket/backup-folder

# Restore from backup
gcloud firestore import gs://your-bucket/backup-folder
```

### Configuration Backup
```bash
# Export Firebase configuration
firebase functions:config:get > firebase-config.json

# Export security rules
firebase firestore:rules > firestore.rules.backup
```