'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { isAdminAsync } from '@/lib/admin';
import { getSurveyAnalytics, getScoreCategory, SurveyAnalytics, getKyanEngagementAnalytics, getENPSCategory } from '@/lib/analytics';
import { getAllSurveyTypes } from '@/lib/surveyTypeService';
import { SurveyType } from '@/types/surveyType';
import OrganizationSelector from '@/components/OrganizationSelector';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const { selectedOrganization } = useOrganization();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [kyanAnalytics, setKyanAnalytics] = useState<SurveyAnalytics & { enpsScore: number; enpsCategory: string } | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [surveyTypes, setSurveyTypes] = useState<SurveyType[]>([]);
  const [selectedSurveyType, setSelectedSurveyType] = useState<string>('');

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
          const allTypes = await getAllSurveyTypes();
          
          // Filter survey types based on selected organization's available survey types
          let filteredTypes = allTypes;
          if (selectedOrganization && selectedOrganization.availableSurveyTypes) {
            filteredTypes = allTypes.filter(type => 
              selectedOrganization.availableSurveyTypes!.includes(type.id)
            );
          }
          
          setSurveyTypes(filteredTypes);
          
          // Auto-select survey type if there's only one available
          if (filteredTypes.length === 1) {
            setSelectedSurveyType(filteredTypes[0].id);
          } else if (selectedSurveyType && !filteredTypes.some(type => type.id === selectedSurveyType)) {
            // Reset selected survey type if it's not available for the new organization
            setSelectedSurveyType('');
          }
        } catch (error) {
          console.error('Error loading survey types:', error);
        }
      }
    };

    loadSurveyTypes();
  }, [user, isUserAdmin, selectedOrganization, selectedSurveyType]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (user && isUserAdmin) {
        try {
          setIsLoadingAnalytics(true);
          setError(null);
          
          let data;
          
          // Use specialized analytics for Kyan Engagement survey
          if (selectedSurveyType === 'kyan-engagement') {
            data = await getKyanEngagementAnalytics(
              selectedOrganization?.id,
              selectedOrganization?.displayName
            );
            setKyanAnalytics(data);
          } else {
            // Get analytics for other survey types
            data = await getSurveyAnalytics(
              selectedOrganization?.id, 
              selectedOrganization?.displayName,
              selectedOrganization?.selectedQuestions,
              selectedSurveyType || undefined
            );
            setKyanAnalytics(null);
          }
          
          setAnalytics(data);
          
        } catch (error) {
          console.error('Error loading analytics:', error);
          setError('Failed to load analytics data');
        } finally {
          setIsLoadingAnalytics(false);
        }
      }
    };

    loadAnalytics();
  }, [user, isUserAdmin, selectedOrganization, selectedSurveyType]);



  const filteredAnalytics = analytics;

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
          <p className="text-gray-600">Please sign in to access analytics.</p>
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
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            You don&apos;t have permission to access analytics.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm sm:text-base touch-manipulation w-full sm:w-auto"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center bg-white rounded-lg shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto">
          <div className="text-red-600 text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm sm:text-base touch-manipulation w-full sm:w-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No analytics data available</div>
      </div>
    );
  }

  const { category: overallCategory, color: overallColor } = getScoreCategory(analytics.overallAverageScore);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Survey Analytics
                {analytics.surveyTypeName && (
                  <span className="ml-2 text-lg sm:text-xl lg:text-2xl font-medium text-blue-600">
                    - {analytics.surveyTypeName}
                  </span>
                )}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Detailed survey results and demographic analysis
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Last updated: {analytics.lastUpdated.toLocaleDateString()} at {analytics.lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            
            {/* Organization and Survey Type Filters */}
            <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-96">
              <div className="w-full">
                <OrganizationSelector />
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Type
                </label>
                <select
                  value={selectedSurveyType}
                  onChange={(e) => setSelectedSurveyType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={surveyTypes.length === 1}
                >
                  {surveyTypes.length > 1 && (
                    <option value="">All Survey Types</option>
                  )}
                  {surveyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.metadata.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Link
                href="/admin"
                className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-center text-sm touch-manipulation"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Demographic Filters - Coming Soon */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Demographic Filters</h2>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 text-sm">
              <strong>Note:</strong> Demographic filters will appear here once users complete surveys with demographic questions.
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${selectedSurveyType === 'kyan-engagement' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 sm:gap-6 mb-4 sm:mb-6`}>
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{analytics.totalResponses}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Overall Score</h3>
            <p className={`text-2xl sm:text-3xl font-bold ${overallColor}`}>
              {analytics.overallAverageScore.toFixed(2)}
            </p>
            <p className={`text-xs sm:text-sm ${overallColor}`}>{overallCategory}</p>
          </div>
          
          {/* eNPS Card for Kyan Engagement */}
          {selectedSurveyType === 'kyan-engagement' && kyanAnalytics && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">eNPS Score</h3>
              <p className={`text-2xl sm:text-3xl font-bold ${
                kyanAnalytics.enpsScore >= 50 ? 'text-green-600' :
                kyanAnalytics.enpsScore >= 30 ? 'text-blue-600' :
                kyanAnalytics.enpsScore >= 0 ? 'text-yellow-600' :
                kyanAnalytics.enpsScore >= -30 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {kyanAnalytics.enpsScore}
              </p>
              <p className={`text-xs sm:text-sm ${
                kyanAnalytics.enpsScore >= 50 ? 'text-green-600' :
                kyanAnalytics.enpsScore >= 30 ? 'text-blue-600' :
                kyanAnalytics.enpsScore >= 0 ? 'text-yellow-600' :
                kyanAnalytics.enpsScore >= -30 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {kyanAnalytics.enpsCategory}
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{analytics.completionRate.toFixed(1)}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Response Distribution</h3>
            <div className="space-y-1">
              {Object.entries(analytics.responseDistribution).map(([rating, count]) => (
                <div key={rating} className="flex justify-between text-xs sm:text-sm">
                  <span>{rating}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Factor Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Factor Analysis
            {selectedSurveyType === 'kyan-engagement' && (
              <span className="ml-2 text-sm text-blue-600">(Kyan Engagement Survey)</span>
            )}
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            {analytics.factorAnalysis
              .sort((a, b) => b.averageScore - a.averageScore)
              .map((factor) => {
                // Special handling for eNPS
                const isENPS = factor.factor === "Employee Net Promoter Score";
                const { category, color } = isENPS 
                  ? getENPSCategory(factor.averageScore)
                  : getScoreCategory(factor.averageScore);
                
                return (
                  <div key={factor.factor} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">{factor.factor}</h3>
                      <div className="text-left sm:text-right">
                        <p className={`text-lg sm:text-xl font-bold ${color}`}>
                          {isENPS ? factor.averageScore : factor.averageScore.toFixed(2)}
                          {isENPS && <span className="text-sm ml-1">eNPS</span>}
                        </p>
                        <p className={`text-xs sm:text-sm ${color}`}>{category}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                      <span>{factor.questions.length} questions</span>
                      <span>{factor.responseCount} responses</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: isENPS 
                            ? `${Math.max(0, (factor.averageScore + 100) / 200 * 100)}%`  // eNPS range is -100 to +100
                            : `${(factor.averageScore / 5) * 100}%`  // Standard 0-5 scale
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Demographics Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Demographics Analysis
          </h2>
          
          {Object.values(filteredAnalytics?.demographics || {}).every(category => Object.keys(category).length === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="text-blue-800 text-xs sm:text-sm">
                <strong>Note:</strong> Demographic data will appear here once users complete surveys with demographic questions.
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {Object.entries(filteredAnalytics?.demographics || {}).map(([category, data]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(data)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .map(([value, stats]) => {
                      const { color } = getScoreCategory(stats.averageScore);
                      return (
                        <div key={value} className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">{value}</span>
                              <span className={`text-xs sm:text-sm font-medium ${color}`}>
                                {stats.averageScore.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{stats.count} responses</span>
                              <span>{stats.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${stats.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {Object.keys(data).length === 0 && (
                  <p className="text-gray-500 text-xs sm:text-sm">No data available</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Factor Analysis */}
        <div className="space-y-4 sm:space-y-6">
          {analytics.factorAnalysis
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((factor) => (
              <div key={factor.factor} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {factor.factor} - Detailed Questions
                </h3>
                
                {/* Mobile Card Layout */}
                <div className="block sm:hidden space-y-3">
                  {factor.questions
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .map((question) => {
                      const isENPSQuestion = factor.factor === "Employee Net Promoter Score";
                      const { color } = isENPSQuestion 
                        ? getENPSCategory(question.averageScore)
                        : getScoreCategory(question.averageScore);
                      
                      return (
                        <div key={question.questionId} className="border border-gray-200 rounded-lg p-3">
                          <p className="text-sm text-gray-900 mb-2">{question.question}</p>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                              {isENPSQuestion ? "Average Rating:" : "Score:"}
                            </span>
                            <span className={`text-sm font-medium ${color}`}>
                              {isENPSQuestion 
                                ? `${question.averageScore.toFixed(1)}/10`
                                : question.averageScore.toFixed(2)
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Responses:</span>
                            <span className="text-sm text-gray-500">{question.responseCount}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="block mb-1">Distribution:</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(question.distribution).map(([rating, count]) => (
                                <span key={rating} className="bg-gray-100 px-2 py-1 rounded">
                                  {rating}: {count}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* Desktop Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distribution
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {factor.questions
                        .sort((a, b) => b.averageScore - a.averageScore)
                        .map((question) => {
                          const isENPSQuestion = factor.factor === "Employee Net Promoter Score";
                          const { color } = isENPSQuestion 
                            ? getENPSCategory(question.averageScore)
                            : getScoreCategory(question.averageScore);
                          
                          return (
                            <tr key={question.questionId}>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                                {question.question}
                              </td>
                              <td className={`px-6 py-4 text-sm font-medium ${color}`}>
                                {isENPSQuestion 
                                  ? `${question.averageScore.toFixed(1)}/10`
                                  : question.averageScore.toFixed(2)
                                }
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {question.responseCount}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  {Object.entries(question.distribution).map(([rating, count]) => (
                                    <span key={rating} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {rating}: {count}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}