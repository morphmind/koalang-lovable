
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';
import { useToast } from "../components/ui/use-toast";
import { 
  Building2,
  Mail, 
  MessageSquare, 
  Phone,
  MapPin,
  Send,
  GraduationCap,
  Handshake,
  HelpCircle,
  AlertCircle,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  ArrowRight,
  Clock,
  Check,
} from "lucide-react";

const OFFICE_HOURS = [
  { day: 'Pazartesi - Cuma', hours: '09:00 - 18:00' },
  { day: 'Cumartesi', hours: '10:00 - 14:00' },
  { day: 'Pazar', hours: 'Kapalı' }
];

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: 'E-posta',
    description: '7/24 e-posta desteği',
    value: 'iletisim@koalang.com',
    href: 'mailto:iletisim@koalang.com',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  },
  {
    icon: Phone,
    title: 'Telefon',
    description: 'Mesai saatleri içinde',
    value: '+90 (212) 123 45 67',
    href: 'tel:+902121234567',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  },
  {
    icon: Building2,
    title: 'Ofis',
    description: 'Randevu ile ziyaret',
    value: 'Levent, İstanbul',
    href: 'https://maps.google.com',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  }
];

export const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLearned, setShowLearned] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
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

      <main className="flex-1 container mx-auto px-4 py-12 lg:py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Sizinle İletişime Geçelim
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçin. 
              Ekibimiz size yardımcı olmak için hazır.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: MessageSquare, label: "Genel Soru", color: "bg-blue-50 dark:bg-blue-900/30" },
                { icon: GraduationCap, label: "Eğitim", color: "bg-green-50 dark:bg-green-900/30" },
                { icon: Handshake, label: "İş Birliği", color: "bg-purple-50 dark:bg-purple-900/30" },
                { icon: HelpCircle, label: "Destek", color: "bg-orange-50 dark:bg-orange-900/30" },
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  onClick={() => setFormData(prev => ({ ...prev, subject: item.label }))}
                  className={`${item.color} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 
                             hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
                >
                  <item.icon className="w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Contact Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adınız
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl 
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-200"
                    placeholder="Adınız Soyadınız"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl 
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-200"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Konu
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-200"
                >
                  <option value="">Konu Seçiniz</option>
                  <option value="Genel Soru">Genel Soru</option>
                  <option value="Eğitim">Eğitim</option>
                  <option value="İş Birliği">İş Birliği</option>
                  <option value="Destek">Destek</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-200 resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                         hover:to-indigo-700 text-white font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl 
                         disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {formStatus === 'submitting' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : formStatus === 'success' ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Gönderildi</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Gönder</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          </motion.div>

          {/* Contact Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Cards */}
            <div className="space-y-4">
              {CONTACT_METHODS.map((method, index) => (
                <motion.a
                  key={method.title}
                  href={method.href}
                  target={method.icon === Building2 ? "_blank" : undefined}
                  rel={method.icon === Building2 ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="group block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl 
                           transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${method.color}`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        {method.description}
                      </p>
                      <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <span>{method.value}</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Office Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Çalışma Saatleri
                </h3>
              </div>
              <div className="space-y-3">
                {OFFICE_HOURS.map((schedule, index) => (
                  <div
                    key={schedule.day}
                    className="flex justify-between items-center text-gray-600 dark:text-gray-300"
                  >
                    <span>{schedule.day}</span>
                    <span className="font-medium">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sosyal Medya
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { icon: Instagram, href: 'https://instagram.com/koalang', color: 'hover:text-pink-500' },
                  { icon: Twitter, href: 'https://twitter.com/koalang', color: 'hover:text-blue-400' },
                  { icon: Youtube, href: 'https://youtube.com/koalang', color: 'hover:text-red-500' }
                ].map((social, index) => (
                  <motion.a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-700 ${social.color} 
                             transition-all duration-300 hover:scale-110`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.9 + index * 0.1 }}
                  >
                    <social.icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
