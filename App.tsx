
import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, SettingsIcon, XIcon, InfoIcon, BrandLogo } from './components/Icons';
import SettingsModal from './components/SettingsModal';
import { getPlayerSource, isValidVideoLink } from './utils/videoUtils';
import { StorageKeys } from './types';

const DEFAULT_VIDEO_URL = 'https://res.cloudinary.com/djthxc5gz/video/upload/v1769485310/TV_Pixel_Juli-new_acio0x.mp4';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>(DEFAULT_VIDEO_URL);
  const [loopEnabled, setLoopEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLink = localStorage.getItem(StorageKeys.VIDEO_SOURCE);
    const savedLoop = localStorage.getItem(StorageKeys.VIDEO_LOOP);
    
    if (savedLink) {
      setVideoUrl(savedLink);
    } else {
      localStorage.setItem(StorageKeys.VIDEO_SOURCE, DEFAULT_VIDEO_URL);
    }
    
    if (savedLoop !== null) {
      setLoopEnabled(savedLoop === 'true');
    } else {
      localStorage.setItem(StorageKeys.VIDEO_LOOP, 'true');
    }
  }, []);

  const handleSaveSettings = (url: string, loop: boolean) => {
    setVideoUrl(url);
    setLoopEnabled(loop);
    localStorage.setItem(StorageKeys.VIDEO_SOURCE, url);
    localStorage.setItem(StorageKeys.VIDEO_LOOP, String(loop));
    setIsPlaying(false);
  };

  const requestFullscreen = async () => {
    if (playerContainerRef.current) {
      try {
        const elem = playerContainerRef.current;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    }
  };

  const togglePlay = () => {
    if (!videoUrl || !isValidVideoLink(videoUrl)) {
      setShowSettings(true);
      return;
    }
    setIsLoading(true);
    setIsPlaying(true);
    
    setTimeout(() => {
      requestFullscreen();
    }, 50);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPlaying) {
        setIsPlaying(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isPlaying]);

  const source = getPlayerSource(videoUrl, loopEnabled);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-[#0c7565] selection:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0c7565]/20 via-[#020202] to-black"></div>
      
      {!isPlaying && (
        <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-40 animate-in fade-in duration-700">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-10 w-10 text-[#0c7565]" />
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none uppercase">Pixel <span className="text-[#0c7565]">Barbershop</span></h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Premium Display Engine</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 glass rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95 group border border-white/10"
            title="Settings"
          >
            <SettingsIcon className="w-6 h-6 text-gray-400 group-hover:text-[#0c7565] transition-colors" />
          </button>
        </header>
      )}

      <main className="w-full h-full flex flex-col items-center justify-center">
        {!isPlaying ? (
          <div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-5xl px-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-[#0c7565] rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              
              <button
                onClick={togglePlay}
                className="relative z-10 w-40 h-40 md:w-56 md:h-56 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-90 hover:border-[#0c7565]/50 hover:bg-[#0c7565]/10 group"
              >
                <PlayIcon className="w-20 h-20 md:w-28 md:h-28 translate-x-1.5 text-white group-hover:text-[#0c7565] transition-colors" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                 <BrandLogo className="h-24 w-24 text-white" />
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase">
                Pixel <span className="text-[#0c7565]">Barbershop</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
                {videoUrl ? (
                  <>Layar siap tayang. {loopEnabled && <span className="text-[#0c7565] font-semibold tracking-wide">AUTO-LOOP AKTIF</span>}</>
                ) : (
                  "Masukkan URL video promosi barbershop Anda di menu pengaturan."
                )}
              </p>
            </div>
          </div>
        ) : (
          <div 
            ref={playerContainerRef}
            className="w-full h-full max-w-none bg-black flex items-center justify-center relative animate-in zoom-in-95 duration-700"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                <div className="w-16 h-16 border-4 border-[#0c7565]/20 border-t-[#0c7565] rounded-full animate-spin"></div>
              </div>
            )}
            
            {source ? (
              source.type === 'youtube' ? (
                <iframe
                  src={source.url}
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  onLoad={() => setIsLoading(false)}
                  title="Player"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={source.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  playsInline
                  loop={loopEnabled}
                  onLoadedData={() => setIsLoading(false)}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-red-400 font-medium mb-4 text-xl">Sumber video tidak valid.</p>
                <button onClick={() => { exitFullscreen(); setShowSettings(true); }} className="px-6 py-3 bg-[#0c7565] rounded-xl text-white font-bold hover:bg-[#0a6053] transition-all">Ganti Link</button>
              </div>
            )}
            
            <button
              onClick={exitFullscreen}
              className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-[#0c7565] rounded-2xl text-white backdrop-blur-xl transition-all opacity-0 group-hover:opacity-100 z-50 border border-white/10"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>

      {!isPlaying && (
        <footer className="fixed bottom-8 left-0 right-0 text-center pointer-events-none animate-in fade-in duration-1000">
          <p className="text-[#0c7565] text-[11px] font-black uppercase tracking-[0.4em] opacity-50">
            Professional Barbershop Display Solution
          </p>
        </footer>
      )}

      {showSettings && (
        <SettingsModal
          currentUrl={videoUrl}
          currentLoop={loopEnabled}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
