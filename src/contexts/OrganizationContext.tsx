'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Organization, getOrganizationFromEmail, getAllActiveOrganizations } from '@/types/organization';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  selectedOrganization: Organization | null;
  availableOrganizations: Organization[];
  setSelectedOrganization: (org: Organization | null) => void;
  isLoading: boolean;
  isAdmin: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initializeOrganizations = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        // Get user's organization from email domain
        const userOrg = getOrganizationFromEmail(user.email);
        setCurrentOrganization(userOrg);

        // Check if user is admin
        const idTokenResult = await user.getIdTokenResult();
        const isUserAdmin = idTokenResult.claims.admin === true;
        setIsAdmin(isUserAdmin);

        // If admin, show all organizations; otherwise just user's org
        if (isUserAdmin) {
          const allOrgs = getAllActiveOrganizations();
          setAvailableOrganizations(allOrgs);
          // Default to user's org if available, otherwise first org
          setSelectedOrganization(userOrg || allOrgs[0] || null);
        } else {
          setAvailableOrganizations(userOrg ? [userOrg] : []);
          setSelectedOrganization(userOrg);
        }
      } catch (error) {
        console.error('Error initializing organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrganizations();
  }, [user]);

  const handleSetSelectedOrganization = (org: Organization | null) => {
    setSelectedOrganization(org);
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        selectedOrganization,
        availableOrganizations,
        setSelectedOrganization: handleSetSelectedOrganization,
        isLoading,
        isAdmin,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}