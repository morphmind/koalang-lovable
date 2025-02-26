import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';

type KoalyState = 'idle' | 'talking' | 'listening' | 'happy' | 'thinking';
type CallState = 'idle' | 'incoming' | 'connected' | 'ended';

interface VideoCallState {
  isOpen: boolean;
  callState: CallState;
  isMuted: boolean;
  isVideoOn: boolean;
  koalyState: KoalyState;
  currentMessage: string;
  conversation: string[];
}

type VideoCallAction =
  | { type: 'OPEN_CALL' }
  | { type: 'CLOSE_CALL' }
  | { type: 'SET_CALL_STATE'; payload: CallState }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_VIDEO' }
  | { type: 'SET_KOALY_STATE'; payload: KoalyState }
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'ADD_TO_CONVERSATION'; payload: string };

const initialState: VideoCallState = {
  isOpen: false,
  callState: 'idle',
  isMuted: false,
  isVideoOn: true,
  koalyState: 'idle',
  currentMessage: '',
  conversation: [],
};

function videoCallReducer(state: VideoCallState, action: VideoCallAction): VideoCallState {
  switch (action.type) {
    case 'OPEN_CALL':
      return { ...state, isOpen: true, callState: 'incoming' };
    case 'CLOSE_CALL':
      return { ...initialState };
    case 'SET_CALL_STATE':
      return { ...state, callState: action.payload };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_VIDEO':
      return { ...state, isVideoOn: !state.isVideoOn };
    case 'SET_KOALY_STATE':
      return { ...state, koalyState: action.payload };
    case 'SET_MESSAGE':
      return { ...state, currentMessage: action.payload };
    case 'ADD_TO_CONVERSATION':
      return {
        ...state,
        conversation: [...state.conversation, action.payload],
      };
    default:
      return state;
  }
}

interface VideoCallContextType extends VideoCallState {
  startCall: () => void;
  endCall: () => void;
  acceptCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  setKoalyState: (state: KoalyState) => void;
  setMessage: (message: string) => void;
  addToConversation: (message: string) => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(videoCallReducer, initialState);

  const startCall = useCallback(() => {
    console.log("[VideoCallContext] startCall çağrıldı");
    
    dispatch({ type: 'OPEN_CALL' });
  }, []);

  const endCall = useCallback(() => {
    dispatch({ type: 'CLOSE_CALL' });
  }, []);

  const acceptCall = useCallback(() => {
    dispatch({ type: 'SET_CALL_STATE', payload: 'connected' });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);

  const toggleVideo = useCallback(() => {
    dispatch({ type: 'TOGGLE_VIDEO' });
  }, []);

  const setKoalyState = useCallback((state: KoalyState) => {
    dispatch({ type: 'SET_KOALY_STATE', payload: state });
  }, []);

  const setMessage = useCallback((message: string) => {
    dispatch({ type: 'SET_MESSAGE', payload: message });
  }, []);

  const addToConversation = useCallback((message: string) => {
    dispatch({ type: 'ADD_TO_CONVERSATION', payload: message });
  }, []);

  // Global event listener ekleyelim
  useEffect(() => {
    const handleGlobalStartCall = () => {
      console.log("[VideoCallContext] Global startCall olayı alındı");
      if (state.callState === 'idle') {
        startCall();
      }
    };
    
    window.addEventListener('global-start-call', handleGlobalStartCall);
    
    return () => {
      window.removeEventListener('global-start-call', handleGlobalStartCall);
    };
  }, [state.callState, startCall]); // startCall dependency olarak eklenmeyecek, çünkü bu sonsuz döngü oluşturabilir

  const value = {
    ...state,
    startCall,
    endCall,
    acceptCall,
    toggleMute,
    toggleVideo,
    setKoalyState,
    setMessage,
    addToConversation,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (context === undefined) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};
