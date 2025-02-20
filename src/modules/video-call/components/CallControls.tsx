
import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

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
        <div className="bg-black/20 backdrop-blur-lg rounded-b-[38px]">
          <div className="grid grid-cols-4 gap-4 p-6">
            {/* Mikrofon kontrolü */}
            <button
              onClick={onToggleMute}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
                isMuted
                  ? 'bg-white/10 text-white'
                  : 'bg-white/30 text-white'
              }`}>
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </div>
              <span className="text-white text-xs">
                {isMuted ? 'Sesi Aç' : 'Sustur'}
              </span>
            </button>

            {/* Video kontrolü */}
            <button
              onClick={onToggleVideo}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
                !isVideoOn
                  ? 'bg-white/10 text-white'
                  : 'bg-white/30 text-white'
              }`}>
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
              </div>
              <span className="text-white text-xs">
                {isVideoOn ? 'Videoyu Kapat' : 'Videoyu Aç'}
              </span>
            </button>

            {/* Kayıt kontrolü */}
            <button
              onClick={onToggleRecording}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-white/30 text-white'
              }`}>
                <Mic size={24} className={isRecording ? 'animate-pulse' : ''} />
              </div>
              <span className="text-white text-xs">
                {isRecording ? 'Durdur' : 'Konuş'}
              </span>
            </button>

            {/* Aramayı sonlandır */}
            <button
              onClick={onEndCall}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center mb-1">
                <PhoneOff size={24} className="text-white" />
              </div>
              <span className="text-white text-xs">Sonlandır</span>
            </button>
          </div>

          {/* Alt çizgi */}
          <div className="h-[1px] bg-white/10"></div>
          
          {/* Home indicator için ekstra padding */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};
