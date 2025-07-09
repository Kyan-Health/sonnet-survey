'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Organization, SurveyLink } from '@/types/organization';
import { SurveyType } from '@/types/surveyType';
import { 
  createSurveyLink, 
  getSurveyLinks, 
  updateSurveyLink, 
  deleteSurveyLink, 
  toggleSurveyLinkStatus,
  getSurveyLinkStats
} from '@/lib/surveyLinkService';
import { getAllSurveyTypes } from '@/lib/surveyTypeService';

interface SurveyLinkManagerProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
}

interface LinkStats {
  [linkId: string]: {
    totalResponses: number;
    responseRate: number;
    isActive: boolean;
    daysRemaining?: number;
  };
}

export default function SurveyLinkManager({ organization, isOpen, onClose }: SurveyLinkManagerProps) {
  const { user } = useAuth();
  const [surveyLinks, setSurveyLinks] = useState<SurveyLink[]>([]);
  const [surveyTypes, setSurveyTypes] = useState<SurveyType[]>([]);
  const [linkStats, setLinkStats] = useState<LinkStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLink, setEditingLink] = useState<SurveyLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    surveyTypeId: '',
    expiresAt: '',
    maxResponses: '',
    allowMultipleResponses: false,
    requireDemographics: true
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, organization.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [links, types] = await Promise.all([
        getSurveyLinks(organization.id),
        getAllSurveyTypes()
      ]);
      
      // Filter survey types to only those available to the organization
      const availableTypes = organization.availableSurveyTypes && organization.availableSurveyTypes.length > 0
        ? types.filter(type => organization.availableSurveyTypes!.includes(type.id))
        : types;
      
      setSurveyLinks(links);
      setSurveyTypes(availableTypes);
      
      // Load stats for each link
      const stats: LinkStats = {};
      for (const link of links) {
        try {
          stats[link.id] = await getSurveyLinkStats(link.id);
        } catch (error) {
          console.error(`Error loading stats for link ${link.id}:`, error);
        }
      }
      setLinkStats(stats);
    } catch (error) {
      console.error('Error loading survey links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      surveyTypeId: '',
      expiresAt: '',
      maxResponses: '',
      allowMultipleResponses: false,
      requireDemographics: true
    });
    setEditingLink(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (editingLink) {
        // Update existing link
        await updateSurveyLink(editingLink.id, {
          name: formData.name,
          description: formData.description ? formData.description : undefined,
          surveyTypeId: formData.surveyTypeId,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
          maxResponses: formData.maxResponses ? parseInt(formData.maxResponses) : undefined,
          allowMultipleResponses: formData.allowMultipleResponses,
          requireDemographics: formData.requireDemographics
        });
      } else {
        // Create new link
        await createSurveyLink(
          organization.id,
          formData.surveyTypeId,
          formData.name,
          user.uid,
          {
            description: formData.description ? formData.description : undefined,
            expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
            maxResponses: formData.maxResponses ? parseInt(formData.maxResponses) : undefined,
            allowMultipleResponses: formData.allowMultipleResponses,
            requireDemographics: formData.requireDemographics
          }
        );
      }
      
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving survey link:', error);
      alert('Error saving survey link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (link: SurveyLink) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      description: link.description || '',
      surveyTypeId: link.surveyTypeId,
      expiresAt: link.expiresAt ? link.expiresAt.toISOString().split('T')[0] : '',
      maxResponses: link.maxResponses?.toString() || '',
      allowMultipleResponses: link.allowMultipleResponses || false,
      requireDemographics: link.requireDemographics ?? true
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (linkId: string, linkName: string) => {
    if (!confirm(`Are you sure you want to delete "${linkName}"?`)) {
      return;
    }

    try {
      await deleteSurveyLink(linkId);
      loadData();
    } catch (error) {
      console.error('Error deleting survey link:', error);
      alert('Error deleting survey link');
    }
  };

  const handleToggleStatus = async (linkId: string) => {
    try {
      await toggleSurveyLinkStatus(linkId);
      loadData();
    } catch (error) {
      console.error('Error toggling survey link status:', error);
      alert('Error updating survey link status');
    }
  };

  const copyLinkToClipboard = (token: string) => {
    const url = `${window.location.origin}/survey/anonymous?token=${token}`;
    navigator.clipboard.writeText(url);
    alert('Survey link copied to clipboard!');
  };

  const getSurveyTypeName = (surveyTypeId: string) => {
    const type = surveyTypes.find(t => t.id === surveyTypeId);
    return type?.metadata.displayName || 'Unknown Survey Type';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Survey Links - {organization.displayName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Create Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Create New Survey Link
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingLink ? 'Edit Survey Link' : 'Create New Survey Link'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Q1 2024 Engagement Survey"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Survey Type *
                    </label>
                    <select
                      required
                      value={formData.surveyTypeId}
                      onChange={(e) => setFormData({ ...formData, surveyTypeId: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Survey Type</option>
                      {surveyTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.metadata.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expires On
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Responses
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxResponses}
                      onChange={(e) => setFormData({ ...formData, maxResponses: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional description for internal use"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowMultipleResponses}
                      onChange={(e) => setFormData({ ...formData, allowMultipleResponses: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Allow multiple responses from same user</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requireDemographics}
                      onChange={(e) => setFormData({ ...formData, requireDemographics: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Require demographic questions</span>
                  </label>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
                  >
                    {isSubmitting ? 'Saving...' : (editingLink ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Survey Links List */}
          {isLoading ? (
            <div className="text-center py-8">Loading survey links...</div>
          ) : (
            <div className="space-y-4">
              {surveyLinks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No survey links created yet. Create your first survey link to get started.
                </div>
              ) : (
                surveyLinks.map(link => {
                  const stats = linkStats[link.id];
                  const isExpired = link.expiresAt && link.expiresAt < new Date();
                  const isMaxed = link.maxResponses && link.currentResponses >= link.maxResponses;
                  
                  return (
                    <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{link.name}</h4>
                          <p className="text-sm text-gray-600">{getSurveyTypeName(link.surveyTypeId)}</p>
                          {link.description && (
                            <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            !link.isActive ? 'bg-gray-100 text-gray-800' :
                            isExpired ? 'bg-red-100 text-red-800' :
                            isMaxed ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {!link.isActive ? 'Inactive' :
                             isExpired ? 'Expired' :
                             isMaxed ? 'Full' : 'Active'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Responses:</span>
                          <span className="ml-1 font-semibold">
                            {link.currentResponses}
                            {link.maxResponses && ` / ${link.maxResponses}`}
                          </span>
                        </div>
                        {link.expiresAt && (
                          <div>
                            <span className="text-gray-500">Expires:</span>
                            <span className="ml-1 font-semibold">
                              {link.expiresAt.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {stats?.daysRemaining !== undefined && (
                          <div>
                            <span className="text-gray-500">Days Left:</span>
                            <span className="ml-1 font-semibold">
                              {stats.daysRemaining > 0 ? stats.daysRemaining : 'Expired'}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-1 font-semibold">
                            {link.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Link URL */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <label className="text-sm text-gray-600 block mb-1">Survey Link:</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-sm bg-white p-2 rounded border">
                            {window.location.origin}/survey/anonymous?token={link.token}
                          </code>
                          <button
                            onClick={() => copyLinkToClipboard(link.token)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(link.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            link.isActive
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {link.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(link.id, link.name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}