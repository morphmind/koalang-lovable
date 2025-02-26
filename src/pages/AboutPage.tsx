import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BookOpen, Heart, Users, Award, Target, Zap, 
  MessageCircle, Globe, Brain, Rocket
} from 'lucide-react';
import { Footer } from '../components/Footer';
import { Header } from '../components';
import { Helmet } from 'react-helmet-async';

// Animasyon için scroll-triggered bileşen
const ScrollAnimation: React.FC<{children: React.ReactNode, delay?: number}> = ({ 
  children, 
  delay = 0 
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ 
    triggerOnce: true,
    threshold: 0.2
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6, 
            ease: "easeOut",
            delay: delay * 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Sayaç animasyonu için özel hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);

  return { count, ref };
};

// Ekip üyeleri
const teamMembers = [
  {
    name: "Ahmet Yılmaz",
    role: "Kurucu & CEO",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Cambridge Üniversitesi'nde dilbilim eğitimi aldı. 10+ yıl eğitim teknolojileri deneyimi."
  },
  {
    name: "Zeynep Kaya",
    role: "Ürün Direktörü",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Dil öğrenme konusunda uzman. Önceden Duolingo'da çalıştı. 3 dil biliyor."
  },
  {
    name: "Mehmet Demir",
    role: "Baş Mühendis",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    bio: "AI ve makine öğrenmesi uzmanı. Google ve Amazon'da çalıştı."
  },
  {
    name: "Ayşe Şahin",
    role: "Eğitim İçerik Uzmanı",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    bio: "15 yıllık İngilizce öğretmeni. Oxford dil programları danışmanı."
  }
];

// Değerler
const values = [
  {
    icon: Target,
    title: "Kişiselleştirilmiş Öğrenme",
    description: "Herkesin öğrenme hızı ve stili farklıdır. Yapay zeka algoritmalarımız, sizin için en uygun öğrenme yolunu belirler."
  },
  {
    icon: Zap,
    title: "Verimli Öğrenme",
    description: "Geleneksel yöntemlerle aylar süren süreçleri hızlandırıyoruz. Zamanınızı en verimli şekilde kullanmanızı sağlıyoruz."
  },
  {
    icon: Brain,
    title: "Bilimsel Metotlar",
    description: "Tüm öğrenme sistemimiz, hafıza ve bilişsel psikoloji araştırmalarına dayalı bilimsel metotlarla tasarlanmıştır."
  },
  {
    icon: Heart,
    title: "Öğrenme Tutkusu",
    description: "Öğrenmeyi bir görev değil, keyifli bir yolculuk haline getiriyoruz. Motivasyonunuzu her zaman yüksek tutuyoruz."
  }
];

// Zaman çizelgesi
const timeline = [
  {
    year: "2020",
    title: "Fikrin Doğuşu",
    description: "Dil öğrenimini herkes için erişilebilir kılma vizyonuyla yola çıktık."
  },
  {
    year: "2021",
    title: "İlk Prototip",
    description: "İlk AI destekli dil öğrenme algoritmamızı geliştirdik ve test ettik."
  },
  {
    year: "2022",
    title: "Beta Sürüm",
    description: "5,000 beta kullanıcısıyla platformumuzu test ettik ve geliştirdik."
  },
  {
    year: "2023",
    title: "Resmi Lansman",
    description: "Koalang resmen kullanıma açıldı ve ilk ayda 50,000 kullanıcıya ulaştı."
  },
  {
    year: "2024",
    title: "Yapay Zeka Asistan",
    description: "Koaly, yapay zeka asistanımızı tanıttık. Konuşma pratiği devri başladı."
  }
];

// Testimonials
const testimonials = [
  {
    name: "Mert Yılmaz",
    role: "Üniversite Öğrencisi",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    text: "Koalang sayesinde 3 ayda B2 seviyesine ulaştım. Konuşma pratiği yapabilmek gerçekten inanılmaz!"
  },
  {
    name: "Seda Karagöz",
    role: "Yazılım Mühendisi",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    text: "İş görüşmelerime hazırlanmak için Koalang kullandım. Akıcı İngilizce konuşmamda büyük payı var."
  },
  {
    name: "Emre Çetin",
    role: "Dijital Pazarlama Uzmanı",
    avatar: "https://randomuser.me/api/portraits/men/57.jpg",
    text: "Uygulamanın kişiselleştirilmiş yaklaşımı beni gerçekten etkiledi. Her gün düzenli pratik yapıyorum."
  }
];

export const AboutPage: React.FC = () => {
  // Header bileşeni için gerekli state'ler eklendi
  const [searchQuery, setSearchQuery] = useState('');
  const [showLearned, setShowLearned] = useState(false);
  const [_showQuiz, setShowQuiz] = useState(false);
  
  const usersCounter = useCounter(100000);
  const wordsCounter = useCounter(3000);
  const countriesCounter = useCounter(160);
  const lessonsCounter = useCounter(5000000);

  return (
    <>
      <Helmet>
        <title>Hakkımızda - Koalang ile İngilizce Öğrenme Platformu</title>
        <meta name="description" content="Koalang'ın hikayesi, misyonu ve vizyonu. Yapay zeka destekli İngilizce öğrenme platformumuz hakkında bilgi edinebilirsiniz." />
        <meta name="keywords" content="Koalang hakkında, dil öğrenme, İngilizce öğrenme platformu, yapay zeka, İngilizce kursu" />
        <link rel="canonical" href="https://koalang.io/about" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://koalang.io/about" />
        <meta property="og:title" content="Hakkımızda - Koalang ile İngilizce Öğrenme Platformu" />
        <meta property="og:description" content="Koalang'ın hikayesi, misyonu ve vizyonu. Yapay zeka destekli İngilizce öğrenme platformumuz hakkında bilgi edinebilirsiniz." />
        <meta property="og:image" content="https://koalang.io/images/about-og.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://koalang.io/about" />
        <meta property="twitter:title" content="Hakkımızda - Koalang ile İngilizce Öğrenme Platformu" />
        <meta property="twitter:description" content="Koalang'ın hikayesi, misyonu ve vizyonu. Yapay zeka destekli İngilizce öğrenme platformumuz hakkında bilgi edinebilirsiniz." />
        <meta property="twitter:image" content="https://koalang.io/images/about-og.jpg" />
      </Helmet>
      
      {/* Gerekli props'lar eklendi */}
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showLearned={showLearned}
        setShowLearned={setShowLearned}
        setShowQuiz={setShowQuiz}
      />
      
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-bs-navy via-bs-primary to-bs-800 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          
          {/* Decorative circles */}
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-purple-400 to-bs-primary blur-[80px] opacity-40 animate-float-slow" />
          <div className="absolute -bottom-32 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-bs-primary to-blue-400 blur-[100px] opacity-40 animate-float-slow-reverse" />
          
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Dünyanın <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">İngilizcesini</span> Değiştiriyoruz
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
                Yapay zeka destekli yenilikçi yaklaşımımızla, İngilizce öğrenmeyi
                herkes için ulaşılabilir, eğlenceli ve etkili hale getiriyoruz.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <a href="#our-story" className="px-8 py-3 rounded-xl bg-white text-bs-primary font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  Hikayemiz
                </a>
                <a href="#team" className="px-8 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
                  Ekibimiz
                </a>
              </div>
            </motion.div>
            
            {/* Floating illustration */}
            <div className="relative max-w-5xl mx-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex justify-center"
              >
                <img 
                  src="/about-illustration.svg" 
                  alt="Koalang Illustration" 
                  className="w-full max-w-3xl" 
                />
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center" ref={usersCounter.ref}>
                <div className="text-4xl md:text-5xl font-bold text-bs-primary mb-2">
                  {usersCounter.count.toLocaleString()}+
                </div>
                <div className="text-sm text-bs-navygri">Mutlu Kullanıcı</div>
              </div>
              
              <div className="text-center" ref={wordsCounter.ref}>
                <div className="text-4xl md:text-5xl font-bold text-bs-primary mb-2">
                  {wordsCounter.count.toLocaleString()}+
                </div>
                <div className="text-sm text-bs-navygri">Öğretilebilir Kelime</div>
              </div>
              
              <div className="text-center" ref={countriesCounter.ref}>
                <div className="text-4xl md:text-5xl font-bold text-bs-primary mb-2">
                  {countriesCounter.count.toLocaleString()}+
                </div>
                <div className="text-sm text-bs-navygri">Ülkede Kullanım</div>
              </div>
              
              <div className="text-center" ref={lessonsCounter.ref}>
                <div className="text-4xl md:text-5xl font-bold text-bs-primary mb-2">
                  {lessonsCounter.count.toLocaleString()}+
                </div>
                <div className="text-sm text-bs-navygri">Tamamlanan Ders</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Mission & Vision */}
        <section className="py-20 bg-bs-50 overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollAnimation>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-bs-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-6">
                    <Rocket className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-bs-navy mb-6">Misyon & Vizyonumuz</h2>
              </div>
            </ScrollAnimation>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <ScrollAnimation delay={2}>
                <div className="bg-white rounded-3xl shadow-xl p-8 h-full transform md:rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-bs-primary mr-4">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-bs-navy">Misyonumuz</h3>
                  </div>
                  <p className="text-bs-navygri leading-relaxed">
                    Dil öğrenmeyi demokratikleştirmek ve herkes için erişilebilir kılmak. 
                    İngilizce öğreniminde yapay zeka ve bilimsel yöntemleri kullanarak
                    kişiselleştirilmiş, etkili ve eğlenceli bir deneyim sunmak.
                  </p>
                  <div className="mt-6 space-y-3">
                    {["Herkes için erişilebilirlik", "Teknoloji destekli öğrenme", "Kişiselleştirilmiş eğitim", "Veri odaklı yaklaşım"].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-bs-navygri">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollAnimation>
              
              <ScrollAnimation delay={4}>
                <div className="bg-white rounded-3xl shadow-xl p-8 h-full transform md:-rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mr-4">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-bs-navy">Vizyonumuz</h3>
                  </div>
                  <p className="text-bs-navygri leading-relaxed">
                    Dil bariyerlerini yıkan, dünya çapında iletişimi güçlendiren bir 
                    platform olmak. İngilizce öğreniminde global standart haline gelerek
                    milyonlarca insanın hayatında olumlu değişim yaratmak.
                  </p>
                  <div className="mt-6 pl-4 border-l-4 border-purple-200">
                    <blockquote className="italic text-bs-navygri">
                      "Dil öğrenmek sadece kelimeler ezberlemek değil, yeni dünyalara kapı açmaktır. 
                      Biz bu kapıları herkes için erişilebilir kılıyoruz."
                    </blockquote>
                    <div className="mt-2 text-sm text-bs-navy font-semibold">
                      - Koalang Kurucu Ekibi
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section id="our-story" className="py-20 bg-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollAnimation>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-6">
                    <BookOpen className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-bs-navy mb-6">Hikayemiz</h2>
                <p className="text-lg text-bs-navygri max-w-3xl mx-auto">
                  Dil öğreniminde devrim yaratma yolculuğumuz, basit bir fikirle başladı 
                  ve bugün binlerce insanın hayatını değiştiren bir platforma dönüştü.
                </p>
              </div>
            </ScrollAnimation>
            
            {/* Timeline */}
            <div className="relative max-w-4xl mx-auto">
              {/* Center line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-bs-primary via-purple-400 to-amber-500"></div>
              
              {timeline.map((item, index) => (
                <ScrollAnimation key={index} delay={index * 2 + 1}>
                  <div className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-1/2 px-6">
                      <div className={`${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                        <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold mb-4 ${index % 2 === 0 ? 'bg-purple-600' : 'bg-bs-primary'}`}>
                          {item.year}
                        </div>
                        <h3 className="text-xl font-bold text-bs-navy mb-2">{item.title}</h3>
                        <p className="text-bs-navygri">{item.description}</p>
                      </div>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-4 border-white bg-gradient-to-r from-bs-primary to-purple-600 z-10"></div>
                    </div>
                    
                    <div className="w-1/2 px-6"></div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-20 bg-bs-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollAnimation>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-bs-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-bs-navy mb-6">Değerlerimiz</h2>
                <p className="text-lg text-bs-navygri max-w-3xl mx-auto">
                  Koalang'ı diğerlerinden ayıran, temel ilkelerimiz ve değerlerimizdir.
                  Her adımımızda bu değerlere bağlı kalıyoruz.
                </p>
              </div>
            </ScrollAnimation>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <ScrollAnimation key={index} delay={index * 2 + 1}>
                  <div className="bg-white rounded-2xl shadow-lg p-6 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bs-primary/10 to-bs-primary/30 flex items-center justify-center text-bs-primary mb-6">
                      <value.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-bs-navy mb-3">{value.title}</h3>
                    <p className="text-bs-navygri">{value.description}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section id="team" className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollAnimation>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-bs-primary to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
                    <Users className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-bs-navy mb-6">Ekibimiz</h2>
                <p className="text-lg text-bs-navygri max-w-3xl mx-auto">
                  Koalang'ın arkasındaki tutkulu ve yetenekli ekip üyelerimizle tanışın.
                </p>
              </div>
            </ScrollAnimation>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <ScrollAnimation key={index} delay={index * 2 + 1}>
                  <div className="bg-white rounded-2xl border border-bs-100 shadow-lg hover:shadow-xl p-6 h-full text-center group hover:-translate-y-2 transition-all duration-300">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-bs-primary to-purple-600 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-24 h-24 rounded-full object-cover relative z-10 border-4 border-white shadow-md"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-bs-navy mb-1">{member.name}</h3>
                    <div className="text-bs-primary font-medium mb-4">{member.role}</div>
                    <p className="text-bs-navygri text-sm">{member.bio}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-br from-bs-primary/5 to-purple-600/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollAnimation>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-bs-primary to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-bs-navy mb-6">Kullanıcılarımız Ne Diyor?</h2>
              </div>
            </ScrollAnimation>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <ScrollAnimation key={index} delay={index * 2 + 1}>
                  <div className="bg-white rounded-2xl shadow-lg p-6 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-bs-primary/10 to-bs-primary/0 rounded-bl-3xl"></div>
                    
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white shadow-md"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-bs-navy">{testimonial.name}</h3>
                        <div className="text-sm text-bs-navygri">{testimonial.role}</div>
                      </div>
                    </div>
                    
                    <p className="text-bs-navygri relative">
                      <span className="absolute -top-2 -left-1 text-6xl text-bs-primary/10">"</span>
                      <span className="relative z-10">{testimonial.text}</span>
                    </p>
                    
                    <div className="flex mt-6">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-bs-primary to-indigo-800 rounded-3xl p-10 md:p-16 text-white text-center shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/10 translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">İngilizce Öğrenme Yolculuğunuza Bugün Başlayın</h2>
                  <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                    Koalang ile İngilizce öğrenmek hiç bu kadar kolay ve eğlenceli olmamıştı.
                    Hemen ücretsiz hesap oluşturun ve yolculuğunuza başlayın.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a 
                      href="/register" 
                      className="px-8 py-4 rounded-xl bg-white text-bs-primary font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg"
                    >
                      Ücretsiz Başla
                    </a>
                    <a 
                      href="/contact" 
                      className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 text-lg"
                    >
                      İletişime Geç
                    </a>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}; 