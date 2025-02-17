
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
          </div>
          <nav className="mt-4">
            <a href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Dashboard
            </a>
            <a href="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Kullanıcılar
            </a>
            <a href="/admin/words" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Kelimeler
            </a>
            <a href="/admin/notifications" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Bildirimler
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
