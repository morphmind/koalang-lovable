import React from 'react';
import { User } from '../../auth/types';
import { 
  BookOpen, 
  Award, 
  Activity, 
  Star, 
  BarChart3,
  UserCircle, 
  Zap,
  TrendingUp
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { LoadingSpinner } from '../../auth/components/LoadingSpinner';
import { ErrorMessage } from '../../auth/components/ErrorMessage';

interface DashboardHeaderProps {
  user: User;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { stats, isLoading, error } = useDashboard();
  
  // Debug - konsolda kullanıcı bilgilerini kontrol et
  React.useEffect(() => {
    console.log("Kullanıcı bilgileri:", user);
  }, [user]);

  // Kullanıcı selamlaması - saate göre doğru selamlama
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Günaydın';
    if (hour >= 12 && hour < 18) return 'İyi günler';
    if (hour >= 18 && hour < 22) return 'İyi akşamlar';
    return 'İyi geceler';
  };

  // Sadeleştirilmiş kullanıcı adı alma - sadece username'e odaklanır
  const getUserName = () => {
    // Debug için konsolda göster
    console.log("Auth user:", user);
    
    try {
      // Supabase Auth formatında, metadata doğrudan ulaşılabilir olabilir
      if (user && user.app_metadata && user.app_metadata.username) {
        return user.app_metadata.username;
      }
      
      // Email tabanlı kimlik kontrolü yöntemini kullan
      if (user && user.email) {
        // Email adresinin @ işaretinden önceki kısmını kullan
        return user.email.split('@')[0];
      }
      
      // Hiçbir bilgi yoksa varsayılan değer
      return 'Kullanıcı';
    } catch (err) {
      console.error("Kullanıcı adı alınırken hata:", err);
      return 'Kullanıcı';
    }
  };

  // Formatlanmış yüzde
  const formatPercentage = (value: number) => {
    return `%${value}`;
  };

  return (
    <div className="mb-8">
      {/* Ana header içeriği */}
      <div className="bg-gradient-to-br from-bs-primary to-bs-800 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Arka plan paterni */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 pointer-events-none"></div>
        
        {/* Animasyonlu arka plan gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bs-600/20 rounded-full blur-3xl 
                      -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-bs-navy/20 rounded-full blur-2xl 
                      translate-y-1/2 -translate-x-1/2 animate-pulse"></div>
        
        {/* Header içeriği */}
        <div className="relative z-10 p-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" color="white" />
            </div>
          ) : error ? (
            <div className="py-6">
              <ErrorMessage message={error} light />
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-8">
                {/* Sol taraf - başlık */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur
                                text-white/90 text-sm font-medium">
                      koa<span className="text-bs-400">:analiz</span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {getGreeting()}, {getUserName()}!
                  </h1>
                  <p className="text-white/80">
                    İşte performans ve ilerleme analiziniz. İyi çalışmalar!
                  </p>
                </div>
                
                {/* Sağ taraf - bazı quick stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 self-start">
                  <div className="flex items-center gap-4">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <div>
                      <p className="text-white/70 text-sm">Günlük aktivite</p>
                      <p className="text-white font-semibold">{stats.streak} gün</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* İstatistik Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* İlerleme Kartı */}
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl relative overflow-hidden group hover:bg-white/15 transition-all">
                  <div className="absolute bottom-0 right-0 w-24 h-24 text-white/5 transition-all group-hover:text-white/10">
                    <BookOpen className="w-full h-full" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white/90 font-medium">Öğrenme İlerlemesi</h3>
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      {stats.learnedWords} / {stats.totalWords}
                    </p>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-teal-300 rounded-full"
                        style={{ width: `${Math.round((stats.learnedWords / stats.totalWords) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {formatPercentage(Math.round((stats.learnedWords / stats.totalWords) * 100))} tamamlandı
                    </p>
                  </div>
                </div>
                
                {/* Başarı Oranı Kartı */}
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl relative overflow-hidden group hover:bg-white/15 transition-all">
                  <div className="absolute bottom-0 right-0 w-24 h-24 text-white/5 transition-all group-hover:text-white/10">
                    <Award className="w-full h-full" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white/90 font-medium">Başarı Oranı</h3>
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      {formatPercentage(stats.successRate)}
                    </p>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full"
                        style={{ width: `${stats.successRate}%` }}
                      ></div>
                    </div>
                    <p className="text-white/70 text-sm">
                      {stats.quizCount} sınavda doğru cevap oranı
                    </p>
                  </div>
                </div>
                
                {/* Aktif Günler Kartı */}
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl relative overflow-hidden group hover:bg-white/15 transition-all">
                  <div className="absolute bottom-0 right-0 w-24 h-24 text-white/5 transition-all group-hover:text-white/10">
                    <Activity className="w-full h-full" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white/90 font-medium">Aktiflik Serisi</h3>
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      {stats.streak} gün
                    </p>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 rounded-full ${i < stats.streak ? 'bg-bs-400' : 'bg-white/10'}`}
                        ></div>
                      ))}
                    </div>
                    
                    <p className="text-white/70 text-sm">
                      {stats.streak > 0 
                        ? 'Harika gidiyorsun, devam et!' 
                        : 'Bugün çalışarak seriyi başlat!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
