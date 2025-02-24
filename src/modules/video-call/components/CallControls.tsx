
import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Mic as MicIcon } from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  isRecording: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isVideoOn,
  isRecording,
  onToggleMute,
  onToggleVideo,
  onToggleRecording,
  onEndCall,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0">
      <div className="max-w-[375px] mx-auto">
        <div className="bg-[#1A1F2C]/90 backdrop-blur-lg rounded-b-[38px] border-t border-white/5">
          <div className="grid grid-cols-4 gap-4 p-6">
            {/* Mikrofon kontrolü */}
            <button
              onClick={onToggleMute}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300
                            ${isMuted
                  ? 'bg-white/10 text-white'
                  : 'bg-white/20 text-white'
                }`}>
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </div>
              <span className="text-white/80 text-xs">
                {isMuted ? 'Sesi Aç' : 'Sustur'}
              </span>
            </button>

            {/* Video kontrolü */}
            <button
              onClick={onToggleVideo}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300
                            ${!isVideoOn
                  ? 'bg-white/10 text-white'
                  : 'bg-white/20 text-white'
                }`}>
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
              </div>
              <span className="text-white/80 text-xs">
                {isVideoOn ? 'Video Kapat' : 'Video Aç'}
              </span>
            </button>

            {/* Kayıt kontrolü */}
            <button
              onClick={onToggleRecording}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300
                            ${isRecording
                  ? 'bg-[#9b87f5] text-white'
                  : 'bg-white/20 text-white'
                }`}>
                <MicIcon size={24} className={isRecording ? 'animate-pulse' : ''} />
              </div>
              <span className="text-white/80 text-xs">
                {isRecording ? 'Durdur' : 'Konuş'}
              </span>
            </button>

            {/* Aramayı sonlandır */}
            <button
              onClick={onEndCall}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center mb-1.5 hover:bg-red-600 transition-all duration-300">
                <PhoneOff size={24} className="text-white" />
              </div>
              <span className="text-white/80 text-xs">Sonlandır</span>
            </button>
          </div>

          {/* Home indicator için ekstra padding */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};
