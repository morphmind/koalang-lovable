import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components';
import { Footer } from '../components/Footer';
import { FiMail, FiPhone, FiMapPin, FiSend, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  // Header bileşeni için gerekli state'ler
  const [searchQuery, setSearchQuery] = useState('');
  const [showLearned, setShowLearned] = useState(false);
  const [_showQuiz, setShowQuiz] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Burada gerçek bir API çağrısı yapılabilir
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 3000);
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>İletişim - Koalang ile İngilizce Öğren</title>
        <meta name="description" content="Koalang ile iletişime geçin. Sorularınızı, önerilerinizi ve geri bildirimlerinizi bekliyoruz." />
      </Helmet>
      
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showLearned={showLearned}
        setShowLearned={setShowLearned}
        setShowQuiz={setShowQuiz}
      />
      
      <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Bizimle İletişime Geçin
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Sorularınız, önerileriniz veya geri bildirimleriniz için bize ulaşın. 
            En kısa sürede size geri dönüş yapacağız.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* İletişim Formu */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mesaj Gönderin</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Adınız
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresiniz
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="ornek@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Konu
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="">Konu Seçiniz</option>
                  <option value="Genel Soru">Genel Soru</option>
                  <option value="Teknik Destek">Teknik Destek</option>
                  <option value="İşbirliği">İşbirliği</option>
                  <option value="Öneri">Öneri</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>
              
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium 
                  ${formStatus === 'submitting' ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition flex items-center justify-center`}
              >
                {formStatus === 'submitting' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiSend className="mr-2" /> Gönder
                  </span>
                )}
              </button>
              
              {formStatus === 'success' && (
                <div className="mt-3 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                </div>
              )}
              
              {formStatus === 'error' && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </div>
              )}
            </form>
          </motion.div>
          
          {/* İletişim Bilgileri */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* İletişim Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiMail className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">E-posta</h3>
                    <p className="mt-1 text-gray-600">
                      <a href="mailto:iletisim@koalang.com" className="hover:text-indigo-600 transition">
                        iletisim@koalang.com
                      </a>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">7/24 e-posta desteği</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiPhone className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Telefon</h3>
                    <p className="mt-1 text-gray-600">
                      <a href="tel:+902121234567" className="hover:text-indigo-600 transition">
                        +90 (212) 123 45 67
                      </a>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Hafta içi 09:00 - 18:00</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiMapPin className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Adres</h3>
                    <p className="mt-1 text-gray-600">
                      Levent, 34330 Beşiktaş/İstanbul
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Ziyaret için randevu alınız</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Sosyal Medya</h3>
                    <div className="mt-3 flex space-x-4">
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition">
                        <FiInstagram className="h-5 w-5" />
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition">
                        <FiTwitter className="h-5 w-5" />
                      </a>
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition">
                        <FiYoutube className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Harita */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-80 md:h-96">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24066.125744465963!2d29.00658091323676!3d41.066632655410056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab63f6f8f8d15%3A0x68c5c31adc287aaf!2sLevent%2C%20Be%C5%9Fikta%C5%9F%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1653055183457!5m2!1str!2str" 
                className="w-full h-full" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Koalang İstanbul Ofisi"
              />
            </div>
            
            {/* SSS */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sık Sorulan Sorular</h2>
              
              <div className="space-y-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                    <span className="font-medium">Koalang uygulamasını nasıl kullanabilirim?</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-gray-600 mt-2 pl-2">Koalang uygulamasını kullanmak için ücretsiz hesap oluşturabilir ve hemen kelime öğrenmeye başlayabilirsiniz. Detaylı bilgiler için "Nasıl Çalışır" sayfamızı ziyaret edebilirsiniz.</p>
                </details>
                
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                    <span className="font-medium">Ücretli abonelik var mı?</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-gray-600 mt-2 pl-2">Koalang uygulamasının temel özellikleri ücretsizdir. Premium özelliklere erişmek için aylık veya yıllık abonelik planlarımız mevcuttur.</p>
                </details>
                
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                    <span className="font-medium">Teknik sorunlarda ne yapmalıyım?</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-gray-600 mt-2 pl-2">Teknik sorunlar için yukarıdaki iletişim formunu kullanabilir veya doğrudan destek@koalang.com adresine e-posta gönderebilirsiniz.</p>
                </details>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}; 