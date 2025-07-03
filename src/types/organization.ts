export interface Organization {
  id: string;
  name: string;
  domain: string;
  displayName: string;
  settings: {
    primaryColor?: string;
    logo?: string;
    customBranding?: boolean;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface OrganizationUser {
  uid: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'user';
  joinedAt: Date;
}

// Domain to Organization mapping
export const ORGANIZATION_DOMAINS: Record<string, string> = {
  'kyanhealth.com': 'kyan-health',
  'example.com': 'example-org',
  // Add more domains as needed
};

export const ORGANIZATIONS: Record<string, Organization> = {
  'kyan-health': {
    id: 'kyan-health',
    name: 'Kyan Health',
    domain: 'kyanhealth.com',
    displayName: 'Kyan Health',
    settings: {
      primaryColor: '#3B82F6',
      customBranding: true,
    },
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  'example-org': {
    id: 'example-org',
    name: 'Example Organization',
    domain: 'example.com',
    displayName: 'Example Corp',
    settings: {
      primaryColor: '#10B981',
      customBranding: false,
    },
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
};

export function getOrganizationFromEmail(email: string): Organization | null {
  const domain = email.split('@')[1];
  const orgId = ORGANIZATION_DOMAINS[domain];
  return orgId ? ORGANIZATIONS[orgId] : null;
}

export function getAllActiveOrganizations(): Organization[] {
  return Object.values(ORGANIZATIONS).filter(org => org.isActive);
}