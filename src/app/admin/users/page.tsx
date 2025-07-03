'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminAsync, setUserAdmin } from '@/lib/admin';

interface UserRecord {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  lastSignIn?: Date;
}

interface ApiUserRecord {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  lastSignIn?: string;
  createdAt: string;
  disabled: boolean;
  emailVerified: boolean;
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGranting, setIsGranting] = useState<string | null>(null);

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

  const loadUsers = useCallback(async () => {
    if (user && isUserAdmin) {
      setIsLoading(true);
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('https://europe-west1-survey-sonnet.cloudfunctions.net/listUsers', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data: { users: ApiUserRecord[] } = await response.json();
        const formattedUsers: UserRecord[] = data.users.map((u: ApiUserRecord) => ({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || u.email?.split('@')[0] || 'Unknown',
          isAdmin: u.isAdmin,
          lastSignIn: u.lastSignIn ? new Date(u.lastSignIn) : undefined
        }));
        
        setUsers(formattedUsers);
        setError(null);
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, isUserAdmin]);

  // Load real users from Firebase Auth
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleGrantAdmin = async (targetUid: string, targetEmail: string, grant: boolean) => {
    if (!user) return;
    
    setIsGranting(targetUid);
    try {
      const success = await setUserAdmin(user, targetUid, grant);
      if (success) {
        // Reload users to get updated admin status
        await loadUsers();
        alert(`${grant ? 'Granted' : 'Revoked'} admin access for ${targetEmail}`);
      } else {
        alert(`Failed to ${grant ? 'grant' : 'revoke'} admin access`);
      }
    } catch (error) {
      console.error('Error setting admin status:', error);
      alert(`Failed to ${grant ? 'grant' : 'revoke'} admin access`);
    } finally {
      setIsGranting(null);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access admin features.
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading users...</div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Administration</h1>
              <p className="text-gray-600">
                Manage admin access for organization users
              </p>
            </div>
            <div className="space-x-2">
              <Link
                href="/admin"
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Users</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userRecord) => (
                  <tr key={userRecord.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userRecord.displayName || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        UID: {userRecord.uid}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userRecord.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userRecord.isAdmin 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userRecord.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userRecord.lastSignIn?.toLocaleDateString() || 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {userRecord.uid !== user.uid && (
                        <>
                          {!userRecord.isAdmin ? (
                            <button
                              onClick={() => handleGrantAdmin(userRecord.uid, userRecord.email, true)}
                              disabled={isGranting === userRecord.uid}
                              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              {isGranting === userRecord.uid ? 'Granting...' : 'Grant Admin'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGrantAdmin(userRecord.uid, userRecord.email, false)}
                              disabled={isGranting === userRecord.uid}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              {isGranting === userRecord.uid ? 'Revoking...' : 'Revoke Admin'}
                            </button>
                          )}
                        </>
                      )}
                      {userRecord.uid === user.uid && (
                        <span className="text-xs text-gray-500">(You)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <div className="text-blue-600 text-sm">
              <strong>Note:</strong> This interface shows all organization users registered 
              in Firebase Auth via Firebase Functions. Admin status is managed through Firebase 
              custom claims. Only existing admins can grant or revoke admin access to other users.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}