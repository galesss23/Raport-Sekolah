import React, { useRef, useState } from 'react';
import { Save, Upload, School } from 'lucide-react';
import { SchoolSettings } from '../types';

interface SettingsViewProps {
  settings: SchoolSettings;
  onSave: (settings: SchoolSettings) => void;
}

export function SettingsView({ settings, onSave }: SettingsViewProps) {
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Pengaturan berhasil disimpan!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6 flex-1 h-full overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
      <header className="shrink-0 mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Pengaturan Sekolah</h2>
        <p className="text-sm text-slate-500">Sesuaikan data instansi untuk keperluan kop raport dan tanda tangan.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-4">
              <label className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 w-full text-center uppercase tracking-wider">Logo Instansi</label>
              <div 
                className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 relative overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">Upload Logo</span>
                  </div>
                )}
                {formData.logoUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Ganti Logo</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              {formData.logoUrl && (
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                >
                  Hapus Logo
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nama Sekolah</label>
                <div className="relative">
                  <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.schoolName}
                    onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Alamat Sekolah</label>
                <textarea 
                  value={formData.schoolAddress}
                  onChange={e => setFormData(prev => ({ ...prev, schoolAddress: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all resize-none"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nama Kepala Sekolah</label>
                  <input 
                    type="text" 
                    value={formData.headmasterName}
                    onChange={e => setFormData(prev => ({ ...prev, headmasterName: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">NIP Kepala Sekolah</label>
                  <input 
                    type="text" 
                    value={formData.headmasterNip}
                    onChange={e => setFormData(prev => ({ ...prev, headmasterNip: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all text-sm"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
