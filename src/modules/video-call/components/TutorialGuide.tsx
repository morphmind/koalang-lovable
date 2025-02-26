import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { X, ArrowRight, ArrowLeft, Mic, VideoIcon, MessageSquare, Volume2 } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  image: string;
  focusElement?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Koaly ile İngilizce Pratik Başlıyor!",
    description: "Koaly, seninle gerçek zamanlı konuşarak İngilizce pratiği yapmanı sağlayan AI destekli bir konuşma arkadaşıdır. İşte nasıl kullanacağın:",
    image: "/images/tutorial/koaly-welcome.png",
  },
  {
    title: "1. Konuşmaya Başla",
    description: "Mikrofon düğmesine basarak konuşmaya başlayabilirsin. Koaly seni dinler ve anında yanıt verir.",
    image: "/images/tutorial/talking.png",
    focusElement: "mic-button"
  },
  {
    title: "2. Mesajları Takip Et",
    description: "Konuşma baloncukları, konuşmanın yazılı dökümünü gösterir. Hem senin hem de Koaly'nin söyledikleri burada görünür.",
    image: "/images/tutorial/messages.png",
    focusElement: "messages-area"
  },
  {
    title: "3. Konuşma Hızını Ayarla",
    description: "Koaly çok hızlı mı konuşuyor? Konuşma hızı düğmesine tıklayarak daha yavaş konuşmasını sağlayabilirsin.",
    image: "/images/tutorial/speed.png",
    focusElement: "speed-button"
  },
  {
    title: "4. Yazarak İletişim Kur",
    description: "İstersen mikrofon kullanmadan, metin kutusuna yazarak da Koaly ile iletişim kurabilirsin.",
    image: "/images/tutorial/text-input.png",
    focusElement: "text-input"
  },
  {
    title: "Hazırsın!",
    description: "Şimdi Koaly ile dilediğin konuda İngilizce pratik yapmaya hazırsın. İyi eğlenceler!",
    image: "/images/tutorial/ready.png",
  }
];

interface TutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialGuide: React.FC<TutorialGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('koaly-tutorial-seen');
    if (hasSeenTutorial) {
      setShowTutorial(false);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('koaly-tutorial-seen', 'true');
    onClose();
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!showTutorial || !isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative mx-auto w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800"
        >
          {/* Kapat butonu */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>

          {/* İlerleme göstergesi */}
          <div className="absolute left-0 right-0 top-0 flex justify-center">
            <div className="mt-4 flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-8 rounded-full ${
                    index === currentStep
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-6 pt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tutorialSteps[currentStep].title}
                  </h3>
                </div>

                <div className="relative mb-6 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    src={tutorialSteps[currentStep].image}
                    alt={`Adım ${currentStep + 1}`}
                    className="h-56 w-full object-cover"
                  />
                  
                  {/* Odaklanılan eleman vurgusu */}
                  {tutorialSteps[currentStep].focusElement && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute">
                        <div className="animate-ping h-16 w-16 rounded-full border-4 border-blue-500 opacity-75"></div>
                      </div>
                    </div>
                  )}
                </div>

                <p className="mb-8 text-gray-600 dark:text-gray-300">
                  {tutorialSteps[currentStep].description}
                </p>

                {/* Özellik simgeleri */}
                {currentStep === 0 && (
                  <div className="mb-6 flex justify-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                        <Mic size={20} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Konuş</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-green-100 p-2 dark:bg-green-900">
                        <VideoIcon size={20} className="text-green-600 dark:text-green-300" />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Görüntü</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                        <MessageSquare size={20} className="text-purple-600 dark:text-purple-300" />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Mesajlaş</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                        <Volume2 size={20} className="text-amber-600 dark:text-amber-300" />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Hız Ayarı</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                      currentStep === 0
                        ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Geri
                  </button>

                  <button
                    onClick={nextStep}
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {currentStep === tutorialSteps.length - 1 ? 'Başla' : 'İleri'}
                    {currentStep !== tutorialSteps.length - 1 && (
                      <ArrowRight size={16} className="ml-1" />
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
}; 