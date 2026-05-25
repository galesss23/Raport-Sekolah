import React, { useState, useEffect } from 'react';
import { StudentReport, DEFAULT_SUBJECTS, Grade, Extracurricular } from '../types';
import { getPredicate, cn } from '../lib/utils';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

interface FormViewProps {
  initialData?: StudentReport | null;
  onSave: (data: Omit<StudentReport, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function FormView({ initialData, onSave, onCancel }: FormViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    nisn: '',
    className: '',
    semester: 'Ganjil' as 'Ganjil' | 'Genap',
    academicYear: '2023/2024',
    notes: '',
  });

  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState({ sick: 0, permission: 0, absent: 0 });
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        nis: initialData.nis,
        nisn: initialData.nisn,
        className: initialData.className,
        semester: initialData.semester,
        academicYear: initialData.academicYear,
        notes: initialData.notes,
      });
      setGrades(initialData.grades);
      setAttendance(initialData.attendance);
      setExtracurriculars(initialData.extracurriculars || []);
    } else {
      setGrades(DEFAULT_SUBJECTS.map(sub => ({
        subject: sub,
        kkm: 75,
        score: 0,
        predicate: 'E',
        description: ''
      })));
    }
  }, [initialData]);

  const handleGradeChange = (index: number, field: keyof Grade, value: any) => {
    const newGrades = [...grades];
    if (field === 'score') {
      const numValue = Math.min(Math.max(Number(value) || 0, 0), 100);
      newGrades[index].score = numValue;
      newGrades[index].predicate = getPredicate(numValue);
      // Auto description mapping could go here
    } else {
      (newGrades[index][field] as any) = value;
    }
    setGrades(newGrades);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      grades,
      attendance,
      extracurriculars
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-4 mb-6 pt-4">
        <button onClick={onCancel} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {initialData ? 'Edit Data Raport' : 'Input Raport Baru'}
          </h2>
          <p className="text-slate-500 text-sm block">Lengkapi data profil dan nilai siswa di bawah ini.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Siswa */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4 mb-5 uppercase tracking-wider">Data Profil Siswa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NIS</label>
              <input required type="text" value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NISN</label>
              <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas</label>
              <input required type="text" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} placeholder="Contoh: VII-A" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</label>
              <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value as any})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-white">
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun Ajaran</label>
              <input required type="text" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} placeholder="2023/2024" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all" />
            </div>
          </div>
        </div>

        {/* Nilai Mata Pelajaran */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Nilai Akademik (Pengetahuan & Keterampilan)</h3>
          </div>
          
          <div className="space-y-4">
            {grades.map((grade, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl">
                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs text-slate-500 mb-1 block">Mata Pelajaran</label>
                  <input type="text" value={grade.subject} onChange={e => handleGradeChange(index, 'subject', e.target.value)} className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">KKM</label>
                  <input type="number" value={grade.kkm} onChange={e => handleGradeChange(index, 'kkm', e.target.value)} className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Nilai</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" value={grade.score || ''} onChange={e => handleGradeChange(index, 'score', e.target.value)} className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-indigo-600 pr-8" placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{grade.predicate}</span>
                  </div>
                </div>
                <div className="col-span-11 md:col-span-3">
                  <label className="text-xs text-slate-500 mb-1 block">Deskripsi Kemajuan</label>
                  <input type="text" value={grade.description} onChange={e => handleGradeChange(index, 'description', e.target.value)} className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Mampu menguasai materi..." />
                </div>
                <div className="col-span-1 md:col-span-1 flex justify-end">
                  <button type="button" onClick={() => setGrades(grades.filter((_, i) => i !== index))} className="p-2 mt-5 text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={() => setGrades([...grades, { subject: '', kkm: 75, score: 0, predicate: 'E', description: '' }])}
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Mata Pelajaran
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-min">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4 mb-5 uppercase tracking-wider">Ketidakhadiran</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Sakit</span>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={attendance.sick} onChange={e => setAttendance({...attendance, sick: parseInt(e.target.value) || 0})} className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center" />
                  <span className="text-sm text-slate-500">hari</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Izin</span>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={attendance.permission} onChange={e => setAttendance({...attendance, permission: parseInt(e.target.value) || 0})} className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center" />
                  <span className="text-sm text-slate-500">hari</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Tanpa Keterangan</span>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={attendance.absent} onChange={e => setAttendance({...attendance, absent: parseInt(e.target.value) || 0})} className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center" />
                  <span className="text-sm text-slate-500">hari</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4 mb-5 mt-8 uppercase tracking-wider">Catatan Wali Kelas</h3>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              rows={4}
              placeholder="Tingkatkan motivasi belajarmu..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-sm transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-min">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4 mb-5 uppercase tracking-wider">Ekstrakurikuler</h3>
            <div className="space-y-4">
              {extracurriculars.map((ext, idx) => (
                 <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative pr-10">
                   <input type="text" placeholder="Nama Kegiatan (Pramuka, dll)" value={ext.name} onChange={e => {
                     const newExts = [...extracurriculars];
                     newExts[idx].name = e.target.value;
                     setExtracurriculars(newExts);
                   }} className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2" />
                   <div className="flex gap-2">
                    <select value={ext.predicate} onChange={e => {
                     const newExts = [...extracurriculars];
                     newExts[idx].predicate = e.target.value;
                     setExtracurriculars(newExts);
                   }} className="bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm w-1/3">
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Kurang">Kurang</option>
                    </select>
                    <input type="text" placeholder="Keterangan..." value={ext.description} onChange={e => {
                     const newExts = [...extracurriculars];
                     newExts[idx].description = e.target.value;
                     setExtracurriculars(newExts);
                   }} className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                   </div>
                   <button type="button" onClick={() => setExtracurriculars(extracurriculars.filter((_, i) => i !== idx))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
              ))}
              <button 
                type="button" 
                onClick={() => setExtracurriculars([...extracurriculars, { name: '', predicate: 'Baik', description: '' }])}
                className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm font-medium hover:bg-slate-50"
              >
                + Tambah Kegiatan
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200 sticky bottom-4 justify-end">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all text-sm">
            Batal
          </button>
          <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all text-sm">
            <Save className="w-4 h-4" />
            Simpan Data Raport
          </button>
        </div>
      </form>
    </div>
  );
}
