import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { LoadingSpinner } from '../../auth/components/LoadingSpinner';
import { ErrorMessage } from '../../auth/components/ErrorMessage';
import { Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export const SettingsPhonePage: React.FC = () => {
  const { profile, updatePhone, isLoading, error } = useSettings();
  const [newPhone, setNewPhone] = useState(profile?.phone || '');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validasyon
    if (!newPhone) {
      setFormError('Lütfen telefon numaranızı girin.');
      return;
    }

    if (newPhone === profile?.phone) {
      setFormError('Yeni telefon numarası mevcut numaranızla aynı olamaz.');
      return;
    }

    try {
      await updatePhone(newPhone);
      setSuccessMessage('Telefon numaranız başarıyla güncellendi.');
      setShowVerification(true);
    } catch (err) {
      console.error('Telefon güncellenirken hata:', err);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!verificationCode) {
      setFormError('Lütfen doğrulama kodunu girin.');
      return;
    }

    try {
      // TODO: Implement phone verification
      setSuccessMessage('Telefon numaranız başarıyla doğrulandı.');
      setShowVerification(false);
      setVerificationCode('');
    } catch (err) {
      console.error('Telefon doğrulanırken hata:', err);
      setFormError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-bs-100 overflow-hidden relative hover:shadow-xl transition-all">
      <div className="relative bg-gradient-to-br from-bs-primary to-bs-800 p-8">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                Telefon Ayarları
              </h1>
              <p className="text-white/80 flex items-center gap-2">
                <span>Telefon numaranızı güncelleyin ve yönetin</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>İletişim</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                <Smartphone className="w-4 h-4" />
                <span>SMS Doğrulaması</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Mevcut Telefon */}
        <div className="mb-8 p-4 bg-bs-50 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-5 h-5 text-bs-primary" />
            <span className="font-medium text-bs-navy">Mevcut Telefon</span>
          </div>
          <p className="text-bs-navygri ml-8">
            {profile?.phone || 'Henüz bir telefon numarası eklenmemiş'}
          </p>
        </div>

        {/* Telefon Güncelleme Formu */}
        {!showVerification ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || formError) && (
              <ErrorMessage message={error || formError} />
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 text-green-800 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{successMessage}</div>
              </div>
            )}

            {/* Yeni Telefon */}
            <div>
              <label className="block text-sm font-medium text-bs-navy mb-2">
                Yeni Telefon Numarası
              </label>
              <div className="relative">
                <PhoneInput
                  country="tr"
                  value={newPhone}
                  onChange={setNewPhone}
                  enableSearch
                  searchPlaceholder="Ülke ara..."
                  inputClass="w-full px-4 py-3 rounded-lg border border-bs-100 focus:ring-2 
                           focus:ring-bs-primary/10 focus:border-bs-primary transition-colors"
                  buttonClass="border-bs-100 rounded-lg bg-white hover:bg-bs-50 
                            hover:border-bs-primary transition-all"
                  dropdownClass="rounded-xl border-bs-100 shadow-lg mt-2"
                  searchClass="rounded-lg border-bs-100 mb-2"
                  containerClass="phone-input-container"
                  specialLabel=""
                  localization={{
                    tr: 'Türkiye',
                    us: 'Amerika Birleşik Devletleri',
                    gb: 'Birleşik Krallık',
                    de: 'Almanya',
                    fr: 'Fransa',
                    it: 'İtalya',
                    es: 'İspanya',
                    nl: 'Hollanda'
                  }}
                  preferredCountries={['tr', 'us', 'gb', 'de']}
                />
              </div>
              <p className="mt-2 text-xs text-bs-navygri">
                Ülke kodunu değiştirmek için bayrak simgesine tıklayabilirsiniz
              </p>
            </div>

            {/* Bilgi Notu */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl text-yellow-800">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Önemli Not</p>
                <p>Telefon numaranızı değiştirdiğinizde:</p>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Yeni telefon numaranıza bir doğrulama kodu gönderilecektir.</li>
                  <li>Doğrulama kodunu girerek işlemi tamamlamanız gerekmektedir.</li>
                  <li>Doğrulama işlemini 10 dakika içinde tamamlamanız gerekmektedir.</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-bs-100">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-bs-primary text-white rounded-xl font-medium
                       hover:bg-bs-800 transition-colors disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Güncelleniyor...
                  </>
                ) : (
                  'Telefon Numarasını Güncelle'
                )}
              </button>
            </div>
          </form>
        ) : (
          // Doğrulama Kodu Formu
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {formError && (
              <ErrorMessage message={formError} />
            )}

            {/* Doğrulama Kodu */}
            <div>
              <label className="block text-sm font-medium text-bs-navy mb-2">
                Doğrulama Kodu
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-bs-100 focus:ring-2 
                         focus:ring-bs-primary/10 focus:border-bs-primary transition-colors"
                placeholder="123456"
                maxLength={6}
              />
              <p className="mt-2 text-xs text-bs-navygri">
                {newPhone} numarasına gönderilen 6 haneli doğrulama kodunu girin.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="px-6 py-3 border border-bs-primary text-bs-primary rounded-xl 
                         font-medium hover:bg-bs-50 transition-colors"
              >
                Geri Dön
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-bs-primary text-white rounded-xl font-medium
                       hover:bg-bs-800 transition-colors disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Doğrulanıyor...
                  </>
                ) : (
                  'Doğrula'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};