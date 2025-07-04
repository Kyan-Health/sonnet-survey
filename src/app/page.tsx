'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/LoginButton';
import { logout } from '@/lib/auth';
import { isAdminAsync } from '@/lib/admin';

export default function Home() {
  const { user, loading } = useAuth();
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const adminStatus = await isAdminAsync(user);
          setIsUserAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Sonnet Survey</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Please sign in with your organization account
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Sonnet Survey</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm sm:text-base text-gray-600 order-last sm:order-first">
              Welcome, {user.displayName}
            </span>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isUserAdmin && (
                <Link
                  href="/admin"
                  className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-center text-sm sm:text-base touch-manipulation"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base touch-manipulation"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        
        <main>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Survey Portal</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Help us improve the workplace experience by sharing your feedback. 
                Choose from available surveys below.
              </p>
              <Link
                href="/survey"
                className="inline-block w-full sm:w-auto bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-4 sm:px-6 rounded-lg transition-colors text-center text-sm sm:text-base touch-manipulation"
              >
                Start Survey
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}