# Admin Setup and Firestore Security Rules

## Overview
This document outlines the security setup for the Sonnet Survey Multi-Survey Platform, including Firestore security rules, Firebase Authentication custom claims for admin access, and the new multi-survey system configuration.

## Firestore Security Rules

The application uses the following security model with support for multiple survey types and organizations:

### Security Rules (`firestore.rules`)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticatedUser() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    function isSameOrganization() {
      return request.auth != null && 
             request.auth.token.organizationId == resource.data.organizationId;
    }
    
    // Organizations - read for authenticated users, write for admins
    match /organizations/{orgId} {
      allow read: if isAuthenticatedUser();
      allow write: if isAdmin();
    }
    
    // Survey types - read for authenticated users, write for admins only
    match /surveyTypes/{surveyTypeId} {
      allow read: if isAuthenticatedUser();
      allow write: if isAdmin();
    }
    
    // Survey responses - users can create own, admins can read all
    match /surveys/{surveyId} {
      allow create: if isAuthenticatedUser() && isOwner(resource.data.userId);
      allow read: if isAdmin() || isSameOrganization();
      allow update, delete: if false; // Immutable responses
    }
    
    // User survey status - users manage own, admins read all
    match /userSurveyStatus/{userId} {
      allow read, write: if isAuthenticatedUser() && isOwner(userId);
      allow read: if isAdmin();
      allow delete: if false;
    }
    
    // Users collection - read own profile, admins read all
    match /users/{userId} {
      allow read, write: if isAuthenticatedUser() && isOwner(userId);
      allow read, write: if isAdmin();
    }
    
    // Admin-only analytics collections
    match /analytics/{document=**} {
      allow read, write: if isAdmin();
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

4. **Deploy the rules and indexes**:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
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

Once you have admin access, you can use the admin interface to grant admin access to other users:

1. **Via Admin Interface** (Recommended):
   - Go to `/admin/users`
   - Find the user by email
   - Click "Grant Admin Access"

2. **Via API** (Advanced):
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

## Multi-Survey System Setup

### Survey Types Configuration

1. **Initialize System Survey Types**:
   - Navigate to `/admin/survey-types`
   - Click "Sync System Defaults" to initialize:
     - Employee Engagement Survey (73 questions across 15 factors)
     - MBI Burnout Assessment (22 questions across 3 factors)
     - COPSOC Workplace Factors (40+ questions across 8 factors)
     - COPSOC II Short (36 questions across 19 psychosocial risk factors)

2. **Configure Organizations**:
   - Go to `/admin/organizations`
   - For each organization, click "Survey Types"
   - Select which survey types are available
   - Set a default survey type

### Organization Management

1. **Create Organizations**:
   ```json
   {
     "name": "organization-slug",
     "displayName": "Organization Display Name",
     "domain": "organization.com",
     "availableSurveyTypes": ["employee-engagement", "mbi-burnout"],
     "defaultSurveyType": "employee-engagement",
     "isActive": true
   }
   ```

2. **Configure Demographics**:
   - Use the "Demographics" button to customize demographic questions
   - Add organization-specific fields as needed

### Database Collections

The multi-survey system uses these Firestore collections:

- **organizations**: Organization configuration and survey type assignments
- **surveyTypes**: Survey type definitions with questions and metadata
- **surveys**: Individual survey responses with surveyTypeId
- **users**: User profiles and organization assignments

### Admin Check Functions

The application provides several admin check functions:

- `isAdminAsync(user)` - Checks custom claims (recommended)
- `isAdmin(user)` - Fallback that checks email (deprecated)
- `makeUserAdmin(user)` - Bootstrap function for initial setup

### Security Features

1. **Organization-based Access**: Domain restrictions configured per organization
2. **Custom Claims**: Admin status is stored in Firebase custom claims, not client-side
3. **Survey Type Security**: Only admins can create/modify survey types
4. **API Security**: All admin APIs verify tokens server-side
5. **Firestore Rules**: Database rules enforce access control at the data level
6. **Immutable Surveys**: Survey responses cannot be modified or deleted once submitted
7. **Organization Isolation**: Users can only see data from their organization
8. **Survey Type Access Control**: Organizations control which surveys are available

### Troubleshooting

1. **"Unauthorized" errors**: Ensure your service account key is correctly configured
2. **Rules not applying**: Make sure you've deployed the Firestore rules and indexes
3. **Admin button not showing**: Check that custom claims have been set and the user has refreshed their token
4. **Bootstrap not working**: Verify the user email matches exactly `ignacio@kyanhealth.com`
5. **Survey types not loading**: Check that system defaults have been created via `/admin/survey-types`
6. **Organization surveys not working**: Verify the organization has survey types configured
7. **Mobile layout issues**: Clear browser cache and test on actual mobile devices

### Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Deploy Firestore rules and indexes: `firebase deploy --only firestore:rules,firestore:indexes`
3. Deploy hosting: `firebase deploy --only hosting`
4. Ensure service account has proper permissions
5. Initialize system survey types via admin interface
6. Configure organizations and their available survey types
7. Test admin access and multi-survey functionality thoroughly
8. Verify mobile responsiveness on actual devices

## API Endpoints

- `POST /api/admin/make-me-admin` - Bootstrap admin access (ignacio@kyanhealth.com only)
- `POST /api/admin/set-claims` - Set admin claims for other users (admins only)

Both endpoints require valid Firebase ID tokens and perform server-side verification.

## Mobile Considerations

The platform is fully mobile-responsive with:
- Touch-friendly button sizing (minimum 44px)
- Responsive navigation and layouts
- Mobile-optimized survey interface
- Card-based layouts for mobile table alternatives

Test thoroughly on:
- Mobile phones (375px - 414px width)
- Tablets (768px width)
- Desktop browsers (1024px+ width)