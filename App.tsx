
import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, BrandLogo, LockIcon, XIcon, InfoIcon } from './components/Icons';
import AdminPage from './components/AdminPage';
import { getPlayerSource } from './utils/videoUtils';
import { VideoItem, ViewState } from './types';
import { supabase, isSupabaseConfigured, TABLE_NAME } from './utils/supabase';

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('main');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLButtonElement>(null);

  const fetchVideos = async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setVideos(data);
      }
    } catch (err) {
      console.error("Database fetch error:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchVideos();
    }
    setTimeout(() => focusRef.current?.focus(), 500);
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center p-12 text-white">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black"></div>
        <div className="max-w-3xl w-full glass p-16 rounded-[50px] border border-red-500/20 space-y-12 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-red-500/10 rounded-3xl">
              <InfoIcon className="w-16 h-16 text-red-500" />
            </div>
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tight">Konfigurasi <span className="text-red-500">Dibutuhkan</span></h2>
              <p className="text-xl text-gray-500 mt-2">Variabel environment Supabase belum terdeteksi.</p>
            </div>
          </div>
          <div className="space-y-6 text-lg text-gray-400 leading-relaxed bg-white/5 p-8 rounded-3xl border border-white/5">
            <p>Pastikan variabel <span className="text-[#0c7565]">SUPABASE_URL</span> dan <span className="text-[#0c7565]">SUPABASE_ANON_KEY</span> sudah terpasang.</p>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-6 bg-white text-black text-xl font-black rounded-3xl uppercase tracking-widest hover:bg-gray-200 transition-all">Cek Ulang Koneksi</button>
        </div>
      </div>
    );
  }

  const playVideo = (video: VideoItem) => {
    setActiveVideo(video);
    setIsLoading(true);
    setCurrentView('player');
    setTimeout(() => {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    }, 100);
  };

  const stopPlayback = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setCurrentView('main');
    setActiveVideo(null);
    setTimeout(() => focusRef.current?.focus(), 100);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && currentView === 'player') {
        stopPlayback();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [currentView]);

  return (
    <div className="h-screen w-screen relative flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0c7565]/15 via-[#020202] to-black"></div>
      
      {currentView === 'main' && (
        <>
          <header className="fixed top-0 left-0 right-0 p-12 flex justify-between items-center z-40">
            <div className="flex items-center gap-6">
              <BrandLogo className="h-16 w-16 text-[#0c7565]" />
              <h1 className="text-4xl font-black uppercase tracking-tight">Pixel <span className="text-[#0c7565]">TV</span></h1>
            </div>
            <button onClick={() => setCurrentView('admin')} className="p-5 glass rounded-3xl hover:bg-[#0c7565] border border-white/10 group transition-all">
              <LockIcon className="w-10 h-10 text-gray-400 group-hover:text-white" />
            </button>
          </header>

          <main className="w-full flex-1 flex flex-col items-center justify-center p-20 mt-20">
            {isLoading ? (
              <div className="w-16 h-16 border-4 border-[#0c7565] border-t-transparent rounded-full animate-spin"></div>
            ) : videos.length === 0 ? (
              <div className="text-center animate-in fade-in duration-700">
                <p className="text-3xl text-gray-500 mb-8 font-light italic">Siaran belum dikonfigurasi.</p>
                <button onClick={() => setCurrentView('admin')} className="px-12 py-5 bg-[#0c7565] rounded-3xl font-black uppercase tracking-widest">Setup Dashboard</button>
              </div>
            ) : (
              <div className="w-full max-w-7xl animate-in slide-in-from-bottom-12">
                <h2 className="text-3xl font-black uppercase text-[#0c7565] mb-12 text-center tracking-[0.2em]">Saluran Aktif</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {videos.map((v, idx) => (
                    <button
                      key={v.id}
                      ref={idx === 0 ? focusRef : null}
                      onClick={() => playVideo(v)}
                      className="glass rounded-[40px] p-10 text-left border border-white/5 hover:border-[#0c7565] focus:bg-[#0c7565]/20 focus:scale-105 transition-all space-y-6 group"
                    >
                      <div className="w-16 h-16 bg-[#0c7565]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0c7565] transition-colors">
                        <PlayIcon className="w-8 h-8 text-[#0c7565] group-hover:text-white" />
                      </div>
                      <h3 className="text-2xl font-black uppercase truncate group-hover:text-white">{v.title}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {currentView === 'player' && activeVideo && (
        <div ref={playerContainerRef} className="w-full h-full bg-black flex items-center justify-center relative">
          {isLoading && <div className="absolute inset-0 flex items-center justify-center z-10 bg-black"><div className="w-16 h-16 border-4 border-[#0c7565] border-t-transparent rounded-full animate-spin"></div></div>}
          {(() => {
            const src = getPlayerSource(activeVideo.url, activeVideo.loop);
            return src?.type === 'youtube' ? (
              <iframe src={src.url} className="w-full h-full border-none" allow="autoplay; encrypted-media; fullscreen" onLoad={() => setIsLoading(false)}></iframe>
            ) : (
              <video src={src?.url} className="w-full h-full object-contain" controls autoPlay muted playsInline loop={activeVideo.loop} onLoadedData={() => setIsLoading(false)} />
            );
          })()}
          <button onClick={stopPlayback} className="absolute top-10 right-10 p-5 bg-black/50 rounded-3xl opacity-0 hover:opacity-100 focus:opacity-100 z-50 border border-white/20 transition-all"><XIcon className="w-10 h-10" /></button>
        </div>
      )}

      {currentView === 'admin' && (
        <AdminPage onRefresh={fetchVideos} onClose={() => { setCurrentView('main'); fetchVideos(); }} />
      )}
    </div>
  );
};

export default App;
