import React, { useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useVideoCall } from '../context/VideoCallContext';
import { CallControls } from './CallControls';
import { Howl } from 'howler';
import { Battery, Wifi } from 'lucide-react';
import { AnimatedKoaly } from './AnimatedKoaly';
import { useRealtimeChat } from '../../../hooks/useRealtimeChat';
import { useToast } from '@/components/ui/use-toast';

export const VideoCallModal: React.FC = () => {
  const { toast } = useToast();
  const {
    isOpen,
    callState,
    isMuted,
    isVideoOn,
    endCall,
    acceptCall,
    toggleMute,
    toggleVideo,
  } = useVideoCall();

  const {
    messages,
    isRecording,
    isSpeaking,
    isSpeakingSlow,
    startRecording,
    stopRecording,
    sendMessage,
    connect,
    toggleSpeakingSpeed
  } = useRealtimeChat();

  const [userInput, setUserInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
  const ringtoneRef = useRef<Howl | null>(null);
  const acceptSoundRef = useRef<Howl | null>(null);
  const declineSoundRef = useRef<Howl | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    acceptSoundRef.current = new Howl({
      src: ['/sounds/accept.mp3'],
      volume: 0.5
    });

    declineSoundRef.current = new Howl({
      src: ['/sounds/decline.mp3'],
      volume: 0.5
    });

    return () => {
      if (acceptSoundRef.current) acceptSoundRef.current.unload();
      if (declineSoundRef.current) declineSoundRef.current.unload();
    };
  }, []);

  useEffect(() => {
    if (callState === 'incoming' && !ringtoneRef.current) {
      ringtoneRef.current = new Howl({
        src: ['/sounds/ringtone.mp3'],
        loop: true,
        volume: 0.5
      });
      ringtoneRef.current.play();
    }

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
    };
  }, [callState]);

  const handleAcceptCall = async () => {
    try {
      await connect();
      
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
      if (acceptSoundRef.current) {
        acceptSoundRef.current.play();
      }

      acceptCall();

      setTimeout(() => {
        startRecording().catch(error => {
          console.error('Ses kaydı başlatılamadı:', error);
          toast({
            title: "Mikrofon hatası",
            description: "Ses kaydı başlatılamadı. Lütfen mikrofon izinlerini kontrol edin.",
            variant: "destructive",
          });
        });
      }, 1000);

      toast({
        title: "Bağlantı başarılı",
        description: "Koaly ile konuşmaya başlayabilirsiniz",
      });
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      toast({
        title: "Bağlantı hatası",
        description: "Koaly ile bağlantı kurulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
    if (declineSoundRef.current) {
      declineSoundRef.current.play();
    }
    stopRecording();
    endCall();
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setUserInput('');
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => {}}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" />
            </div>
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-[375px] overflow-hidden align-middle transition-all transform">
                <div className="relative bg-black rounded-[50px] p-3 shadow-2xl border-[14px] border-black min-h-[812px] overflow-hidden">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[160px] h-[34px] bg-black z-50">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[80px] h-[24px] bg-black rounded-b-[24px] flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-black border-2 border-gray-800"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                    </div>
                  </div>

                  <div className="relative bg-transparent text-white px-6 py-2 flex justify-between items-center z-40">
                    <div className="text-sm font-medium">{currentTime}</div>
                    <div className="flex items-center gap-2">
                      <Wifi size={14} />
                      <Battery size={16} className="rotate-90" />
                    </div>
                  </div>

                  <div className="bg-black h-full relative rounded-[38px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black rounded-[38px]"></div>

                    <div className="relative z-10 p-4 flex flex-col h-full pb-32">
                      <div className="text-center text-white mb-8">
                        <h2 className="text-2xl font-semibold mb-1">
                          {callState === 'incoming' ? 'Koaly' : 'Koaly ile Konuşma'}
                        </h2>
                        <p className="text-sm text-gray-400">
                          {callState === 'incoming' ? 'Koaly seninle konuşmak istiyor' : 'Sesli Pratik'}
                        </p>
                      </div>

                      <div className={`flex-1 flex items-center justify-center mb-8 transition-all duration-300 ${callState === 'connected' ? 'translate-y-[-50px] scale-75' : ''}`}>
                        <div className="relative">
                          <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center">
                            <div className="w-40 h-40">
                              <AnimatedKoaly className={`w-full h-full transition-transform duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`} />
                            </div>
                          </div>
                          {callState === 'connected' && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                              {isRecording ? 'Dinliyor...' : (isSpeaking ? 'Konuşuyor' : 'HD')}
                            </div>
                          )}
                        </div>
                      </div>

                      {callState === 'incoming' ? (
                        <div className="space-y-6">
                          <p className="text-center text-gray-400 text-sm">
                            Koaly seninle pratik yapmak istiyor
                          </p>
                          
                          <div className="flex justify-center items-end gap-8">
                            <button
                              onClick={handleEndCall}
                              className="flex flex-col items-center"
                            >
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-2 hover:bg-red-700 transition-colors">
                                <span className="transform rotate-135 text-2xl">📞</span>
                              </div>
                              <span className="text-white text-sm">Reddet</span>
                            </button>
                            <button
                              onClick={handleAcceptCall}
                              className="flex flex-col items-center"
                            >
                              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-2 hover:bg-green-700 transition-colors">
                                <span className="text-2xl">📞</span>
                              </div>
                              <span className="text-white text-sm">Kabul Et</span>
                            </button>
                          </div>
                        </div>
                      ) : callState === 'connected' && (
                        <>
                          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 mb-4 h-48 overflow-y-auto">
                            <div className="space-y-3">
                              {messages.map((msg, index) => (
                                <div
                                  key={index}
                                  className={`flex ${
                                    msg.isUser ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                      msg.isUser
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-gray-700 text-white rounded-tl-none'
                                    } transition-all duration-200 hover:scale-[1.02]`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          </div>

                          <button
                            onClick={toggleSpeakingSpeed}
                            className={`mb-4 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                              isSpeakingSlow
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                            disabled={isSpeaking}
                          >
                            {isSpeakingSlow ? 'Normal Hızda Konuş' : 'Yavaş Konuş'}
                          </button>

                          <div className="flex gap-3 mb-6">
                            <input
                              type="text"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="flex-1 bg-gray-800/50 backdrop-blur-sm text-white border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Mesajınızı yazın..."
                            />
                            <button
                              onClick={handleSendMessage}
                              className="bg-blue-600 text-white rounded-2xl px-6 py-3 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Gönder
                            </button>
                          </div>

                          <CallControls
                            isMuted={isMuted}
                            isVideoOn={isVideoOn}
                            isRecording={isRecording}
                            onToggleMute={toggleMute}
                            onToggleVideo={toggleVideo}
                            onToggleRecording={handleRecordingToggle}
                            onEndCall={handleEndCall}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[140px] h-[5px] bg-gray-600/30 rounded-full z-50"></div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
