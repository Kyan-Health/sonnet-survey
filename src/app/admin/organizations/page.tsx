'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminAsync } from '@/lib/admin';
import { Organization } from '@/types/organization';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  toggleOrganizationStatus,
  deleteOrganization
} from '@/lib/organizationService';
import DemographicManagementModal from '@/components/DemographicManagementModal';
import SurveyQuestionSelector from '@/components/SurveyQuestionSelector';
import SurveyTypeSelector from '@/components/SurveyTypeSelector';

export default function OrganizationsManagementPage() {
  const { user, loading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemographicsModal, setShowDemographicsModal] = useState(false);
  const [selectedOrgForDemographics, setSelectedOrgForDemographics] = useState<Organization | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedOrgForQuestions, setSelectedOrgForQuestions] = useState<Organization | null>(null);
  const [showSurveyTypesModal, setShowSurveyTypesModal] = useState(false);
  const [selectedOrgForSurveyTypes, setSelectedOrgForSurveyTypes] = useState<Organization | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    displayName: '',
    primaryColor: '#3B82F6',
    customBranding: false,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const adminStatus = await isAdminAsync(user);
          setIsUserAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const loadOrganizations = async () => {
      if (user && isUserAdmin) {
        try {
          const orgs = await getAllOrganizations();
          setOrganizations(orgs);
        } catch (error) {
          console.error('Error loading organizations:', error);
          setError('Failed to load organizations');
        } finally {
          setIsLoadingOrgs(false);
        }
      }
    };

    loadOrganizations();
  }, [user, isUserAdmin]);

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      displayName: '',
      primaryColor: '#3B82F6',
      customBranding: false,
    });
    setEditingOrg(null);
    setShowCreateForm(false);
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createOrganization({
        name: formData.name,
        domain: formData.domain.toLowerCase(),
        displayName: formData.displayName,
        settings: {
          primaryColor: formData.primaryColor,
          customBranding: formData.customBranding,
        },
        isActive: true,
      }, user.uid);

      // Reload organizations
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
      resetForm();
      alert('Organization created successfully!');
    } catch (error) {
      console.error('Error creating organization:', error);
      alert(error instanceof Error ? error.message : 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingOrg) return;

    setIsSubmitting(true);
    try {
      await updateOrganization(editingOrg.id, {
        name: formData.name,
        domain: formData.domain.toLowerCase(),
        displayName: formData.displayName,
        settings: {
          primaryColor: formData.primaryColor,
          customBranding: formData.customBranding,
        },
      });

      // Reload organizations
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
      resetForm();
      alert('Organization updated successfully!');
    } catch (error) {
      console.error('Error updating organization:', error);
      alert(error instanceof Error ? error.message : 'Failed to update organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (orgId: string) => {
    try {
      await toggleOrganizationStatus(orgId);
      // Reload organizations
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error toggling organization status:', error);
      alert(error instanceof Error ? error.message : 'Failed to toggle organization status');
    }
  };

  const handleDelete = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteOrganization(orgId);
      // Reload organizations
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
      alert('Organization deleted successfully!');
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete organization');
    }
  };

  const startEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      domain: org.domain,
      displayName: org.displayName,
      primaryColor: org.settings.primaryColor || '#3B82F6',
      customBranding: org.settings.customBranding || false,
    });
    setShowCreateForm(true);
  };

  const openDemographicsModal = (org: Organization) => {
    setSelectedOrgForDemographics(org);
    setShowDemographicsModal(true);
  };

  const closeDemographicsModal = () => {
    setShowDemographicsModal(false);
    setSelectedOrgForDemographics(null);
  };

  const handleDemographicsSave = (updatedOrg: Organization) => {
    // Update the organization in the local state
    setOrganizations(prevOrgs => 
      prevOrgs.map(org => org.id === updatedOrg.id ? updatedOrg : org)
    );
  };

  const openQuestionsModal = (org: Organization) => {
    setSelectedOrgForQuestions(org);
    setShowQuestionsModal(true);
  };

  const closeQuestionsModal = () => {
    setShowQuestionsModal(false);
    setSelectedOrgForQuestions(null);
  };

  const handleQuestionsSave = (updatedOrg: Organization) => {
    // Update the organization in the local state
    setOrganizations(prevOrgs => 
      prevOrgs.map(org => org.id === updatedOrg.id ? updatedOrg : org)
    );
  };

  const openSurveyTypesModal = (org: Organization) => {
    setSelectedOrgForSurveyTypes(org);
    setShowSurveyTypesModal(true);
  };

  const closeSurveyTypesModal = () => {
    setShowSurveyTypesModal(false);
    setSelectedOrgForSurveyTypes(null);
  };

  const handleSurveyTypesSave = (updatedOrg: Organization) => {
    // Update the organization in the local state
    setOrganizations(prevOrgs => 
      prevOrgs.map(org => org.id === updatedOrg.id ? updatedOrg : org)
    );
  };

  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access admin features.</p>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center bg-white rounded-lg shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto">
          <div className="text-red-600 text-5xl sm:text-6xl mb-4">⛔</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">You don&apos;t have permission to access admin features.</p>
          <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm sm:text-base touch-manipulation w-full sm:w-auto">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Organization Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage organizations and their domains</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base touch-manipulation"
              >
                Add Organization
              </button>
              <Link
                href="/admin"
                className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-center text-sm sm:text-base touch-manipulation"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              {editingOrg ? 'Edit Organization' : 'Create New Organization'}
            </h2>
            <form onSubmit={editingOrg ? handleUpdateOrganization : handleCreateOrganization}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Kyan Health"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., kyanhealth.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Kyan Health"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.customBranding}
                    onChange={(e) => setFormData({ ...formData, customBranding: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enable custom branding</span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded touch-manipulation"
                >
                  {isSubmitting ? 'Saving...' : (editingOrg ? 'Update' : 'Create')} Organization
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold py-2 px-4 rounded touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Organizations List */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Organizations</h2>
          
          {isLoadingOrgs ? (
            <div className="text-center py-8">
              <div className="text-base sm:text-lg">Loading organizations...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600">{error}</div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {organizations.map((org) => (
                  <div key={org.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: org.settings.primaryColor || '#3B82F6' }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{org.displayName}</div>
                        <div className="text-xs text-gray-500">{org.name}</div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        org.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-3">
                      <div>Domain: {org.domain}</div>
                      <div>Created: {org.createdAt.toLocaleDateString()}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => startEdit(org)}
                        className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs touch-manipulation"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDemographicsModal(org)}
                        className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs touch-manipulation"
                      >
                        Demographics
                      </button>
                      <button
                        onClick={() => openSurveyTypesModal(org)}
                        className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs touch-manipulation"
                      >
                        Survey Types
                      </button>
                      <button
                        onClick={() => openQuestionsModal(org)}
                        className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold py-1 px-2 rounded text-xs touch-manipulation"
                      >
                        Questions
                      </button>
                      <button
                        onClick={() => handleToggleStatus(org.id)}
                        className={`font-bold py-1 px-2 rounded text-xs touch-manipulation ${
                          org.isActive
                            ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white'
                        }`}
                      >
                        {org.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {org.createdBy !== 'system' && (
                        <button
                          onClick={() => handleDelete(org.id, org.name)}
                          className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs touch-manipulation"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: org.settings.primaryColor || '#3B82F6' }}
                          ></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{org.displayName}</div>
                            <div className="text-sm text-gray-500">{org.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.domain}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          org.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {org.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {org.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
                        <button
                          onClick={() => startEdit(org)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDemographicsModal(org)}
                          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Demographics
                        </button>
                        <button
                          onClick={() => openSurveyTypesModal(org)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Survey Types
                        </button>
                        <button
                          onClick={() => openQuestionsModal(org)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Questions
                        </button>
                        <button
                          onClick={() => handleToggleStatus(org.id)}
                          className={`font-bold py-1 px-2 rounded text-xs ${
                            org.isActive
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {org.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {org.createdBy !== 'system' && (
                          <button
                            onClick={() => handleDelete(org.id, org.name)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {organizations.length === 0 && !isLoadingOrgs && !error && (
            <div className="text-center py-8">
              <p className="text-gray-500">No organizations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Demographics Management Modal */}
      {selectedOrgForDemographics && (
        <DemographicManagementModal
          organization={selectedOrgForDemographics}
          isOpen={showDemographicsModal}
          onClose={closeDemographicsModal}
          onSave={handleDemographicsSave}
        />
      )}

      {/* Survey Types Management Modal */}
      {selectedOrgForSurveyTypes && (
        <SurveyTypeSelector
          organization={selectedOrgForSurveyTypes}
          isOpen={showSurveyTypesModal}
          onClose={closeSurveyTypesModal}
          onSave={handleSurveyTypesSave}
        />
      )}

      {/* Survey Questions Management Modal */}
      {selectedOrgForQuestions && (
        <SurveyQuestionSelector
          organization={selectedOrgForQuestions}
          isOpen={showQuestionsModal}
          onClose={closeQuestionsModal}
          onSave={handleQuestionsSave}
        />
      )}
    </div>
  );
}