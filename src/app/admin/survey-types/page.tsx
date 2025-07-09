'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminAsync } from '@/lib/admin';
import { 
  getAllSurveyTypes, 
  createSurveyType, 
  toggleSurveyTypeStatus,
  deleteSurveyType 
} from '@/lib/surveyTypeService';
import { SurveyType } from '@/types/surveyType';
import { SYSTEM_SURVEY_TYPES } from '@/data/surveyTypes';

export default function SurveyTypesManagementPage() {
  const { user, loading } = useAuth();
  const [surveyTypes, setSurveyTypes] = useState<SurveyType[]>([]);
  const [isLoadingSurveyTypes, setIsLoadingSurveyTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

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
    const loadSurveyTypes = async () => {
      if (user && isUserAdmin) {
        try {
          const types = await getAllSurveyTypes();
          setSurveyTypes(types);
        } catch (error) {
          console.error('Error loading survey types:', error);
          setError('Failed to load survey types');
        } finally {
          setIsLoadingSurveyTypes(false);
        }
      }
    };

    loadSurveyTypes();
  }, [user, isUserAdmin]);

  const handleCreateSystemDefaults = async () => {
    try {
      setIsLoadingSurveyTypes(true);
      
      const results: { success: string[]; failed: string[] } = { success: [], failed: [] };
      
      for (const surveyTypeConfig of SYSTEM_SURVEY_TYPES) {
        try {
          await createSurveyType(surveyTypeConfig, user!.uid);
          results.success.push(surveyTypeConfig.metadata.displayName);
          console.log(`Created survey type: ${surveyTypeConfig.metadata.displayName}`);
        } catch (error) {
          results.failed.push(surveyTypeConfig.metadata.displayName);
          console.error(`Error creating survey type ${surveyTypeConfig.id}:`, error);
        }
      }
      
      // Reload survey types
      const types = await getAllSurveyTypes();
      setSurveyTypes(types);
      
      // Show detailed results
      if (results.success.length > 0 && results.failed.length === 0) {
        alert(`All survey types created successfully!\n\nCreated: ${results.success.join(', ')}`);
      } else if (results.success.length > 0 && results.failed.length > 0) {
        alert(`Partially successful:\n\nCreated: ${results.success.join(', ')}\n\nFailed: ${results.failed.join(', ')}\n\nCheck console for details.`);
      } else if (results.failed.length > 0) {
        alert(`Failed to create survey types:\n${results.failed.join(', ')}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error('Error creating system defaults:', error);
      alert('Failed to create system survey types');
    } finally {
      setIsLoadingSurveyTypes(false);
    }
  };

  const handleToggleStatus = async (surveyTypeId: string) => {
    try {
      await toggleSurveyTypeStatus(surveyTypeId);
      // Reload survey types
      const types = await getAllSurveyTypes();
      setSurveyTypes(types);
    } catch (error) {
      console.error('Error toggling survey type status:', error);
      alert('Failed to toggle survey type status');
    }
  };

  const handleDelete = async (surveyTypeId: string, surveyTypeName: string) => {
    if (!confirm(`Are you sure you want to delete "${surveyTypeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSurveyType(surveyTypeId);
      // Reload survey types
      const types = await getAllSurveyTypes();
      setSurveyTypes(types);
      alert('Survey type deleted successfully!');
    } catch (error) {
      console.error('Error deleting survey type:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete survey type');
    }
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Survey Types Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage different survey types and their configurations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Always show sync button to handle new system defaults */}
              <button
                onClick={handleCreateSystemDefaults}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base touch-manipulation"
              >
                {surveyTypes.length === 0 ? 'Create System Defaults' : 'Sync System Defaults'}
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

        {/* Survey Types List */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Survey Types</h2>
          
          {isLoadingSurveyTypes ? (
            <div className="text-center py-8">
              <div className="text-base sm:text-lg">Loading survey types...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600">{error}</div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {surveyTypes.map((surveyType) => (
                  <div key={surveyType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {surveyType.metadata.displayName}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            surveyType.metadata.category === 'engagement' ? 'bg-blue-100 text-blue-800' :
                            surveyType.metadata.category === 'burnout' ? 'bg-red-100 text-red-800' :
                            surveyType.metadata.category === 'wellbeing' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {surveyType.metadata.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {surveyType.metadata.description}
                        </p>
                        {surveyType.metadata.researchBasis && (
                          <p className="text-xs text-blue-600 mb-2">
                            Based on: {surveyType.metadata.researchBasis}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                        surveyType.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {surveyType.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>{surveyType.questions.length} questions</span>
                      <span>{surveyType.factors.length} factors</span>
                      <span>{surveyType.createdAt.toLocaleDateString()}</span>
                      {surveyType.isSystemDefault && (
                        <span className="text-purple-600 font-medium">System Default</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleToggleStatus(surveyType.id)}
                        className={`font-bold py-1 px-2 rounded text-xs touch-manipulation ${
                          surveyType.isActive
                            ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white'
                        }`}
                      >
                        {surveyType.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {!surveyType.isSystemDefault && (
                        <button
                          onClick={() => handleDelete(surveyType.id, surveyType.metadata.displayName)}
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
                      Survey Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
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
                  {surveyTypes.map((surveyType) => (
                    <tr key={surveyType.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {surveyType.metadata.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {surveyType.metadata.description}
                          </div>
                          {surveyType.metadata.researchBasis && (
                            <div className="text-xs text-blue-600 mt-1">
                              Based on: {surveyType.metadata.researchBasis}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          surveyType.metadata.category === 'engagement' ? 'bg-blue-100 text-blue-800' :
                          surveyType.metadata.category === 'burnout' ? 'bg-red-100 text-red-800' :
                          surveyType.metadata.category === 'wellbeing' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {surveyType.metadata.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {surveyType.questions.length} questions
                        <div className="text-xs text-gray-500">
                          {surveyType.factors.length} factors
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          surveyType.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {surveyType.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {surveyType.isSystemDefault && (
                          <div className="text-xs text-purple-600 mt-1">System Default</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {surveyType.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
                        <button
                          onClick={() => handleToggleStatus(surveyType.id)}
                          className={`font-bold py-1 px-2 rounded text-xs ${
                            surveyType.isActive
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {surveyType.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {!surveyType.isSystemDefault && (
                          <button
                            onClick={() => handleDelete(surveyType.id, surveyType.metadata.displayName)}
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

          {surveyTypes.length === 0 && !isLoadingSurveyTypes && !error && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No survey types found.</div>
              <button
                onClick={handleCreateSystemDefaults}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-4 rounded touch-manipulation"
              >
                Create System Default Survey Types
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}