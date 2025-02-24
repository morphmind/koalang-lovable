import React, { useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useVideoCall } from '../context/VideoCallContext';
import { CallControls } from './CallControls';
import { Howl } from 'howler';
import { Phone, PhoneOff, MessageSquare } from 'lucide-react';
import { AnimatedKoaly } from './AnimatedKoaly';
import { useRealtimeChat } from '../../../hooks/useRealtimeChat';
import { useToast } from '@/components/ui/use-toast';

export const VideoCallModal: React.FC = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const {
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
      setIsConnecting(true);
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
        setIsConnecting(false);
        
        sendMessage("Merhaba! Ben Koaly, sizinle pratik yapmaktan mutluluk duyacağım. Nasıl yardımcı olabilirim?");
      }, 2000);

      toast({
        title: "Bağlantı başarılı",
        description: "Koaly ile konuşmaya başlayabilirsiniz",
      });
    } catch (error) {
      setIsConnecting(false);
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
    <Transition appear show={callState !== 'idle'} as={React.Fragment}>
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
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
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
                <div className="relative bg-[#1A1F2C] rounded-[50px] p-3 shadow-2xl border-[14px] border-[#1A1F2C] min-h-[812px] overflow-hidden">
                  {/* Notch Area */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[160px] h-[34px] bg-[#1A1F2C] z-50">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[80px] h-[24px] bg-[#1A1F2C] rounded-b-[24px] flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#1A1F2C] border-2 border-gray-800"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                    </div>
                  </div>

                  {/* Status Bar - Sadece saat gösteriliyor */}
                  <div className="relative bg-transparent text-white px-6 py-2 flex justify-center items-center z-40">
                    <div className="text-sm font-medium">{currentTime}</div>
                  </div>

                  <div className="bg-gradient-to-b from-[#1A1F2C] to-[#2C3444] h-full relative rounded-[38px] overflow-hidden">
                    <div className="relative z-10 p-4 flex flex-col h-full pb-32">
                      {/* Call Header */}
                      <div className="text-center text-white mb-8">
                        <h2 className="text-2xl font-semibold mb-2">
                          {callState === 'incoming' ? 'Koaly Arıyor' : 'Koaly ile Konuşma'}
                        </h2>
                        <p className="text-sm text-[#9b87f5]">
                          {callState === 'incoming' ? 'Sesli pratik yapmak istiyor' : 'Sesli Pratik'}
                        </p>
                      </div>

                      {/* Koaly Avatar */}
                      <div className={`flex-1 flex items-center justify-center mb-8 transition-all duration-300 ${callState === 'connected' ? 'translate-y-[-30px] scale-75' : ''}`}>
                        <div className="relative">
                          <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-b from-[#9b87f5] to-[#7E69AB] flex items-center justify-center shadow-2xl">
                            <div className="w-40 h-40">
                              <AnimatedKoaly className={`w-full h-full transition-transform duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`} />
                            </div>
                          </div>
                          {callState === 'connected' && (
                            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                              ${isRecording ? 'bg-[#9b87f5]' : 'bg-[#7E69AB]'} 
                              text-white text-xs px-4 py-1.5 rounded-full transition-all duration-300 shadow-lg`}>
                              {isRecording && !isSpeaking ? 'Dinliyor...' : (isSpeaking ? 'Konuşuyor' : 'HD')}
                            </div>
                          )}
                        </div>
                      </div>

                      {callState === 'incoming' ? (
                        <div className="space-y-8 mt-auto">
                          <p className="text-center text-[#9b87f5] text-sm">
                            İngilizce konuşma pratiği yapmak için hazır mısın?
                          </p>
                          
                          <div className="flex justify-center items-center gap-8 pb-12">
                            {/* Reddet Butonu */}
                            <button
                              onClick={handleEndCall}
                              className="group flex flex-col items-center"
                            >
                              <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 
                                          hover:bg-red-500 transition-all duration-300 group-hover:scale-110 border border-red-500">
                                <PhoneOff className="w-7 h-7 text-red-500 group-hover:text-white transition-colors" />
                              </div>
                              <span className="text-white/80 text-sm group-hover:text-white transition-colors">Reddet</span>
                            </button>

                            {/* Kabul Et Butonu */}
                            <button
                              onClick={handleAcceptCall}
                              className="group flex flex-col items-center"
                              disabled={isConnecting}
                            >
                              <div className="w-16 h-16 bg-[#9b87f5]/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 
                                          hover:bg-[#9b87f5] transition-all duration-300 group-hover:scale-110 border border-[#9b87f5]">
                                <Phone className="w-7 h-7 text-[#9b87f5] group-hover:text-white transition-colors" />
                              </div>
                              <span className="text-white/80 text-sm group-hover:text-white transition-colors">
                                {isConnecting ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Bağlanıyor...</span>
                                  </div>
                                ) : (
                                  'Kabul Et'
                                )}
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : callState === 'connected' && (
                        <>
                          {/* Mesaj Alanı */}
                          <div className="bg-[#2C3444]/80 backdrop-blur-lg rounded-2xl p-4 mb-4 h-48 overflow-y-auto shadow-xl">
                            <div className="space-y-3">
                              {messages.map((msg, index) => (
                                <div
                                  key={index}
                                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                      msg.isUser
                                        ? 'bg-[#9b87f5] text-white rounded-tr-none'
                                        : 'bg-[#2C3444] text-white rounded-tl-none'
                                    } transition-all duration-200 hover:scale-[1.02] shadow-lg`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          </div>

                          {/* Konuşma Hızı Butonu */}
                          <button
                            onClick={toggleSpeakingSpeed}
                            className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 
                              ${isSpeakingSlow
                                ? 'bg-[#9b87f5] hover:bg-[#7E69AB]'
                                : 'bg-[#2C3444] hover:bg-[#3C4454]'
                              } text-white shadow-lg`}
                            disabled={isSpeaking}
                          >
                            {isSpeakingSlow ? 'Normal Hızda Konuş' : 'Yavaş Konuş'}
                          </button>

                          {/* Mesaj Gönderme Alanı - Yeniden Düzenlendi */}
                          <div className="flex flex-col gap-3 mb-6">
                            <input
                              type="text"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="w-full bg-[#2C3444]/50 backdrop-blur-sm text-white border border-white/10 rounded-xl px-4 py-3 
                                         focus:outline-none focus:ring-2 focus:ring-[#9b87f5] shadow-lg"
                              placeholder="Mesajınızı yazın..."
                            />
                            <button
                              onClick={handleSendMessage}
                              className="w-full bg-[#9b87f5] text-white rounded-xl px-6 py-3 hover:bg-[#7E69AB] transition-colors 
                                         focus:outline-none focus:ring-2 focus:ring-[#9b87f5] shadow-lg flex items-center justify-center gap-2"
                            >
                              <MessageSquare size={18} />
                              <span>Gönder</span>
                            </button>
                          </div>

                          {/* Call Controls */}
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

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[140px] h-[5px] bg-white/10 rounded-full z-50"></div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
