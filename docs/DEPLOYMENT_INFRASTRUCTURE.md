# Deployment & Infrastructure Documentation

## Overview
The Sonnet Survey application is deployed using Firebase services with static hosting and serverless functions. This document covers the complete deployment architecture, CI/CD processes, and infrastructure management.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Firebase       │    │  Next.js        │    │  Firebase       │
│  Hosting        │────│  Static Export  │────│  Cloud Functions│
│  (Frontend)     │    │  (SSG)          │    │  (Backend)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    │    ┌─────────────────┐
         │  Firebase       │    │    │  Firebase       │
         │  Authentication │────┼────│  Firestore      │
         │                 │         │  Database       │
         └─────────────────┘         └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS  
- **State Management**: React Context + useState/useReducer
- **Authentication**: Firebase Auth with Google OAuth
- **Deployment**: Firebase Hosting (Static Export)

### Backend
- **Database**: Firebase Firestore
- **Functions**: Firebase Cloud Functions (Node.js)
- **Authentication**: Firebase Authentication
- **Region**: europe-west1 (GDPR compliance)

### Build & Deployment
- **Build Tool**: Next.js compiler
- **Package Manager**: npm
- **Hosting**: Firebase Hosting
- **CI/CD**: Manual deployment (can be automated)

## Firebase Configuration

### 1. Project Structure
```
survey-sonnet (Firebase Project)
├── Hosting
│   ├── Domain: survey-sonnet.web.app
│   └── Custom Domain: (optional)
├── Authentication
│   ├── Providers: Google OAuth
│   └── Authorized Domains: localhost, survey-sonnet.web.app
├── Firestore Database
│   ├── Mode: Production
│   ├── Region: europe-west1
│   └── Collections: organizations, surveys, userSurveyStatus
└── Cloud Functions
    ├── Runtime: Node.js 18
    ├── Region: europe-west1
    └── Functions: listUsers, setAdminClaims
```

### 2. Firebase CLI Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (already done)
firebase init

# Link to Firebase project
firebase use survey-sonnet
```

### 3. Firebase Configuration Files

#### `firebase.json`
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control", 
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "codebase": "default",
    "runtime": "nodejs18",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  }
}
```

#### `firestore.rules`
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticatedUser() {
      return request.auth != null && request.auth.token.email != null;
    }
    
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Survey responses collection
    match /surveys/{surveyId} {
      allow create: if isAuthenticatedUser() && 
                       request.auth.uid == request.resource.data.userId;
      allow read: if isAdmin();
      allow update, delete: if false;
    }
    
    // User survey status collection
    match /userSurveyStatus/{userId} {
      allow read, write: if isAuthenticatedUser() && isOwner(userId);
      allow read: if isAdmin();
      allow delete: if false;
    }
    
    // Organizations collection
    match /organizations/{organizationId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

#### `firestore.indexes.json`
```json
{
  "indexes": [
    {
      "collectionGroup": "organizations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "domain",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "organizations",
      "queryScope": "COLLECTION", 
      "fields": [
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "name",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "surveys",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "organizationId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "submittedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Next.js Configuration

### 1. Production Build Configuration
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Firebase Hosting
  output: 'export',
  trailingSlash: true,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Environment configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack config if needed
    return config;
  },
};

export default nextConfig;
```

### 2. Build Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:all": "npm run build && firebase deploy",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## Deployment Process

### 1. Manual Deployment

#### Step 1: Environment Setup
```bash
# Ensure environment variables are set
echo "Checking environment variables..."
if [ -z "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
  echo "❌ Missing NEXT_PUBLIC_FIREBASE_API_KEY"
  exit 1
fi

if [ -z "$FIREBASE_PRIVATE_KEY" ]; then
  echo "❌ Missing FIREBASE_PRIVATE_KEY"
  exit 1
fi

echo "✅ Environment variables configured"
```

#### Step 2: Build Process
```bash
# Install dependencies
npm ci

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Verify build output
ls -la out/
```

#### Step 3: Deploy to Firebase
```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy functions only
firebase deploy --only functions

# Deploy everything
firebase deploy

# Deploy with confirmation
firebase deploy --confirm
```

### 2. Automated CI/CD (GitHub Actions)

#### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Type check
      run: npm run type-check
      
    - name: Lint
      run: npm run lint
      
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
        FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
        FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
        
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: survey-sonnet
```

### 3. Environment-specific Deployments

#### Development/Staging
```bash
# Use different Firebase project for staging
firebase use staging-project-id

# Deploy with staging configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=staging-project npm run build
firebase deploy --only hosting
```

#### Production
```bash
# Use production Firebase project
firebase use survey-sonnet

# Deploy with production configuration
npm run build
firebase deploy
```

## Environment Management

### 1. Firebase Environment Configuration
```bash
# Set Cloud Functions environment variables
firebase functions:config:set \
  app.firebase_project_id="survey-sonnet" \
  app.firebase_client_email="firebase-adminsdk@survey-sonnet.iam.gserviceaccount.com" \
  app.firebase_private_key="-----BEGIN PRIVATE KEY-----..."

# Get current configuration
firebase functions:config:get

# Clone configuration to local for emulation
firebase functions:config:get > .runtimeconfig.json
```

### 2. Local Environment
```bash
# .env.local for development
NEXT_PUBLIC_FIREBASE_API_KEY=dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dev-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=dev-service@dev-project.iam.gserviceaccount.com
```

### 3. Production Environment
```bash
# Set via Firebase Console or CLI
# Never commit production secrets to git
NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=survey-sonnet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=survey-sonnet
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@survey-sonnet.iam.gserviceaccount.com
```

## Monitoring & Logging

### 1. Firebase Console Monitoring
```bash
# View deployment status
firebase hosting:sites:list

# View function logs
firebase functions:log

# View function errors
firebase functions:log --only-errors

# Monitor function performance
# (Available in Firebase Console)
```

### 2. Application Monitoring
```typescript
// lib/monitoring.ts
export const logError = (error: Error, context: string) => {
  console.error(`[${context}]`, error);
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to Firebase Crashlytics or other service
  }
};

export const logPerformance = (metric: string, duration: number) => {
  console.log(`Performance: ${metric} took ${duration}ms`);
  
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    // Send to Firebase Performance or other service
  }
};
```

### 3. Health Checks
```typescript
// api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkFirestore(),
      auth: await checkAuth(),
      functions: await checkFunctions()
    }
  };
  
  return Response.json(health);
}

async function checkFirestore(): Promise<boolean> {
  try {
    // Simple read operation
    await getDocs(query(collection(db, 'organizations'), limit(1)));
    return true;
  } catch {
    return false;
  }
}
```

## Security & Performance

### 1. Security Headers
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

### 2. Performance Optimization
```typescript
// Performance monitoring
import { getPerformance } from 'firebase/performance';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const perf = getPerformance(app);
  
  // Custom performance traces
  const trace = perf.trace('survey_submission');
  trace.start();
  // ... survey submission logic
  trace.stop();
}
```

### 3. Caching Strategy
```bash
# Firebase Hosting cache configuration
# In firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "/static/**",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }]
      },
      {
        "source": "/**/*.html",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }]
      }
    ]
  }
}
```

## Backup & Recovery

### 1. Database Backup
```bash
# Export Firestore data
gcloud firestore export gs://survey-sonnet-backups/$(date +%Y%m%d)

# Schedule regular backups (Cloud Scheduler)
gcloud scheduler jobs create app-engine backup-firestore \
  --schedule="0 2 * * *" \
  --time-zone="UTC" \
  --service="backup-service"
```

### 2. Configuration Backup
```bash
# Backup Firebase configuration
firebase functions:config:get > config-backup-$(date +%Y%m%d).json

# Backup security rules
cp firestore.rules firestore.rules.backup-$(date +%Y%m%d)

# Backup indexes
cp firestore.indexes.json firestore.indexes.backup-$(date +%Y%m%d).json
```

### 3. Recovery Procedures
```bash
# Restore from backup
gcloud firestore import gs://survey-sonnet-backups/YYYYMMDD

# Restore configuration
firebase functions:config:set < config-backup.json

# Redeploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

## Troubleshooting

### 1. Common Deployment Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Firebase Deployment Issues
```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Check project configuration
firebase projects:list
firebase use --add

# Check authentication
firebase login --reauth
```

### 2. Runtime Issues

#### Function Timeouts
```typescript
// Increase function timeout in functions/src/index.ts
export const longRunningFunction = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: '1GB'
  })
  .https.onRequest(async (req, res) => {
    // Function implementation
  });
```

#### Database Connection Issues
```typescript
// Retry logic for Firestore operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};
```

This comprehensive deployment documentation ensures that any developer can understand and manage the infrastructure, deployments, and operational aspects of the Sonnet Survey application.