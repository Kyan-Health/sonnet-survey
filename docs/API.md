# API Documentation

## Overview
The Sonnet Survey application uses a combination of Next.js API routes and Firebase Cloud Functions for backend operations.

## Authentication
All API endpoints require Firebase Authentication tokens. Include the token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## API Endpoints

### Admin API Routes

#### POST /api/admin/set-claims
Sets or removes admin claims for users.

**Authentication**: Requires admin privileges
**Content-Type**: application/json

**Request Body**:
```typescript
{
  targetUid: string;      // Firebase UID of target user
  isAdmin: boolean;       // true to grant admin, false to revoke
}
```

**Response**:
```typescript
// Success (200)
{
  success: true;
  message: string;
}

// Error (400/403/500)
{
  error: string;
}
```

**Error Codes**:
- `400`: Missing required fields or invalid request
- `403`: Unauthorized (not admin or invalid organization)
- `500`: Server error during claim setting

### Firebase Cloud Functions

Base URL: `https://europe-west1-survey-sonnet.cloudfunctions.net`

#### POST /listUsers
Lists all users from valid organization domains.

**Authentication**: Requires admin privileges
**Headers**: 
```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

**Response**:
```typescript
{
  users: Array<{
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    disabled: boolean;
    metadata: {
      creationTime: string;
      lastSignInTime?: string;
    };
    customClaims?: {
      admin?: boolean;
    };
    emailVerified: boolean;
  }>
}
```

#### POST /setAdminClaims
Sets admin claims via Cloud Function (alternative to API route).

**Request/Response**: Same as `/api/admin/set-claims`

## Error Handling Patterns

### Standard Error Response
```typescript
{
  error: string;          // Human-readable error message
  code?: string;          // Error code for programmatic handling
  details?: any;          // Additional error context
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication token missing or invalid
- `ADMIN_REQUIRED`: Admin privileges required
- `INVALID_ORGANIZATION`: User not from valid organization domain
- `USER_NOT_FOUND`: Target user does not exist
- `RATE_LIMITED`: Too many requests

## Rate Limiting
- Cloud Functions: 1000 requests per minute per user
- API Routes: No explicit rate limiting (handled by Vercel/Next.js)

## CORS Configuration
- Admin endpoints: Restricted to application domain
- Public endpoints: Allow all origins for authentication