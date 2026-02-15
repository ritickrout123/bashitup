'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { User } from '@/types';

// Extended User type to include aggregated stats if the API provides them
interface UserWithStats extends User {
  _count?: {
    bookings: number;
  };
  totalSpent?: number; // Requires backend update or client-side calculation if list includes bookings
}

export default function UserManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUsers();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Directory</h1>
            <p className="text-gray-500">Manage {users.length} registered accounts</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
              ← Dashboard
            </Link>
            {/* Placeholder for Add User if implemented */}
            {/* <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-colors">
                            + Add User
                        </button> */}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'CUSTOMER', 'DECORATOR', 'ADMIN'].map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filterRole === role
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {role === 'ALL' ? 'All Users' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stats</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${u.role === 'ADMIN' ? 'bg-red-500' :
                          u.role === 'DECORATOR' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${u.role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                        u.role === 'DECORATOR' ? 'bg-purple-50 text-purple-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm font-medium text-gray-700">{u.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* Fallback stats view since aggregated data might not be in list API yet */}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Joined</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-pink-200 hover:text-pink-600 transition-all shadow-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}