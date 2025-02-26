
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components';
import { Footer } from '../components/Footer';
import { FiMail, FiPhone, FiMapPin, FiSend, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useToast } from "../components/ui/use-toast";

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLearned, setShowLearned] = useState(false);
  const [_showQuiz, setShowQuiz] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast({
        title: "Başarılı!",
        description: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
      });
      setTimeout(() => setFormStatus('idle'), 3000);
    } catch (error) {
      setFormStatus('error');
      toast({
        title: "Hata!",
        description: "Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
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
      
      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-5xl font-bold text-gray-800 dark:text-white mb-6 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Bizimle İletişime Geçin
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 neuro-card"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Mesaj Gönderin</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adınız
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition duration-200"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta Adresiniz
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition duration-200"
                  placeholder="ornek@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Konu
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition duration-200"
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
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition duration-200 resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={formStatus === 'submitting'}
                className={`w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white 
                  ${formStatus === 'submitting' ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center gap-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {formStatus === 'submitting' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" /> Gönder
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
          
          {/* İletişim Bilgileri ve Harita */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* İletişim Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 neuro-card hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                      <FiMail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">E-posta</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      <a href="mailto:iletisim@koalang.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        iletisim@koalang.com
                      </a>
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">7/24 e-posta desteği</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 neuro-card hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                      <FiPhone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Telefon</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      <a href="tel:+902121234567" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        +90 (212) 123 45 67
                      </a>
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hafta içi 09:00 - 18:00</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 neuro-card hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                      <FiMapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adres</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Levent, 34330<br />Beşiktaş/İstanbul
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ziyaret için randevu alınız</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 neuro-card hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sosyal Medya</h3>
                    <div className="mt-3 flex space-x-4">
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                        <FiInstagram className="h-6 w-6" />
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                        <FiTwitter className="h-6 w-6" />
                      </a>
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                        <FiYoutube className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Harita */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden neuro-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="h-96 w-full">
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
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}; 
