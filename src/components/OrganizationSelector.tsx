'use client';

import { useOrganization } from '@/contexts/OrganizationContext';

interface OrganizationSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export default function OrganizationSelector({ 
  className = '', 
  showLabel = true 
}: OrganizationSelectorProps) {
  const { 
    selectedOrganization, 
    availableOrganizations, 
    setSelectedOrganization,
    isAdmin,
    isLoading 
  } = useOrganization();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!isAdmin || availableOrganizations.length <= 1) {
    // Non-admins or single organization - show current org as text
    return (
      <div className={className}>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization
          </label>
        )}
        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: selectedOrganization?.settings.primaryColor || '#3B82F6' }}
          ></div>
          <span className="text-sm font-medium text-gray-900">
            {selectedOrganization?.displayName || 'Unknown Organization'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showLabel && (
        <label htmlFor="organization-select" className="block text-sm font-medium text-gray-700 mb-1">
          Organization
        </label>
      )}
      <select
        id="organization-select"
        value={selectedOrganization?.id || ''}
        onChange={(e) => {
          const orgId = e.target.value;
          const org = availableOrganizations.find(o => o.id === orgId) || null;
          setSelectedOrganization(org);
        }}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Organizations</option>
        {availableOrganizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.displayName}
          </option>
        ))}
      </select>
      
      {selectedOrganization && (
        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: selectedOrganization.settings.primaryColor || '#3B82F6' }}
          ></div>
          <span>Domain: {selectedOrganization.domain}</span>
        </div>
      )}
    </div>
  );
}