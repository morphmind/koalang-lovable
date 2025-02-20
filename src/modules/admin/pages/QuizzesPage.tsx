import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, BarChart2, Trash2, Edit2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Quiz, QuizStats } from '../types/quiz';
import { quizService } from '../services/quizService';
import { useNotification } from '@/modules/notifications/context/NotificationContext';

const QuizzesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'daily' | 'practice' | 'test'>('all');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [quizzesData, statsData] = await Promise.all([
        quizService.getQuizzes(),
        quizService.getQuizStats()
      ]);
      setQuizzes(quizzesData);
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
    if (!confirm('Bu quizi silmek istediğinizden emin misiniz?')) return;

    try {
      await quizService.deleteQuiz(id);
      showNotification({
        type: 'success',
        message: 'Quiz başarıyla silindi'
      });
      loadData();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Quiz silinirken bir hata oluştu'
      });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || quiz.type === typeFilter;
    return matchesSearch && matchesType;
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
          <h1 className="text-2xl font-bold text-white">Quiz Yönetimi</h1>
          <button
            onClick={() => navigate('/admin/quizzes/new')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Quiz
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">Toplam Quiz</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{stats.total_quizzes}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">Toplam Soru</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{stats.total_questions}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">Tamamlanma Oranı</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">%{stats.average_completion_rate.toFixed(1)}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-white/60">Başarı Oranı</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">%{stats.average_success_rate.toFixed(1)}</div>
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
                placeholder="Quiz başlığı veya açıklaması ara..."
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
              >
                <option value="all">Tüm Tipler</option>
                <option value="daily">Günlük</option>
                <option value="practice">Alıştırma</option>
                <option value="test">Test</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{quiz.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
                  {quiz.level}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  quiz.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {quiz.status === 'published' ? 'Yayında' : 'Taslak'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/60`}>
                  {quiz.type === 'daily' ? 'Günlük' : quiz.type === 'practice' ? 'Alıştırma' : 'Test'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/60">Soru Sayısı</div>
                  <div className="text-lg font-semibold text-white">{quiz.questions.length}</div>
                </div>
                <div>
                  <div className="text-sm text-white/60">Başarı Oranı</div>
                  <div className="text-lg font-semibold text-white">%{quiz.average_score.toFixed(1)}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${quiz.average_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesPage;
