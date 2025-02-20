import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, BarChart2, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Word, WordStats } from '../types/word';
import { wordService } from '../services/wordService';
import { useNotification } from '@/modules/notifications/context/NotificationContext';

const WordsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [words, setWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<WordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [wordsData, statsData] = await Promise.all([
        wordService.getWords(),
        wordService.getWordStats()
      ]);
      setWords(wordsData);
      setStats(statsData);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Veriler yüklenirken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kelimeyi silmek istediğinizden emin misiniz?')) return;

    try {
      await wordService.deleteWord(id);
      showNotification({
        type: 'success',
        message: 'Kelime başarıyla silindi'
      });
      loadData();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Kelime silinirken bir hata oluştu'
      });
    }
  };

  const filteredWords = words.filter(word => {
    const matchesSearch = word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.turkish.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || word.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Kelime Yönetimi</h1>
          <button
            onClick={() => navigate('/admin/words/new')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Kelime
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">Toplam Kelime</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{stats.total_words}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">Ortalama Başarı</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">%{stats.average_success_rate.toFixed(1)}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">En Çok A1 Kelime</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{stats.words_by_level.A1}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">Popüler Kategori</span>
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                {stats.most_learned_categories[0]?.category || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="text"
                placeholder="İngilizce veya Türkçe kelime ara..."
                className="block w-full pl-10 pr-4 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-white/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                className="appearance-none pl-10 pr-8 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">Tüm Seviyeler</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Words Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">İngilizce</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Türkçe</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Seviye</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Başarı Oranı</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/60">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredWords.map((word) => (
                <tr key={word.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{word.english}</div>
                    <div className="text-sm text-white/60">{word.example_sentence}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{word.turkish}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
                      {word.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{word.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${word.success_rate}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-white/60">%{word.success_rate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => navigate(`/admin/words/${word.id}`)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => handleDelete(word.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WordsPage;
