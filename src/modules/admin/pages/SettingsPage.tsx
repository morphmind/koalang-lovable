import React, { useState } from 'react';
import { 
  Save,
  Lock,
  Bell,
  Database,
  Globe,
  Mail,
  Shield,
  Cloud,
  HardDrive,
  Zap
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  fields: SettingField[];
}

interface SettingField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'toggle';
  value: string | number | boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

// TODO: Bu veriler API'den gelecek
const mockSettings: SettingSection[] = [
  {
    id: 'general',
    title: 'Genel Ayarlar',
    icon: <Globe className="w-5 h-5" />,
    description: 'Uygulama genelinde geçerli olan temel ayarlar',
    fields: [
      {
        id: 'app-name',
        label: 'Uygulama Adı',
        type: 'text',
        value: 'Oxford 3000™',
        description: 'Uygulamanın görünen adı'
      },
      {
        id: 'language',
        label: 'Varsayılan Dil',
        type: 'select',
        value: 'tr',
        options: [
          { value: 'tr', label: 'Türkçe' },
          { value: 'en', label: 'English' }
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Güvenlik',
    icon: <Shield className="w-5 h-5" />,
    description: 'Güvenlik ve yetkilendirme ayarları',
    fields: [
      {
        id: 'two-factor',
        label: '2FA Zorunluluğu',
        type: 'toggle',
        value: true,
        description: 'Admin girişlerinde 2FA zorunluluğu'
      },
      {
        id: 'session-timeout',
        label: 'Oturum Zaman Aşımı (dakika)',
        type: 'number',
        value: 60,
        description: 'Kullanıcı hareketsizlik süresi'
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Bildirimler',
    icon: <Bell className="w-5 h-5" />,
    description: 'Bildirim ve email ayarları',
    fields: [
      {
        id: 'email-notifications',
        label: 'Email Bildirimleri',
        type: 'toggle',
        value: true
      },
      {
        id: 'notification-email',
        label: 'Bildirim Email Adresi',
        type: 'email',
        value: 'admin@example.com'
      }
    ]
  },
  {
    id: 'backup',
    title: 'Yedekleme',
    icon: <Database className="w-5 h-5" />,
    description: 'Veri yedekleme ve geri yükleme ayarları',
    fields: [
      {
        id: 'auto-backup',
        label: 'Otomatik Yedekleme',
        type: 'toggle',
        value: true
      },
      {
        id: 'backup-frequency',
        label: 'Yedekleme Sıklığı',
        type: 'select',
        value: 'daily',
        options: [
          { value: 'hourly', label: 'Saatlik' },
          { value: 'daily', label: 'Günlük' },
          { value: 'weekly', label: 'Haftalık' }
        ]
      }
    ]
  }
];

const SettingField: React.FC<{ field: SettingField }> = ({ field }) => {
  const [value, setValue] = useState(field.value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (field.type === 'toggle') {
      setValue((e.target as HTMLInputElement).checked);
    } else {
      setValue(e.target.value);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-white mb-2">
        {field.label}
      </label>
      
      {field.type === 'select' ? (
        <select
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
          value={value as string}
          onChange={handleChange}
        >
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'toggle' ? (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={value as boolean}
            onChange={handleChange}
          />
          <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bs-primary"></div>
          <span className="ml-3 text-sm font-medium text-white/60">
            {value ? 'Aktif' : 'Pasif'}
          </span>
        </label>
      ) : (
        <input
          type={field.type}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
          value={value as string | number}
          onChange={handleChange}
        />
      )}
      
      {field.description && (
        <p className="mt-2 text-sm text-white/60">
          {field.description}
        </p>
      )}
    </div>
  );
};

const SettingSection: React.FC<{ section: SettingSection }> = ({ section }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-white/5 rounded-lg mr-3">
          {section.icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">
            {section.title}
          </h3>
          <p className="text-sm text-white/60">
            {section.description}
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {section.fields.map(field => (
          <SettingField key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(mockSettings[0].id);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: API'ye kaydet
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-bs-navy">Sistem Ayarları</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-bs-primary text-white rounded-lg hover:bg-bs-primary/90 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          {mockSettings.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-bs-primary text-white'
                  : 'text-bs-navygri hover:bg-bs-50'
              }`}
            >
              <div className="flex items-center">
                {section.icon}
                <span className="ml-3">{section.title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          {mockSettings
            .filter((section) => section.id === activeSection)
            .map((section) => (
              <SettingSection key={section.id} section={section} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
