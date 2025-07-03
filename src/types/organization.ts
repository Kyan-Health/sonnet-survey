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
  updatedAt: Date;
  isActive: boolean;
  createdBy: string; // UID of admin who created it
}

export interface OrganizationUser {
  uid: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'user';
  joinedAt: Date;
}

// For backward compatibility during migration
export const DEFAULT_ORGANIZATIONS: Organization[] = [
  {
    id: 'kyan-health',
    name: 'Kyan Health',
    domain: 'kyanhealth.com',
    displayName: 'Kyan Health',
    settings: {
      primaryColor: '#3B82F6',
      customBranding: true,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    createdBy: 'system'
  }
];