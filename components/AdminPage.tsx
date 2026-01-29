
import React, { useState, useEffect } from 'react';
import { supabase, TABLE_NAME } from '../utils/supabase';
import { VideoItem } from '../types';
import { XIcon, PlusIcon, TrashIcon, EditIcon, SettingsIcon, LockIcon, InfoIcon } from './Icons';

interface AdminPageProps {
  onRefresh: () => void;
  onClose: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onRefresh, onClose }) => {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Forms States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '' });
  
  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Status States
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchVideos();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchVideos();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (err: any) {
      showStatus("Gagal memuat data: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (text: string, type: 'error' | 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login Gagal: " + error.message);
    setAuthLoading(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.url) return;
    setLoading(true);

    try {
      if (editingVideo) {
        const { error } = await supabase
          .from(TABLE_NAME)
          .update({ title: formData.title, url: formData.url })
          .eq('id', editingVideo.id);

        if (error) throw error;
        showStatus("Video berhasil diperbarui!", 'success');
      } else {
        const id = `vid_${Date.now()}`;
        const { error } = await supabase
          .from(TABLE_NAME)
          .insert([{ id, title: formData.title, url: formData.url, loop: true }]);

        if (error) throw error;
        showStatus("Video baru berhasil ditambahkan!", 'success');
      }

      setFormData({ title: '', url: '' });
      setShowAddForm(false);
      setEditingVideo(null);
      await fetchVideos();
      onRefresh();
    } catch (err: any) {
      showStatus(`Gagal Menyimpan: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setProcessingId(id);

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;

      showStatus("Data berhasil dihapus.", 'success');
      setVideos(prev => prev.filter(v => v.id !== id));
      onRefresh();
    } catch (err: any) {
      showStatus("Gagal hapus: " + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const openEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setFormData({ title: video.title, url: video.url });
    setShowAddForm(true);
  };

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md glass p-12 rounded-[40px] border border-white/10 space-y-10">
          <div className="text-center space-y-4">
            <LockIcon className="w-20 h-20 text-[#0c7565] mx-auto" />
            <h2 className="text-4xl font-black uppercase text-white">Admin <span className="text-[#0c7565]">Auth</span></h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:border-[#0c7565] outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:border-[#0c7565] outline-none" required />
            <button className="w-full bg-[#0c7565] py-5 rounded-2xl font-black text-white hover:bg-[#0a6053] transition-all uppercase">{authLoading ? 'Wait...' : 'Login'}</button>
          </form>
          <button onClick={onClose} className="w-full text-gray-500 font-bold uppercase text-xs">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#020202] flex flex-col animate-in fade-in duration-300">
      <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#050505]">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <SettingsIcon className="w-8 h-8 text-[#0c7565]" />
            <h2 className="text-2xl font-black uppercase text-white tracking-tighter">System <span className="text-[#0c7565]">Manager</span></h2>
          </div>
          <p className="text-[10px] text-gray-600 font-mono tracking-widest mt-1 uppercase">Live Table: {TABLE_NAME}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => supabase.auth.signOut()} className="px-6 py-2 glass rounded-xl text-red-500 font-bold text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">Logout</button>
          <button onClick={onClose} className="p-3 glass rounded-xl text-white hover:bg-white/10 transition-colors"><XIcon className="w-6 h-6" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full space-y-6">
        {statusMsg && (
          <div className={`p-6 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 ${statusMsg.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-[#0c7565]/10 border-[#0c7565]/50 text-[#0c7565]'}`}>
            <div className={`w-3 h-3 rounded-full ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-[#0c7565]'} animate-pulse`}></div>
            <p className="font-bold uppercase text-xs tracking-widest">{statusMsg.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="glass p-6 rounded-[35px] flex items-center justify-between border border-white/5 hover:border-[#0c7565]/30 transition-all group">
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-xl font-black text-white uppercase truncate">{video.title}</h3>
                <p className="text-[#0c7565] text-[10px] font-mono opacity-50 truncate">{video.url}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEdit(video)} className="p-4 rounded-2xl bg-white/5 text-white hover:bg-[#0c7565] transition-all"><EditIcon className="w-5 h-5" /></button>
                <button 
                  disabled={processingId === video.id}
                  onClick={() => setConfirmDeleteId(video.id)} 
                  className={`p-4 rounded-2xl transition-all ${processingId === video.id ? 'bg-white text-red-600 animate-pulse' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={() => { setEditingVideo(null); setFormData({title:'', url:''}); setShowAddForm(true); }} className="w-full py-16 border-2 border-dashed border-white/10 rounded-[45px] flex flex-col items-center justify-center gap-4 text-gray-500 hover:border-[#0c7565] hover:text-[#0c7565] transition-all bg-white/[0.01] group">
            <PlusIcon className="w-10 h-10 group-hover:scale-125 transition-transform" />
            <span className="font-black uppercase tracking-[0.4em] text-[11px]">Deploy New Stream</span>
          </button>
        </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md glass p-10 rounded-[40px] border border-red-500/20 text-center space-y-8 shadow-2xl animate-in zoom-in-95">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <TrashIcon className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase text-white">Hapus Konten?</h3>
              <p className="text-gray-400 text-sm">Tindakan ini tidak dapat dibatalkan. Video akan dihapus selamanya dari database.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={executeDelete} className="flex-1 bg-red-500 py-4 rounded-2xl font-black uppercase text-white hover:bg-red-600 transition-all">Ya, Hapus</button>
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-white/10 py-4 rounded-2xl font-black uppercase text-white hover:bg-white/20 transition-all">Batal</button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="w-full max-w-xl glass p-12 rounded-[50px] border border-white/10 space-y-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase text-white tracking-tighter">
                  {editingVideo ? 'Modify' : 'Create'} <span className="text-[#0c7565]">Broadcast</span>
                </h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-500" /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#0c7565] uppercase ml-4 tracking-widest">Video Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white text-lg focus:border-[#0c7565] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#0c7565] uppercase ml-4 tracking-widest">URL / Embed Code</label>
                <textarea value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white h-40 focus:border-[#0c7565] outline-none font-mono text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#0c7565] py-6 rounded-3xl font-black uppercase text-white hover:bg-[#0a6053] transition-all disabled:opacity-50">
                {loading ? 'Processing...' : (editingVideo ? 'Simpan Perubahan' : 'Deploy Video')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
