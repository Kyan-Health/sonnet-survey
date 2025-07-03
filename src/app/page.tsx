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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Sonnet Survey</h1>
          <p className="text-gray-600 mb-8">
            Please sign in with your @kyanhealth.com account
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sonnet Survey</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.displayName}</span>
            {isUserAdmin && (
              <Link
                href="/admin"
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        </header>
        
        <main>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Employee Experience Survey</h2>
              <p className="text-gray-600 mb-6">
                Help us improve the workplace experience by sharing your feedback. 
                The survey takes approximately 10-15 minutes to complete.
              </p>
              <Link
                href="/survey"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Take Survey
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}