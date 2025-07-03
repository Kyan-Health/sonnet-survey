'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { isAdminAsync } from '@/lib/admin';
import { getSurveyAnalytics, getScoreCategory, SurveyAnalytics } from '@/lib/analytics';
import OrganizationSelector from '@/components/OrganizationSelector';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { selectedOrganization } = useOrganization();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
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
    const loadAnalytics = async () => {
      if (user && isUserAdmin) {
        try {
          setIsLoadingAnalytics(true);
          setError(null);
          // Pass organization ID to analytics function (null for all organizations)
          const data = await getSurveyAnalytics(selectedOrganization?.id);
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
  }, [user, isUserAdmin, selectedOrganization]);

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
          <p className="text-gray-600">Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access the admin dashboard.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Analytics Dashboard</h1>
              <p className="text-gray-600">
                Employee experience survey results and analytics
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {analytics.lastUpdated.toLocaleDateString()} at {analytics.lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            
            {/* Organization Filter */}
            <div className="mx-6 min-w-64">
              <OrganizationSelector />
            </div>
            
            <div className="space-x-2">
              <Link
                href="/admin/organizations"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Manage Organizations
              </Link>
              <Link
                href="/admin/users"
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              >
                Manage Users
              </Link>
              <Link
                href="/"
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalResponses}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Score</h3>
            <p className={`text-3xl font-bold ${overallColor}`}>
              {analytics.overallAverageScore.toFixed(2)}
            </p>
            <p className={`text-sm ${overallColor}`}>{overallCategory}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.completionRate.toFixed(1)}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Distribution</h3>
            <div className="space-y-1">
              {Object.entries(analytics.responseDistribution).map(([rating, count]) => (
                <div key={rating} className="flex justify-between text-sm">
                  <span>{rating}★</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Factor Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Factor Analysis</h2>
          
          <div className="space-y-4">
            {analytics.factorAnalysis
              .sort((a, b) => b.averageScore - a.averageScore)
              .map((factor) => {
                const { category, color } = getScoreCategory(factor.averageScore);
                return (
                  <div key={factor.factor} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{factor.factor}</h3>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${color}`}>
                          {factor.averageScore.toFixed(2)}
                        </p>
                        <p className={`text-sm ${color}`}>{category}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{factor.questions.length} questions</span>
                      <span>{factor.responseCount} responses</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(factor.averageScore / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Demographics Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Demographics Breakdown</h2>
          
          {Object.values(analytics.demographics).every(category => Object.keys(category).length === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-blue-800 text-sm">
                <strong>Note:</strong> Demographic data will appear here once users complete the new survey version with demographic questions. 
                Existing survey responses will continue to show in the overall statistics above.
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(analytics.demographics).map(([category, data]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
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
                              <span className="text-sm font-medium text-gray-700">{value}</span>
                              <span className={`text-sm font-medium ${color}`}>
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
                  <p className="text-gray-500 text-sm">No data available</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Factor Analysis */}
        <div className="space-y-6">
          {analytics.factorAnalysis
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((factor) => (
              <div key={factor.factor} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {factor.factor} - Detailed Questions
                </h3>
                
                <div className="overflow-x-auto">
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
                          Distribution (1-5)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {factor.questions
                        .sort((a, b) => b.averageScore - a.averageScore)
                        .map((question) => {
                          const { color } = getScoreCategory(question.averageScore);
                          return (
                            <tr key={question.questionId}>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                                {question.question}
                              </td>
                              <td className={`px-6 py-4 text-sm font-medium ${color}`}>
                                {question.averageScore.toFixed(2)}
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