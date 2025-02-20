import React, { useState } from 'react';
import { 
  Search, 
  Filter,
  MoreVertical,
  Plus,
  Copy,
  Edit3,
  BarChart2,
  Clock,
  Award,
  Zap,
  BookOpen,
  Settings
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'level' | 'custom';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'mixed';
  wordCount: number;
  timeLimit: number;
  attempts: number;
  averageScore: number;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
}

// TODO: Bu veriler API'den gelecek
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Günlük Kelime Testi',
    type: 'daily',
    level: 'mixed',
    wordCount: 10,
    timeLimit: 300,
    attempts: 1250,
    averageScore: 85,
    status: 'active',
    lastUpdated: '2024-02-18T10:30:00'
  },
  {
    id: '2',
    title: 'B1 Seviye Değerlendirme',
    type: 'level',
    level: 'B1',
    wordCount: 25,
    timeLimit: 900,
    attempts: 850,
    averageScore: 72,
    status: 'active',
    lastUpdated: '2024-02-17T15:45:00'
  },
  {
    id: '3',
    title: 'Haftalık İlerleme Testi',
    type: 'weekly',
    level: 'mixed',
    wordCount: 50,
    timeLimit: 1800,
    attempts: 950,
    averageScore: 78,
    status: 'draft',
    lastUpdated: '2024-02-16T09:20:00'
  }
];

const QuizRow: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  const getStatusColor = (status: Quiz['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'archived':
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getTypeIcon = (type: Quiz['type']) => {
    switch (type) {
      case 'daily':
        return <Clock className="w-4 h-4" />;
      case 'weekly':
        return <BarChart2 className="w-4 h-4" />;
      case 'level':
        return <Award className="w-4 h-4" />;
      case 'custom':
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <tr className="border-b border-white/10">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="p-2 bg-white/5 rounded-lg mr-3">
            {getTypeIcon(quiz.type)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{quiz.title}</div>
            <div className="text-sm text-white/60">
              {quiz.wordCount} kelime • {quiz.timeLimit / 60} dakika
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500">
          {quiz.level}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
          {quiz.status === 'active' ? 'Aktif' : quiz.status === 'draft' ? 'Taslak' : 'Arşivlenmiş'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <div className="text-sm text-white/60">
            <span className="font-medium text-white">{quiz.attempts}</span> deneme
          </div>
          <div className="text-sm text-white/60">
            <span className="font-medium text-white">{quiz.averageScore}%</span> başarı
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
        {new Date(quiz.lastUpdated).toLocaleDateString('tr-TR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="text-white/60 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const QuizManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | Quiz['level']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Quiz['status']>('all');
  const [filterType, setFilterType] = useState<'all' | Quiz['type']>('all');

  const filteredQuizzes = mockQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || quiz.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus;
    const matchesType = filterType === 'all' || quiz.type === filterType;
    
    return matchesSearch && matchesLevel && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-bs-navy p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Quiz Yönetimi
        </h1>
        <p className="text-white/60">
          Quiz şablonlarını oluşturun, düzenleyin ve analiz edin
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
            placeholder="Quiz başlığı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <select
            className="block pl-3 pr-10 py-2 text-base border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
          >
            <option value="all">Tüm Seviyeler</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
            <option value="mixed">Karışık</option>
          </select>

          <select
            className="block pl-3 pr-10 py-2 text-base border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Tüm Tipler</option>
            <option value="daily">Günlük</option>
            <option value="weekly">Haftalık</option>
            <option value="level">Seviye</option>
            <option value="custom">Özel</option>
          </select>

          <select
            className="block pl-3 pr-10 py-2 text-base border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="draft">Taslak</option>
            <option value="archived">Arşivlenmiş</option>
          </select>

          <button className="px-4 py-2 bg-bs-primary text-white rounded-lg hover:bg-bs-primary/90 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Yeni Quiz</span>
          </button>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Quiz
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Seviye
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  İstatistikler
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Son Güncelleme
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredQuizzes.map(quiz => (
                <QuizRow key={quiz.id} quiz={quiz} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="fixed bottom-6 right-6 flex space-x-4">
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Quiz Şablonları">
          <Copy className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Hızlı Quiz Oluştur">
          <Zap className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Quiz Havuzu">
          <BookOpen className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Quiz Ayarları">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
