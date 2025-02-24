
import { useState, useEffect } from 'react';
import { Users, BookOpen, Brain, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { dashboardService, type ActivityData, type DashboardStats } from '../services/dashboardService';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: {
    value: number;
    isPositive: boolean;
  };
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, description }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-white/5 rounded-xl">
        {icon}
      </div>
      <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {trend.isPositive ? <span>{Math.abs(trend.value)}%</span> : <span>{Math.abs(trend.value)}%</span>}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm text-white/60 mb-1">{title}</p>
    <p className="text-xs text-white/40">{description}</p>
  </div>
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activity] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getActivityData(period)
        ]);

        setStats(statsData);
        setActivityData(activity);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const statCards: StatCardProps[] = stats ? [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers.toLocaleString('tr-TR'),
      icon: <Users className="w-6 h-6 text-white/60" />,
      trend: { 
        value: ((stats.newUsersLast30Days / stats.totalUsers) * 100),
        isPositive: true 
      },
      description: `Son 30 günde ${stats.newUsersLast30Days} yeni kullanıcı`
    },
    {
      title: 'Öğrenilen Kelime',
      value: stats.totalWordsLearned.toLocaleString('tr-TR'),
      icon: <BookOpen className="w-6 h-6 text-white/60" />,
      trend: { 
        value: stats.averageDailyWords,
        isPositive: true 
      },
      description: `Günlük ortalama ${stats.averageDailyWords.toLocaleString('tr-TR')} kelime`
    },
    {
      title: 'Quiz Başarı Oranı',
      value: `%${stats.quizSuccessRate.toFixed(1)}`,
      icon: <Brain className="w-6 h-6 text-white/60" />,
      trend: { 
        value: stats.quizSuccessRate - 70,
        isPositive: stats.quizSuccessRate >= 70 
      },
      description: `Toplam ${stats.totalQuizzesTaken.toLocaleString('tr-TR')} quiz tamamlandı`
    },
    {
      title: 'Egzersiz Tamamlama',
      value: `%${stats.exerciseCompletionRate.toFixed(1)}`,
      icon: <Target className="w-6 h-6 text-white/60" />,
      trend: { 
        value: stats.exerciseCompletionRate - 60,
        isPositive: stats.exerciseCompletionRate >= 60 
      },
      description: `${stats.totalExercises.toLocaleString('tr-TR')} egzersiz oluşturuldu`
    }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Activity Chart */}
      <div className="bg-white/5 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Aktivite</h2>
          
          {/* Period Selector */}
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${period === 'week' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white'}`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${period === 'month' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white'}`}
            >
              Aylık
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
              />
              <Tooltip />
              <Bar dataKey="users" name="Yeni Kullanıcı" fill="#4F46E5" />
              <Bar dataKey="words" name="Öğrenilen Kelime" fill="#10B981" />
              <Bar dataKey="quizzes" name="Quiz" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
