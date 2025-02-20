import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, Clock, Award, Book, Brain, Target } from 'lucide-react';
import { User, UserActivity } from '../types/user';
import { userService } from '../services/userService';
import { useNotification } from '../../../modules/notifications/context/NotificationContext';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UserStats {
  totalWords: number;
  quizzesTaken: number;
  averageScore: number;
  streak: number;
}

interface UserActivity {
  date: string;
  action: string;
  details: string;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
    <div className="flex items-center">
      <div className="p-2 bg-white/5 rounded-lg">
        {icon}
      </div>
      <div className="ml-3">
        <div className="text-sm text-white/60">{title}</div>
        <div className="text-lg font-semibold text-white">{value}</div>
      </div>
    </div>
  </div>
);

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    if (id) {
      loadUserData(id);
    }
  }, [id]);

  const loadUserData = async (userId: string) => {
    try {
      const [userData, activitiesData] = await Promise.all([
        userService.getUserById(userId),
        userService.getUserActivities(userId)
      ]);

      setUser(userData);
      setActivities(activitiesData);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Kullanıcı bilgileri yüklenirken bir hata oluştu'
      });
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bs-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-bs-navy font-medium">Kullanıcı bulunamadı</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 flex items-center text-bs-primary hover:text-bs-primary/80"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kullanıcı Listesine Dön
        </button>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      locale: tr
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Üst Başlık */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="mr-4 p-2 text-bs-navygri hover:text-bs-navy rounded-lg hover:bg-bs-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-bs-navy">Kullanıcı Detayları</h1>
      </div>

      {/* Kullanıcı Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol Panel - Temel Bilgiler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-bs-navy mb-4">Temel Bilgiler</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-bs-primary mr-3" />
              <div>
                <p className="text-sm text-bs-navygri">E-posta</p>
                <p className="text-bs-navy">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-bs-primary mr-3" />
              <div>
                <p className="text-sm text-bs-navygri">Kayıt Tarihi</p>
                <p className="text-bs-navy">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-bs-primary mr-3" />
              <div>
                <p className="text-sm text-bs-navygri">Son Aktivite</p>
                <p className="text-bs-navy">
                  {formatDate(user.last_active)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Panel - İstatistikler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-bs-navy mb-4">İstatistikler</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-bs-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Book className="w-5 h-5 text-bs-primary mr-2" />
                <span className="text-sm text-bs-navygri">Toplam Kelime</span>
              </div>
              <p className="text-2xl font-semibold text-bs-navy">
                {user.progress.total_words}
              </p>
            </div>
            <div className="p-4 bg-bs-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Brain className="w-5 h-5 text-bs-primary mr-2" />
                <span className="text-sm text-bs-navygri">Quiz Sayısı</span>
              </div>
              <p className="text-2xl font-semibold text-bs-navy">
                {user.progress.quizzes_taken}
              </p>
            </div>
            <div className="p-4 bg-bs-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-bs-primary mr-2" />
                <span className="text-sm text-bs-navygri">Ortalama Skor</span>
              </div>
              <p className="text-2xl font-semibold text-bs-navy">
                %{Math.round(user.progress.average_score)}
              </p>
            </div>
            <div className="p-4 bg-bs-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Award className="w-5 h-5 text-bs-primary mr-2" />
                <span className="text-sm text-bs-navygri">Gün Serisi</span>
              </div>
              <p className="text-2xl font-semibold text-bs-navy">
                {user.progress.streak_days}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivite Geçmişi */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-bs-navy mb-4">Aktivite Geçmişi</h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start p-4 bg-bs-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-bs-navy font-medium">
                  {activity.action_type === 'quiz_completed' && 'Quiz Tamamlandı'}
                  {activity.action_type === 'word_learned' && 'Kelime Öğrenildi'}
                  {activity.action_type === 'achievement_earned' && 'Başarı Kazanıldı'}
                </p>
                <p className="text-sm text-bs-navygri mt-1">{activity.details}</p>
                <p className="text-xs text-bs-navygri/75 mt-1">
                  {formatDate(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
