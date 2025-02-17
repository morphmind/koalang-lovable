
import React from 'react';

export const AdminNotificationsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bildirim Yönetimi</h1>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <p className="text-gray-600">Henüz bildirim verisi yok.</p>
        </div>
      </div>
    </div>
  );
};
