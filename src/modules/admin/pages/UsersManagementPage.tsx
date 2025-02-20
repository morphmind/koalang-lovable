import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  Mail,
  Lock,
  Shield,
  Activity,
  Calendar
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  progress: {
    wordsLearned: number;
    quizzesTaken: number;
    averageScore: number;
  };
}

// TODO: Bu veriler API'den gelecek
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    role: 'user',
    status: 'active',
    lastActive: '2024-02-18T10:30:00',
    progress: {
      wordsLearned: 450,
      quizzesTaken: 32,
      averageScore: 85
    }
  },
  {
    id: '2',
    name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2024-02-18T11:45:00',
    progress: {
      wordsLearned: 890,
      quizzesTaken: 64,
      averageScore: 92
    }
  },
  {
    id: '3',
    name: 'Ayşe Kaya',
    email: 'ayse@example.com',
    role: 'user',
    status: 'inactive',
    lastActive: '2024-02-15T09:20:00',
    progress: {
      wordsLearned: 230,
      quizzesTaken: 18,
      averageScore: 78
    }
  }
];

const UserRow: React.FC<{ user: User }> = ({ user }) => {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'inactive':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'suspended':
        return 'bg-red-500/10 text-red-500';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-500';
      case 'user':
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <tr className="border-b border-white/10">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            {user.name.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-sm text-white/60">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(user.lastActive).toLocaleDateString('tr-TR')}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <div className="text-sm text-white/60">
            <span className="font-medium text-white">{user.progress.wordsLearned}</span> kelime
          </div>
          <div className="text-sm text-white/60">
            <span className="font-medium text-white">{user.progress.averageScore}%</span> başarı
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-white/60 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export const UsersManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-bs-navy p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Kullanıcı Yönetimi
        </h1>
        <p className="text-white/60">
          Tüm kullanıcıları görüntüleyin, düzenleyin ve yönetin
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            placeholder="İsim veya email ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <select
            className="block pl-3 pr-10 py-2 text-base border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
          >
            <option value="all">Tüm Roller</option>
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="block pl-3 pr-10 py-2 text-base border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">İnaktif</option>
            <option value="suspended">Askıya Alınmış</option>
          </select>

          <button className="px-4 py-2 bg-bs-primary text-white rounded-lg hover:bg-bs-primary/90 transition-colors flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Yeni Kullanıcı</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Son Aktivite
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  İlerleme
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Panel - TODO */}
      <div className="fixed bottom-6 right-6 flex space-x-4">
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
          <Mail className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
          <Lock className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
          <Shield className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
          <Activity className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
