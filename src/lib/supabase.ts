import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase ortam değişkenleri eksik');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage,
    storageKey: 'sb-auth-token',
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false, // Debug modunu kapatıyoruz
    lockAcquireTimeout: 15000, // Lock timeout süresini artırıyoruz
    storageOptions: {
      getItem: (key: string) => {
        const value = window.localStorage.getItem(key);
        return value; // Gereksiz log'u engellemek için direkt dönüş
      },
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key);
      }
    }
  },
  global: {
    headers: {
      'x-client-info': 'koalang-web'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2 // Hız sınırını düşürüyoruz
    },
    timeout: 20000, // Timeout süresini 20 saniyeye düşürüyoruz
    heartbeat: {
      interval: 5000 // Heartbeat süresini 5 saniyeye düşürüyoruz
    }
  },
  db: {
    schema: 'public'
  }
});

// Singleton instance'ı dışa aktar
export default supabase;

// Bağlantısı durumu için enum
enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED'
}

let connectionStatus = ConnectionStatus.DISCONNECTED;
let retryCount = 0;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

// Bağlantısı yönetimi
const handleConnection = async () => {
  if (connectionStatus === ConnectionStatus.CONNECTING) return;
  
  connectionStatus = ConnectionStatus.CONNECTING;
  console.log('🔄 Realtime bağlantısı başlatılıyor...');

  try {
    const channel = supabase.channel('system', {
      config: {
        broadcast: { self: true }
      }
    });

    channel
      .on('system', { event: 'maintenance' }, (payload) => {
        console.log('⚙️ Sistem bakım bildirimi:', payload);
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('🟢 Presence senkronizasyonu başarılı');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👤 Yeni kullanıcı katıldı:', { key, newPresences });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 Kullanıcı ayrıldı:', { key, leftPresences });
      })
      .subscribe(async (status) => {
        console.log('🔵 Realtime bağlantısı durumu:', status);
        
        switch (status) {
          case 'SUBSCRIBED':
            connectionStatus = ConnectionStatus.CONNECTED;
            retryCount = 0;
            console.log('✅ Realtime bağlantısı başarılı');
            break;
            
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            if (connectionStatus !== ConnectionStatus.DISCONNECTED) {
              connectionStatus = ConnectionStatus.DISCONNECTED;
              await handleReconnect();
            }
            break;
            
          default:
            console.log('ℹ️ Bağlantısı durumu:', status);
        }
      });

  } catch (error) {
    console.error('❌ Realtime bağlantısı hatası:', error);
    await handleReconnect();
  }
};

// Yeniden bağlanma mantığı
const handleReconnect = async () => {
  if (retryCount >= MAX_RETRIES) {
    console.error('❌ Maksimum yeniden bağlanma denemesi aşıldı');
    return;
  }

  const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  retryCount++;
  
  console.log(`🔄 Yeniden bağlanılıyor... (${retryCount}/${MAX_RETRIES}) - ${delay}ms sonra`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  await handleConnection();
};

// İlk bağlantıyı başlat
handleConnection();

// Bağlantıyı test et
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔵 Auth durumu değişti:', { event, user: session?.user?.email });
  if (session?.user) {
    console.log('🟢 Bağlantı başarılı, kullanıcı:', session.user.email);
  } else {
    console.log('🟡 Aktif oturum yok');
  }
});

// Veritabanı bağlantısını test et
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .single();

    if (error) throw error;
    console.log('🟢 Veritabanı bağlantısı başarılı');
    return data;
  } catch (error) {
    console.error('🔴 Veritabanı bağlantısı hatası:', error);
    return false;
  }
};

// Oturum durumunu kontrol et
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('🔴 Oturum kontrolü hatası:', error.message);
      return null;
    }

    if (session) {
      console.log('🟢 Aktif oturum bulundu:', session.user.email);
      return session;
    } else {
      console.log('🔵 Aktif oturum bulunamadı');
      return null;
    }
  } catch (err) {
    console.error('🔴 Beklenmeyen hata:', err);
    return null;
  }
};

// Auth state değişikliklerini dinle
let lastAuthEvent: string | null = null;
supabase.auth.onAuthStateChange((event, session) => {
  // Aynı event tekrar tekrar log'lanmasın
  if (event !== lastAuthEvent) {
    console.log('🔵 Auth durumu değişti:', { event, user: session?.user?.email });
    lastAuthEvent = event;
  }

  if (event === 'SIGNED_OUT') {
    console.log('🔴 Oturum kapatıldı');
  }
});