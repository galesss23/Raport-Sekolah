import React, { useState, useRef } from 'react';
import { StudentReport, DEFAULT_SUBJECTS } from '../types';
import { Users, FileSpreadsheet, Search, Eye, Download, Trash2, Edit, Upload } from 'lucide-react';
import { cn, getPredicate } from '../lib/utils';
import * as XLSX from 'xlsx';

interface DashboardProps {
  reports: StudentReport[];
  onViewPreview: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkAdd: (reports: Omit<StudentReport, 'id' | 'createdAt'>[]) => void;
}

export function DashboardView({ reports, onViewPreview, onEdit, onDelete, onBulkAdd }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const newReports: Omit<StudentReport, 'id' | 'createdAt'>[] = data.map((row: any) => {
           const grades: any[] = [];
           
           const name = row['Nama Siswa'] || row['Nama'] || "Tanpa Nama";
           const nis = String(row['NIS'] || "");
           const nisn = String(row['NISN'] || "");
           const className = String(row['Kelas'] || "VII-A");
           const semester = (row['Semester'] === 'Genap' ? 'Genap' : 'Ganjil') as 'Ganjil' | 'Genap';
           const academicYear = String(row['Tahun Ajaran'] || "2023/2024");
           const sick = Number(row['Sakit']) || 0;
           const permission = Number(row['Izin']) || 0;
           const absent = Number(row['Tanpa Keterangan'] || row['Alpa']) || 0;
           
           const knownCols = ['Nama Siswa', 'Nama', 'NIS', 'NISN', 'Kelas', 'Semester', 'Tahun Ajaran', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Alpa', 'Rata-Rata Nilai'];
           
           for (const key of Object.keys(row)) {
             if (!knownCols.includes(key)) {
               const score = Number(row[key]) || 0;
               const predicate = getPredicate(score);
               grades.push({
                 subject: key,
                 kkm: 75,
                 score,
                 predicate,
                 description: `Kemampuan dalam ${key} ${predicate === 'A' ? 'sangat baik' : predicate === 'B' ? 'baik' : 'cukup baik. Tingkatkan belajar.'}`
               });
             }
           }
           
           if (grades.length === 0) {
             grades.push(...DEFAULT_SUBJECTS.map(sub => ({
               subject: sub, kkm: 75, score: 75, predicate: 'C', description: 'Cukup baik.'
             })));
           }
           
           return {
             name, nis, nisn, className, semester, academicYear,
             grades,
             attendance: { sick, permission, absent },
             notes: "",
             extracurriculars: []
           };
        });
        
        onBulkAdd(newReports);
        alert(`${newReports.length} data raport berhasil di-import!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        alert("Gagal membaca file Excel. Pastikan format sesuai.");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateRow = {
      'Nama Siswa': 'Siswa Contoh',
      'NIS': '12345',
      'NISN': '0012345678',
      'Kelas': 'VII-A',
      'Semester': 'Ganjil',
      'Tahun Ajaran': '2023/2024',
      'Sakit': 0,
      'Izin': 0,
      'Tanpa Keterangan': 0
    };
    
    // Add default subjects
    DEFAULT_SUBJECTS.forEach(sub => {
      (templateRow as any)[sub] = 85; 
    });

    const ws = XLSX.utils.json_to_sheet([templateRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Raport.xlsx");
  };

  const handleExportAllToExcel = () => {
    if (reports.length === 0) return alert("Belum ada data.");
    
    const rows = reports.map(r => ({
      'NISN': r.nisn,
      'NIS': r.nis,
      'Nama Siswa': r.name,
      'Kelas': r.className,
      'Semester': r.semester,
      'Tahun Ajaran': r.academicYear,
      'Rata-Rata Nilai': (r.grades.reduce((sum, g) => sum + g.score, 0) / (r.grades.length || 1)).toFixed(2),
      'Sakit': r.attendance.sick,
      'Izin': r.attendance.permission,
      'Tanpa Keterangan': r.attendance.absent
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Siswa");
    XLSX.writeFile(wb, "Rekap_Raport_Siswa.xlsx");
  };

  const averageScoreAll = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + r.grades.reduce((sum, g) => sum + g.score, 0) / (r.grades.length || 1), 0) / reports.length).toFixed(1)
    : 0;

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Panel Utama</h2>
          <p className="text-sm text-slate-500">Selamat datang kembali, mari kelola nilai hari ini.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={handleDownloadTemplate}
            className="px-4 py-2 text-indigo-600 rounded-lg flex items-center gap-2 hover:bg-indigo-50 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium transition-colors bg-white shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Excel
          </button>
          <button 
            onClick={handleExportAllToExcel}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium transition-colors bg-white shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Cetak Rekap Excel
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 flex flex-col gap-6 flex-1 h-0 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Total Siswa</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{reports.length} Siswa</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Rata-rata Keseluruhan</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{averageScoreAll}</h3>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <h3 className="font-bold text-slate-900">Daftar Nilai Siswa</h3>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari siswa..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1 h-full">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIS / NISN</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Rata-Rata</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      {searchTerm ? "Tidak ada hasil pencarian." : "Belum ada data raport. Mulai tambah di menu \"Tambah Raport\"."}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => {
                    const avg = report.grades.reduce((sum, g) => sum + g.score, 0) / (report.grades.length || 1);
                    return (
                      <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{report.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">{report.nis} / {report.nisn}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">{report.className} - {report.semester}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-bold",
                            avg >= 85 ? "bg-emerald-50 text-emerald-600" :
                            avg >= 70 ? "bg-indigo-50 text-indigo-600" :
                            "bg-rose-50 text-rose-600"
                          )}>
                            {avg.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 text-sm font-medium">
                            <button 
                              onClick={() => onViewPreview(report.id)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Detail
                            </button>
                            <button 
                              onClick={() => onEdit(report.id)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Yakin ingin menghapus report ini?')) {
                                  onDelete(report.id);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
