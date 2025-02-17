
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

export const AdminWordsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-bs-navy">Word Management</h1>
        <button className="bg-gradient-to-r from-bs-primary to-bs-800 text-white px-4 py-2 
                        rounded-xl flex items-center gap-2 hover:shadow-lg transition-all">
          <Plus className="w-5 h-5" />
          Add New Word
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-bs-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-bs-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-bs-navygri absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search words..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-bs-100 focus:ring-2 
                         focus:ring-bs-primary/20 focus:border-bs-primary transition-all"
              />
            </div>
            <button className="px-4 py-2 text-bs-navygri hover:text-bs-navy border border-bs-100 
                           rounded-xl flex items-center gap-2 hover:bg-bs-50 transition-all">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bs-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-bs-navy">Word</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-bs-navy">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-bs-navy">Users Learning</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-bs-navy">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bs-100">
              <tr>
                <td className="px-6 py-4 text-bs-navygri" colSpan={4}>
                  No words found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
