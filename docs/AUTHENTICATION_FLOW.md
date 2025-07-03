# Authentication & Authorization Documentation

## Overview
The Sonnet Survey application uses Firebase Authentication with Google OAuth, enhanced with custom claims for role-based access control and organization-based user validation.

## Authentication Architecture

```
User Login → Google OAuth → Firebase Auth → Organization Validation → Custom Claims → Application Access
```

## Authentication Flow

### 1. Initial Login Process

```typescript
// Login Flow Diagram
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Clicks   │    │   Google OAuth  │    │ Firebase Checks │
│  "Sign In"      │───▶│   Popup/Redirect│───▶│   Auth Token    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌───────▼─────────┐
│ Application     │    │ Organization    │    │   Verify Email  │
│ Access Granted  │◀───│   Validation    │◀───│   Domain        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. Implementation Details

#### Login Component
```typescript
// components/LoginButton.tsx
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const LoginButton: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      // Handle specific error cases
      if (error.code === 'auth/popup-blocked') {
        // Show popup blocked message
      } else if (error.code === 'auth/unauthorized-domain') {
        // Show domain not authorized message
      }
    }
  };

  return (
    <button onClick={handleLogin} className="login-button">
      Sign in with Google
    </button>
  );
};
```

#### Auth Context Implementation
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Validate user organization
        const organization = await getOrganizationFromEmail(firebaseUser.email!);
        
        if (organization) {
          setUser(firebaseUser);
        } else {
          // User not from valid organization - sign out
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: '', // Allow any domain, validate server-side
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      // Additional validation happens in onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Organization Validation

### 1. Email Domain Validation
```typescript
// lib/organizationService.ts
export async function getOrganizationFromEmail(email: string): Promise<Organization | null> {
  const domain = email.split('@')[1];
  if (!domain) return null;
  
  return await getOrganizationByDomain(domain);
}

export async function getOrganizationByDomain(domain: string): Promise<Organization | null> {
  try {
    const organizationsRef = collection(db, 'organizations');
    const q = query(
      organizationsRef, 
      where('domain', '==', domain),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null; // Domain not authorized
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Organization;
  } catch (error) {
    console.error('Error validating organization:', error);
    return null;
  }
}
```

### 2. Organization Context
```typescript
// contexts/OrganizationContext.tsx
interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
}

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserOrganization = async () => {
      if (user?.email) {
        const org = await getOrganizationFromEmail(user.email);
        setCurrentOrganization(org);
      } else {
        setCurrentOrganization(null);
      }
      setLoading(false);
    };

    loadUserOrganization();
  }, [user]);

  return (
    <OrganizationContext.Provider value={{ currentOrganization, organizations, loading, refreshOrganizations }}>
      {children}
    </OrganizationContext.Provider>
  );
};
```

## Authorization System

### 1. Custom Claims Structure
```typescript
// Firebase Custom Claims
interface CustomClaims {
  admin?: boolean;           // Global admin access
  organizationId?: string;   // User's organization
  roles?: string[];          // Future: granular roles
}

// Example user claims
{
  "admin": true,
  "organizationId": "kyan-health",
  "roles": ["survey_admin", "user_manager"]
}
```

### 2. Admin Check Implementation
```typescript
// lib/admin.ts
export async function isAdminAsync(user: User): Promise<boolean> {
  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Client-side admin check hook
export const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdminAsync(user);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
```

### 3. Server-side Token Verification
```typescript
// lib/firebaseAdmin.ts
import admin from 'firebase-admin';

export async function verifyAndGetUser(authToken: string): Promise<admin.auth.DecodedIdToken> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

// API route example
// api/admin/set-claims/route.ts
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAndGetUser(token);

    // Check if user is admin
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Verify user organization
    const organization = await getOrganizationFromEmail(decodedToken.email!);
    if (!organization) {
      return NextResponse.json({ error: 'Invalid organization' }, { status: 403 });
    }

    // Process admin operation...
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
```

## Permission Levels

### 1. User Permissions
```typescript
interface UserPermissions {
  // Basic user permissions
  canTakeSurvey: boolean;        // Can submit survey responses
  canViewOwnData: boolean;       // Can view own survey status
  
  // Organization-specific permissions
  organizationId: string;        // User's organization
  canViewOrgSurveys: boolean;    // Can view organization surveys
}

// Permission check utility
export const checkUserPermissions = (user: User, organization: Organization): UserPermissions => {
  return {
    canTakeSurvey: true,
    canViewOwnData: true,
    organizationId: organization.id,
    canViewOrgSurveys: false // Regular users cannot view all org surveys
  };
};
```

### 2. Admin Permissions
```typescript
interface AdminPermissions extends UserPermissions {
  // Admin-specific permissions
  canManageUsers: boolean;          // Can grant/revoke admin access
  canViewAnalytics: boolean;        // Can view survey analytics
  canManageOrganizations: boolean;  // Can create/edit organizations
  canViewAllSurveys: boolean;       // Can view all survey responses
  canExportData: boolean;           // Can export survey data
  canManageDemographics: boolean;   // Can configure demographic questions
}

export const checkAdminPermissions = (user: User, isAdmin: boolean): AdminPermissions => {
  const basePermissions = checkUserPermissions(user, organization);
  
  return {
    ...basePermissions,
    canManageUsers: isAdmin,
    canViewAnalytics: isAdmin,
    canManageOrganizations: isAdmin,
    canViewAllSurveys: isAdmin,
    canExportData: isAdmin,
    canManageDemographics: isAdmin
  };
};
```

### 3. Route Protection
```typescript
// Higher-order component for admin routes
export const withAdminAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { user, loading } = useAuth();
    const { isAdmin, loading: adminLoading } = useAdminCheck();

    if (loading || adminLoading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      return <LoginRequired />;
    }

    if (!isAdmin) {
      return <AccessDenied />;
    }

    return <WrappedComponent {...props} />;
  };
};

// Usage in admin pages
const AdminDashboard = withAdminAuth(() => {
  return <div>Admin Dashboard Content</div>;
});
```

## Security Patterns

### 1. Token Refresh Handling
```typescript
// Automatic token refresh
export const useTokenRefresh = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const refreshToken = async () => {
      try {
        // Force token refresh every 45 minutes
        await user.getIdToken(true);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Handle refresh failure (e.g., redirect to login)
      }
    };

    const interval = setInterval(refreshToken, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);
};
```

### 2. Session Management
```typescript
// Session timeout handling
export const useSessionTimeout = () => {
  const { logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-logout after 2 hours of inactivity
    timeoutRef.current = setTimeout(() => {
      logout();
    }, 2 * 60 * 60 * 1000);
  }, [logout]);

  useEffect(() => {
    // Reset timeout on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout(); // Initial timeout

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout]);
};
```

### 3. Security Headers and CORS
```typescript
// next.config.js security configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Firestore Security Rules

### 1. User Data Access Rules
```javascript
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null && request.auth.token.email != null;
    }
    
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    function belongsToValidOrganization() {
      // This would need to be implemented with organization validation
      return request.auth != null && request.auth.token.email != null;
    }
    
    // Survey responses
    match /surveys/{surveyId} {
      allow create: if isAuthenticated() && 
                       isOwner(request.resource.data.userId) &&
                       belongsToValidOrganization();
      allow read: if isAdmin();
      allow update, delete: if false; // Surveys are immutable
    }
    
    // User survey status
    match /userSurveyStatus/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
      allow read: if isAdmin();
    }
    
    // Organizations
    match /organizations/{organizationId} {
      allow read: if true; // Public read for domain validation
      allow write: if isAdmin();
    }
  }
}
```

## Error Handling

### 1. Authentication Errors
```typescript
export enum AuthErrorCode {
  POPUP_BLOCKED = 'auth/popup-blocked',
  POPUP_CLOSED = 'auth/popup-closed-by-user',
  UNAUTHORIZED_DOMAIN = 'auth/unauthorized-domain',
  INVALID_EMAIL = 'auth/invalid-email',
  USER_DISABLED = 'auth/user-disabled',
  TOKEN_EXPIRED = 'auth/id-token-expired',
  INVALID_ORGANIZATION = 'auth/invalid-organization'
}

export const handleAuthError = (error: any): string => {
  switch (error.code) {
    case AuthErrorCode.POPUP_BLOCKED:
      return 'Please allow popups for this site to sign in.';
    case AuthErrorCode.POPUP_CLOSED:
      return 'Sign-in was cancelled. Please try again.';
    case AuthErrorCode.UNAUTHORIZED_DOMAIN:
      return 'Your email domain is not authorized for this application.';
    case AuthErrorCode.INVALID_EMAIL:
      return 'Please use a valid email address.';
    case AuthErrorCode.USER_DISABLED:
      return 'This account has been disabled. Please contact support.';
    case AuthErrorCode.TOKEN_EXPIRED:
      return 'Your session has expired. Please sign in again.';
    case AuthErrorCode.INVALID_ORGANIZATION:
      return 'Your organization is not authorized for this application.';
    default:
      return 'An error occurred during sign-in. Please try again.';
  }
};
```

### 2. Permission Errors
```typescript
export const PermissionError = {
  ADMIN_REQUIRED: 'Administrator privileges required',
  INVALID_ORGANIZATION: 'Invalid organization access',
  SURVEY_ALREADY_COMPLETED: 'Survey has already been completed',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action'
};

export const handlePermissionError = (error: string, redirectPath?: string) => {
  console.error('Permission error:', error);
  
  if (redirectPath) {
    // Redirect to appropriate page
    window.location.href = redirectPath;
  }
  
  // Show user-friendly error message
  return error;
};
```