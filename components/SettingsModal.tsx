
import React, { useState } from 'react';
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

  const handleSave = () => {
    if (!url) {
      setError('Masukkan link video Cloudinary atau YouTube');
      return;
    }
    if (!isValidVideoLink(url)) {
      setError('Format tidak didukung. Gunakan link Cloudinary atau YouTube.');
      return;
    }
    onSave(url, loop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass rounded-2xl p-6 shadow-2xl relative border border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="p-2 bg-[#0c7565]/20 rounded-lg">
            <SettingsIcon className="w-5 h-5 text-[#0c7565]" />
          </span>
          Konfigurasi
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Video Source (Cloudinary / YouTube)
            </label>
            <textarea
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder='Paste link video di sini...'
              className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0c7565] transition-all text-sm h-24 resize-none text-white`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer" onClick={() => setLoop(!loop)}>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Auto-Loop</span>
              <span className="text-xs text-gray-500">Video akan berputar terus-menerus</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${loop ? 'bg-[#0c7565]' : 'bg-gray-700'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${loop ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div className="p-4 bg-[#0c7565]/10 border border-[#0c7565]/20 rounded-xl flex gap-3">
            <InfoIcon className="w-5 h-5 text-[#0c7565] shrink-0" />
            <p className="text-xs text-[#0c7565]/90 leading-relaxed">
              Pastikan link bersifat publik untuk akses tanpa hambatan di layar penuh.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#0c7565] hover:bg-[#0a6053] text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-[#0c7565]/20 active:scale-95"
          >
            Terapkan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
