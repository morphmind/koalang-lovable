import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { LoadingSpinner } from '../../auth/components/LoadingSpinner';
import { ErrorMessage } from '../../auth/components/ErrorMessage';
import { Bell, AlertCircle, CheckCircle2, Volume2, Vibrate, Mail } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { toast } from 'react-hot-toast';

export const SettingsNotificationsPage: React.FC = () => {
  const { profile, updateNotificationPreferences, isLoading, error } = useSettings();
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const notificationSettings = [
    {
      id: 'system_notifications',
      label: 'Sistem Bildirimleri',
      description: 'Sistem güncellemeleri ve önemli duyurular',
      icon: <Bell className="w-5 h-5 text-bs-primary" />
    },
    {
      id: 'learning_notifications',
      label: 'Öğrenme Bildirimleri',
      description: 'Kelime öğrenme ve ilerleme bildirimleri',
      icon: <Bell className="w-5 h-5 text-bs-primary" />
    },
    {
      id: 'quiz_notifications',
      label: 'Quiz Bildirimleri',
      description: 'Quiz sonuçları ve hatırlatıcıları',
      icon: <Bell className="w-5 h-5 text-bs-primary" />
    },
    {
      id: 'email_notifications',
      label: 'E-posta Bildirimleri',
      description: 'Önemli güncellemeler için e-posta bildirimleri',
      icon: <Mail className="w-5 h-5 text-bs-primary" />
    },
    {
      id: 'sound_enabled',
      label: 'Bildirim Sesi',
      description: 'Yeni bildirimler için ses çal',
      icon: <Volume2 className="w-5 h-5 text-bs-primary" />
    },
    {
      id: 'vibration_enabled',
      label: 'Titreşim',
      description: 'Yeni bildirimler için titreşim',
      icon: <Vibrate className="w-5 h-5 text-bs-primary" />
    }
  ];

  const handleToggle = async (settingId: string) => {
    if (!profile) {
      toast.error('Profil bilgileri yüklenemedi');
      return;
    }

    try {
      // Mevcut tercihleri al veya boş bir obje oluştur
      const currentPreferences = profile.notification_preferences || {};
      
      // Yeni tercihleri oluştur
      const updatedPreferences = {
        ...currentPreferences,
        [settingId]: !currentPreferences[settingId]
      };

      // Tercihleri güncelle
      await updateNotificationPreferences(updatedPreferences);
      
      // Başarı mesajı göster
      setSuccessMessage('Bildirim tercihleri başarıyla güncellendi.');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Toast mesajı göster
      toast.success('Bildirim tercihleri güncellendi', {
        duration: 3000,
        position: 'bottom-right',
      });
    } catch (err) {
      console.error('Bildirim tercihleri güncellenirken hata:', err);
      toast.error('Bildirim tercihleri güncellenirken bir hata oluştu', {
        duration: 5000,
        position: 'bottom-right',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-bs-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-bs-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-bs-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-bs-primary" />
          </div>
          <div className="pt-1">
            <h2 className="text-lg font-semibold text-bs-navy">
              Bildirim Ayarları
            </h2>
            <p className="text-sm text-bs-navygri">
              Bildirim tercihlerinizi yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && <ErrorMessage message={error} />}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{successMessage}</div>
          </div>
        )}

        {/* Bildirim Tercihleri */}
        <div className="space-y-6">
          {notificationSettings.map((setting) => (
            <div 
              key={setting.id}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-bs-100
                       hover:border-bs-primary hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-4">
                {setting.icon}
                <div>
                  <div className="font-medium text-bs-navy">{setting.label}</div>
                  <div className="text-sm text-bs-navygri">{setting.description}</div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Switch
                  checked={profile?.notification_preferences?.[setting.id] ?? false}
                  onChange={() => handleToggle(setting.id)}
                  size="md"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bilgi Notu */}
        <div className="mt-8 flex items-start gap-3 p-4 bg-yellow-50 rounded-xl text-yellow-800">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Önemli Not</p>
            <p>Bildirim tercihlerinizi değiştirdiğinizde:</p>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>Değişiklikler anında uygulanır</li>
              <li>Email bildirimleri için email adresinizin doğrulanmış olması gerekir</li>
              <li>Tarayıcı bildirimlerine izin vermeniz gerekebilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};