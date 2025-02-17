
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/context';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <nav className="w-64 bg-white border-r">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <div className="mt-4">
          <div className="px-4 py-2">
            <a href="/admin" className="text-gray-700 hover:text-gray-900">Dashboard</a>
          </div>
          <div className="px-4 py-2">
            <a href="/admin/users" className="text-gray-700 hover:text-gray-900">Users</a>
          </div>
          <div className="px-4 py-2">
            <a href="/admin/words" className="text-gray-700 hover:text-gray-900">Words</a>
          </div>
          <div className="px-4 py-2">
            <a href="/admin/notifications" className="text-gray-700 hover:text-gray-900">Notifications</a>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};
