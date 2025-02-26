import React from 'react';
import { useAuth } from '../modules/auth/context/AuthContext';
import { useAuthPopup } from '../modules/auth/hooks/useAuthPopup';
import { 
  Brain, 
  Target, 
  ChevronRight,
  BookOpen,
  Sparkles,
  Trophy,
  Globe2,
  GraduationCap 
} from 'lucide-react';

export const CTASection: React.FC = () => {
  const { user } = useAuth();
  const { openAuthPopup } = useAuthPopup();

  const researchStats = [
    {
      icon: BookOpen,
      title: '2 Milyar+',
      description: 'Analiz Edilen Kelime',
      detail: 'Oxford English Corpus veritabanında analiz edilen toplam kelime sayısı'
    },
    {
      icon: Target,
      title: '%85',
      description: 'Kapsama Oranı',
      detail: 'İngilizce metinlerin %85\'ini anlayabilmek için gereken kelime oranı'
    },
    {
      icon: GraduationCap,
      title: '30+',
      description: 'Yıllık Araştırma',
      detail: 'Oxford Üniversitesi\'nin kelime seçimi üzerine yaptığı araştırma süresi'
    },
    {
      icon: Globe2,
      title: '190+',
      description: 'Ülke',
      detail: 'Oxford 3000 ve 5000 kelime listelerinin kullanıldığı ülke sayısı'
    }
  ];

  return (
    <>
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-bs-navy via-bs-primary/80 to-bs-800 rounded-3xl" />
        
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        
        <div className="absolute top-0 left-0 w-[70%] h-[40%] bg-white/10 rounded-br-[100px] backdrop-blur-xl
                     border border-white/20 rotate-[10deg] translate-x-[-20%] translate-y-[-30%]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[60%] bg-white/5 rounded-tl-[100px] backdrop-blur-lg
                     border border-white/10 rotate-[-15deg] translate-x-[15%] translate-y-[20%]" />
        
        <div className="absolute top-[20%] left-[10%] w-20 h-20 rounded-full bg-bs-primary/40 backdrop-blur-xl
                     border border-white/20 animate-float-slow" />
        <div className="absolute bottom-[30%] right-[15%] w-16 h-16 rounded-full bg-bs-800/30 backdrop-blur-xl
                     border border-white/10 animate-float-slow-reverse" />
        <div className="absolute top-[60%] left-[30%] w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl
                     border border-white/30 animate-pulse-slow" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full 
                         bg-white/15 backdrop-blur-xl border border-white/20
                         text-white text-sm font-medium mb-8 shadow-lg
                         hover:bg-white/20 transition-all cursor-pointer">
              <BookOpen className="w-4 h-4" />
              <span>Oxford Üniversitesi Araştırması</span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
              <span className="relative inline-block">
                <span className="relative z-10">30 Yıllık</span>
                <div className="absolute bottom-2 left-0 w-full h-3 bg-white/20 rounded-full blur-sm"></div>
              </span>{' '}
              <span className="relative">
                <span className="relative z-10">Bilimsel</span>
                <div className="absolute bottom-2 left-0 w-full h-3 bg-white/20 rounded-full blur-sm"></div>
              </span>{' '}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-bs-50 to-white">
                  Araştırma
                </span>
              </span>
            </h2>
            
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
              Oxford English Corpus'tan elde edilen 2 milyar kelimelik veri analizi sonucunda, 
              günlük hayatta en sık kullanılan ve en önemli kelimeler belirlendi.
            </p>
            
            <a 
              href="https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                      bg-white/15 backdrop-blur-xl border border-white/20 text-white
                      hover:bg-white/25 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.2)]
                      hover:shadow-[0_8px_25px_rgba(255,255,255,0.2)] group"
              onClick={() => {
                if (!user) {
                  openAuthPopup();
                }
              }}
            >
              <span>Oxford Araştırması Hakkında</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {researchStats.map((stat, index) => (
              <div key={stat.title} 
                   className={`group relative overflow-hidden rounded-2xl
                            backdrop-blur-xl border border-white/20 transition-all
                            hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]
                            ${index % 4 === 0 ? 'bg-white/10' : 
                               index % 4 === 1 ? 'bg-white/15' : 
                               index % 4 === 2 ? 'bg-white/20' : 'bg-white/10'}`}>
                
                <div className="relative z-10 p-8">
                  <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm
                               flex items-center justify-center border border-white/20 mb-5
                               group-hover:scale-110 group-hover:rotate-[5deg] transition-all">
                    <stat.icon className="w-8 h-8 text-white" />
                    
                    <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent
                                 rounded-t-xl opacity-50" />
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-4xl font-bold text-white mb-1">{stat.title}</div>
                    <div className="text-white/80 font-medium">{stat.description}</div>
                  </div>
                  
                  <p className="text-white/60 text-sm">{stat.detail}</p>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
                
                <div className={`absolute ${index % 2 === 0 ? '-right-6 -bottom-6' : '-left-6 -top-6'} 
                             w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/10
                             group-hover:bg-white/10 transition-all duration-500`} />
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-16">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center
                         animate-bounce cursor-pointer">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-bs-50/80 via-white to-bs-50/30" />
        
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full 
                     bg-gradient-to-br from-bs-primary/5 to-bs-800/5 blur-3xl
                     animate-float-slow opacity-60 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full 
                     bg-gradient-to-br from-bs-800/5 to-bs-primary/5 blur-3xl
                     animate-float-slow-reverse opacity-40 translate-y-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full 
                         bg-bs-primary/10 text-bs-primary text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Akıllı Öğrenme Platformu</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-bs-navy sm:text-5xl mb-6">
              Modern Teknoloji ile{' '}
              <span className="bg-gradient-to-r from-bs-primary to-bs-800 bg-clip-text text-transparent">
                Kolay Öğrenme
              </span>
            </h2>
            <p className="text-lg leading-8 text-bs-navygri">
              Yapay zeka destekli öğrenme sistemi, interaktif sınavlar ve detaylı analizlerle 
              İngilizce kelime haznenizi geliştirin.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 md:row-span-2 group">
                <div className="h-full rounded-3xl bg-gradient-to-br from-bs-primary/10 to-bs-primary/5 p-8 border border-bs-100 shadow-sm
                             hover:shadow-xl hover:border-bs-primary/30 transition-all duration-300 overflow-hidden relative">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-bs-primary/10 rounded-full blur-3xl group-hover:bg-bs-primary/20 transition-all"></div>
                  
                  <div className="flex flex-col h-full">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bs-primary to-bs-800 flex items-center justify-center
                                 group-hover:scale-110 transition-all mb-6 shadow-lg shadow-bs-primary/20">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-bs-navy mb-4">Yapay Zeka Destekli<br/>Öğrenme</h3>
                    <p className="text-bs-navygri mb-6">
                      GPT-4 tabanlı yapay zeka algoritması ile öğrenme hızınıza ve stilinize göre 
                      kişiselleştirilmiş öğrenme deneyimi yaşayın.
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3">
                        <div className="rounded-full p-1 bg-green-100">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <span className="text-bs-navygri">Kişiselleştirilmiş öğrenme planı</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="rounded-full p-1 bg-green-100">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <span className="text-bs-navygri">Akıllı tekrar algoritması</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="rounded-full p-1 bg-green-100">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <span className="text-bs-navygri">Zayıf yönlerinize odaklanan öneri sistemi</span>
                      </li>
                    </ul>
                    
                    <div className="mt-auto">
                      <button className="group/btn inline-flex items-center gap-2 text-bs-primary font-medium">
                        <span>Yapay Zeka Modelini Keşfet</span>
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="group">
                  <div className="h-full rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 border border-amber-200/50
                               hover:shadow-lg hover:border-amber-300/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-amber-100/80 flex items-center justify-center mb-4">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-bs-navy mb-2">İnteraktif Sınavlar</h3>
                    <p className="text-bs-navygri/80">
                      Farklı soru tipleriyle öğrenme durumunuzu test edin ve anında geribildirim alın.
                    </p>
                  </div>
                </div>

                <div className="group">
                  <div className="h-full rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 p-6 border border-green-200/50
                               hover:shadow-lg hover:border-green-300/50 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-green-100/80 flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-bs-navy mb-2">Seviye Takibi</h3>
                    <p className="text-bs-navygri/80">
                      CEFR (A1-C1) seviyelerine göre ilerleyişinizi takip edin ve hedeflerinize göre plan yapın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
