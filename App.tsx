
import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, SettingsIcon, XIcon, BrandLogo } from './components/Icons';
import SettingsModal from './components/SettingsModal';
import { getPlayerSource, isValidVideoLink } from './utils/videoUtils';
import { StorageKeys } from './types';

const DEFAULT_VIDEO_URL = `<iframe
  src="https://player.cloudinary.com/embed/?cloud_name=djthxc5gz&public_id=TV_Pixel_Juli_webm_fhq8cp"
  width="640"
  height="360" 
  style="height: auto; width: 100%; aspect-ratio: 640 / 360;"
  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
  allowfullscreen
  frameborder="0"
></iframe>`;

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>(DEFAULT_VIDEO_URL);
  const [loopEnabled, setLoopEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize from local storage
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

    // Auto-focus play button for TV remote users
    setTimeout(() => playButtonRef.current?.focus(), 500);
  }, []);

  const handleSaveSettings = (url: string, loop: boolean) => {
    setVideoUrl(url);
    setLoopEnabled(loop);
    localStorage.setItem(StorageKeys.VIDEO_SOURCE, url);
    localStorage.setItem(StorageKeys.VIDEO_LOOP, String(loop));
    setIsPlaying(false);
    // Refocus after closing settings
    setTimeout(() => playButtonRef.current?.focus(), 100);
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
    
    // Attempt fullscreen for immersive TV experience
    setTimeout(() => {
      requestFullscreen();
    }, 100);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsPlaying(false);
    setTimeout(() => playButtonRef.current?.focus(), 100);
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
    <div className="h-screen w-screen relative flex flex-col items-center justify-center overflow-hidden selection:bg-[#0c7565] selection:text-white bg-black">
      {/* Immersive Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0c7565]/15 via-[#020202] to-black"></div>
      
      {!isPlaying && (
        <>
          <header className="fixed top-0 left-0 right-0 p-12 flex justify-between items-center z-40 animate-in fade-in duration-1000">
            <div className="flex items-center gap-6">
              <BrandLogo className="h-16 w-16 text-[#0c7565]" />
              <div>
                <h1 className="text-4xl font-black tracking-tight leading-none uppercase">
                  Pixel <span className="text-[#0c7565]">Barbershop</span>
                </h1>
                <p className="text-sm text-gray-500 uppercase tracking-[0.3em] mt-2">Display Engine v2.0</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-5 glass rounded-3xl hover:bg-white/10 transition-all hover:scale-110 focus:bg-[#0c7565]/20 border border-white/10 group"
              aria-label="Settings"
            >
              <SettingsIcon className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </header>

          <main className="w-full flex flex-col items-center justify-center mt-20">
            <div className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#0c7565] rounded-full blur-[120px] opacity-30 animate-pulse"></div>
                
                <button
                  ref={playButtonRef}
                  onClick={togglePlay}
                  className="play-pulse relative z-10 w-64 h-64 bg-white/5 border-2 border-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 focus:border-[#0c7565] focus:bg-[#0c7565]/20 group"
                >
                  <PlayIcon className="w-32 h-32 translate-x-2 text-white group-hover:text-[#0c7565] transition-colors" />
                </button>
              </div>

              <div className="space-y-6">
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
                  READY <span className="text-[#0c7565]">TO PLAY</span>
                </h2>
                <div className="flex items-center justify-center gap-4 py-2 px-6 bg-white/5 border border-white/10 rounded-full inline-flex mx-auto">
                  <div className="w-3 h-3 bg-[#0c7565] rounded-full animate-ping"></div>
                  <p className="text-gray-300 text-2xl font-medium tracking-wide">
                    {loopEnabled ? "AUTO-LOOP AKTIF" : "SINGLE PLAY"}
                  </p>
                </div>
              </div>
            </div>
          </main>

          <footer className="fixed bottom-12 left-0 right-0 text-center animate-in fade-in duration-1000 opacity-40">
            <p className="text-[#0c7565] text-sm font-black uppercase tracking-[0.5em]">
              SISTEM TAMPILAN PROFESIONAL PIXEL BARBERSHOP
            </p>
          </footer>
        </>
      )}

      {isPlaying && (
        <div 
          ref={playerContainerRef}
          className="w-full h-full bg-black flex items-center justify-center relative animate-in zoom-in-95 duration-700 overflow-hidden"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="w-24 h-24 border-8 border-[#0c7565]/20 border-t-[#0c7565] rounded-full animate-spin"></div>
              <p className="absolute mt-40 text-[#0c7565] font-bold text-2xl tracking-widest animate-pulse">MEMUAT VIDEO...</p>
            </div>
          )}
          
          {source ? (
            source.type === 'youtube' ? (
              <iframe
                src={source.url}
                className="w-full h-full border-none pointer-events-auto"
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                onLoad={() => setIsLoading(false)}
                title="Pixel Barbershop Player"
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
            <div className="text-center p-12">
              <p className="text-red-500 text-3xl font-bold mb-8">Video tidak dapat dimuat.</p>
              <button onClick={exitFullscreen} className="px-10 py-5 bg-[#0c7565] rounded-2xl text-white text-2xl font-black uppercase focus:scale-110">Kembali</button>
            </div>
          )}
          
          <button
            onClick={exitFullscreen}
            className="absolute top-10 right-10 p-5 bg-black/50 hover:bg-[#0c7565] rounded-3xl text-white backdrop-blur-2xl transition-all opacity-0 hover:opacity-100 focus:opacity-100 z-50 border border-white/20"
          >
            <XIcon className="w-10 h-10" />
          </button>
        </div>
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
