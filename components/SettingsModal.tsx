
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, InfoIcon, SettingsIcon } from './Icons';
import { isValidVideoLink } from '../utils/videoUtils';

interface SettingsModalProps {
  currentUrl: string;
  currentLoop: boolean;
  onSave: (url: string, loop: boolean) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentUrl, currentLoop, onSave, onClose }) => {
  const [url, setUrl] = useState(currentUrl);
  const [loop, setLoop] = useState(currentLoop);
  const [error, setError] = useState('');
  
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus close button on TV for easy exit
    closeButtonRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!url) {
      setError('Masukkan link video Cloudinary atau YouTube');
      return;
    }
    if (!isValidVideoLink(url)) {
      setError('Format tidak didukung.');
      return;
    }
    onSave(url, loop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl glass rounded-[40px] p-12 shadow-2xl relative border border-white/10 space-y-10">
        <button 
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-4 focus:bg-white/10 rounded-full"
        >
          <XIcon className="w-10 h-10" />
        </button>

        <h2 className="text-5xl font-black mb-8 flex items-center gap-6">
          <span className="p-4 bg-[#0c7565]/20 rounded-2xl">
            <SettingsIcon className="w-10 h-10 text-[#0c7565]" />
          </span>
          Sistem Pengaturan
        </h2>

        <div className="space-y-10">
          <div className="space-y-4">
            <label className="block text-xl font-bold text-gray-400 uppercase tracking-widest">
              Alamat Video (URL / Iframe)
            </label>
            <textarea
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder='Paste link video di sini...'
              className={`w-full bg-black/60 border-2 ${error ? 'border-red-500' : 'border-white/10'} rounded-3xl px-8 py-6 focus:border-[#0c7565] focus:outline-none transition-all text-xl h-48 resize-none text-white font-mono`}
            />
            {error && <p className="text-red-500 text-lg font-bold">{error}</p>}
          </div>

          <button 
            onClick={() => setLoop(!loop)}
            className={`w-full flex items-center justify-between p-8 border-2 rounded-3xl transition-all focus:bg-[#0c7565]/10 ${loop ? 'bg-[#0c7565]/10 border-[#0c7565]/50' : 'bg-white/5 border-white/10'}`}
          >
            <div className="flex flex-col text-left">
              <span className="text-3xl font-black text-white uppercase tracking-tight">Auto-Loop</span>
              <span className="text-xl text-gray-500 font-medium">Video akan berputar tanpa henti</span>
            </div>
            <div className={`w-20 h-10 rounded-full p-2 transition-colors duration-300 ${loop ? 'bg-[#0c7565]' : 'bg-gray-700'}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-xl transform transition-transform duration-300 ${loop ? 'translate-x-10' : 'translate-x-0'}`}></div>
            </div>
          </button>

          <div className="p-8 bg-[#0c7565]/10 border border-[#0c7565]/20 rounded-3xl flex items-start gap-6">
            <InfoIcon className="w-10 h-10 text-[#0c7565] shrink-0" />
            <p className="text-xl text-[#0c7565]/90 font-medium leading-normal">
              Gunakan Cloudinary Player atau YouTube Embed untuk hasil terbaik pada browser TV. Pastikan video memiliki status <strong>Publik</strong>.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#0c7565] hover:bg-[#0a6053] text-white text-3xl font-black py-8 rounded-3xl transition-all shadow-2xl shadow-[#0c7565]/30 active:scale-95 uppercase tracking-widest focus:scale-105"
          >
            Simpan & Tayangkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;