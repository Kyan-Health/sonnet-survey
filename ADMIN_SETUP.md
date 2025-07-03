# Admin Setup and Firestore Security Rules

## Overview
This document outlines the security setup for the Sonnet Survey application, including Firestore security rules and Firebase Authentication custom claims for admin access.

## Firestore Security Rules

The application uses the following security model:

### Security Rules (`firestore.rules`)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isKyanHealthUser() {
      return request.auth != null && 
             request.auth.token.email.matches('.*@kyanhealth.com$');
    }
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Survey responses - users can create, admins can read
    match /surveys/{surveyId} {
      allow create: if isKyanHealthUser() && isOwner(resource.data.userId);
      allow read: if isAdmin();
      allow update, delete: if false; // Immutable
    }
    
    // User survey status - users manage own, admins read all
    match /userSurveyStatus/{userId} {
      allow read, write: if isKyanHealthUser() && isOwner(userId);
      allow read: if isAdmin();
      allow delete: if false;
    }
  }
}
```

### Deploying Security Rules

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your project: `survey-sonnet`
   - Keep the default `firestore.rules` file
   - Keep the default `firestore.indexes.json` file

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Admin Access Setup

### Firebase Custom Claims
The application uses Firebase Authentication custom claims to manage admin access. This is more secure than email-based checks.

### Setting Up Admin Access

#### Initial Bootstrap (for ignacio@kyanhealth.com)

1. **Environment Variables**: Add these to your `.env.local` file:
   ```
   FIREBASE_PROJECT_ID=survey-sonnet
   FIREBASE_CLIENT_EMAIL=your-service-account-email@survey-sonnet.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. **Service Account Key**: 
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key for "Firebase Admin SDK"
   - Use the values from the JSON file for the environment variables above

3. **Bootstrap Admin Access**:
   - Sign in as `ignacio@kyanhealth.com`
   - Visit `/admin` - you'll see a "Bootstrap Admin Access" button
   - Click to grant yourself admin privileges
   - This will set the `admin: true` custom claim on your user

#### Adding Additional Admins

Once you have admin access, you can use the API to grant admin access to other users:

```javascript
// Example: Grant admin access to another user
const response = await fetch('/api/admin/set-claims', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: await user.getIdToken(), // Your admin token
    targetUid: 'target-user-uid',     // UID of user to make admin
    isAdmin: true                     // true to grant, false to revoke
  }),
});
```

### Admin Check Functions

The application provides several admin check functions:

- `isAdminAsync(user)` - Checks custom claims (recommended)
- `isAdmin(user)` - Fallback that checks email (deprecated)
- `makeUserAdmin(user)` - Bootstrap function for initial setup

### Security Features

1. **Domain Restriction**: Only `@kyanhealth.com` users can access the application
2. **Custom Claims**: Admin status is stored in Firebase custom claims, not client-side
3. **API Security**: Admin APIs verify tokens server-side
4. **Firestore Rules**: Database rules enforce access control at the data level
5. **Immutable Surveys**: Survey responses cannot be modified or deleted once submitted

### Troubleshooting

1. **"Unauthorized" errors**: Ensure your service account key is correctly configured
2. **Rules not applying**: Make sure you've deployed the Firestore rules
3. **Admin button not showing**: Check that custom claims have been set and the user has refreshed their token
4. **Bootstrap not working**: Verify the user email matches exactly `ignacio@kyanhealth.com`

### Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. Ensure service account has proper permissions
4. Test admin access thoroughly before launch

## API Endpoints

- `POST /api/admin/make-me-admin` - Bootstrap admin access (ignacio@kyanhealth.com only)
- `POST /api/admin/set-claims` - Set admin claims for other users (admins only)

Both endpoints require valid Firebase ID tokens and perform server-side verification.