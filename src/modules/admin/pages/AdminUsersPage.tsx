
import React from 'react';

export const AdminUsersPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kullanıcı Yönetimi</h1>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <p className="text-gray-600">Henüz kullanıcı verisi yok.</p>
        </div>
      </div>
    </div>
  );
};
