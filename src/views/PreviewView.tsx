import React, { useRef } from 'react';
import { StudentReport, SchoolSettings } from '../types';
import { ArrowLeft, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { formatIndonesianDate } from '../lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface PreviewViewProps {
  report: StudentReport;
  settings: SchoolSettings;
  onBack: () => void;
}

export function PreviewView({ report, settings, onBack }: PreviewViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsExporting(true);
      // Slight delay to ensure fonts render if any
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Raport_${report.name.replace(/\s+/g, '_')}_${report.semester}.pdf`);
    } catch (err) {
      console.error("Gagal export PDF:", err);
      alert("Gagal mengexport PDF. Pastikan browser mendukung fitur ini.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Metadata sheet
    const metaData = [
      ["PENCAPAIAN KOMPETENSI PESERTA DIDIK"],
      [],
      ["Nama Sekolah", settings.schoolName, "Nama Peserta Didik", report.name],
      ["Alamat Sekolah", settings.schoolAddress, "Nomor Induk / NISN", `${report.nis} / ${report.nisn}`],
      ["Kelas", report.className, "Semester", report.semester],
      ["Tahun Pelajaran", report.academicYear]
    ];

    const wsParams = XLSX.utils.aoa_to_sheet(metaData);
    
    // Add space
    XLSX.utils.sheet_add_aoa(wsParams, [[]], { origin: -1 });
    
    // Headers for grades
    const headerRow = [["No", "Mata Pelajaran", "KKM", "Nilai", "Predikat", "Deskripsi"]];
    XLSX.utils.sheet_add_aoa(wsParams, headerRow, { origin: -1 });

    // Grades rows
    const gradeRows = report.grades.map((g, i) => [
      i + 1, g.subject, g.kkm, g.score, g.predicate, g.description
    ]);
    XLSX.utils.sheet_add_aoa(wsParams, gradeRows, { origin: -1 });

    // Add space
    XLSX.utils.sheet_add_aoa(wsParams, [[], ["Ketidakhadiran"]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(wsParams, [
      ["Sakit", report.attendance.sick + " hari"],
      ["Izin", report.attendance.permission + " hari"],
      ["Tanpa Keterangan", report.attendance.absent + " hari"]
    ], { origin: -1 });

    XLSX.utils.book_append_sheet(wb, wsParams, "Raport Siswa");
    XLSX.writeFile(wb, `Data_Raport_${report.name.replace(/\s+/g, '_')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Sidebar Tools */}
      <div className="md:w-64 flex-shrink-0 flex flex-col gap-4 sticky top-8 h-min print:hidden">
        <button onClick={onBack} className="flex items-center justify-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          Tutup Preview
        </button>

        <div className="bg-white rounded-2xl p-6 mt-4 border border-slate-200 shadow-sm">
          <h3 className="text-slate-900 text-sm font-bold uppercase tracking-wider mb-4">Export Options</h3>
          <div className="space-y-3">
            <button 
              onClick={handleExportPDF} 
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? "Memproses PDF..." : "Download PDF"}
            </button>
            <button onClick={handleExportExcel} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export ke Excel
            </button>
            <button onClick={handlePrint} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium mt-4">
              <Printer className="w-4 h-4 text-slate-500" />
              Print Langsung
            </button>
          </div>
        </div>
      </div>

      {/* Actual A4 Document Area */}
      <div className="flex-1 overflow-x-auto shadow-2xl rounded border border-gray-200 bg-slate-50 p-4 md:p-8 print:shadow-none print:border-none print:p-0 print:m-0">
        <div 
          ref={reportRef} 
          className="bg-white mx-auto min-h-[297mm] w-[210mm] p-10 md:p-14 text-sm font-serif text-black relative print:w-full print:p-0"
        >
          {/* Header */}
          <div className="text-center font-bold text-lg mb-6 leading-tight pb-6 border-black border-b-2 flex flex-col items-center justify-center relative">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 object-contain absolute left-0 top-1/2 -translate-y-1/2" />
            )}
            <div>
              RAPOR PESERTA DIDIK DAN PROFIL PESERTA DIDIK<br/>
              {settings.schoolName.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm">
            <div className="flex"><span className="w-40 font-medium">Nama Peserta Didik</span> <span>: {report.name}</span></div>
            <div className="flex"><span className="w-32 font-medium">Kelas</span> <span>: {report.className}</span></div>
            <div className="flex"><span className="w-40 font-medium">NISN / NIS</span> <span>: {report.nisn || '-'} / {report.nis}</span></div>
            <div className="flex"><span className="w-32 font-medium">Semester</span> <span>: {report.semester}</span></div>
            <div className="flex"><span className="w-40 font-medium">Nama Sekolah</span> <span>: {settings.schoolName}</span></div>
            <div className="flex"><span className="w-32 font-medium">Tahun Pelajaran</span> <span>: {report.academicYear}</span></div>
            <div className="flex"><span className="w-40 font-medium whitespace-nowrap">Alamat Sekolah</span> <span className="line-clamp-2 leading-tight">: {settings.schoolAddress}</span></div>
          </div>

          {/* Grades Table */}
          <div className="mb-8">
            <h4 className="font-bold mb-3">A. Sikap dan Akademik</h4>
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-gray-100 text-center font-bold">
                  <th className="border border-black py-2 px-1 w-10">No</th>
                  <th className="border border-black py-2 px-2 w-48">Mata Pelajaran</th>
                  <th className="border border-black py-2 px-1 w-12">KKM</th>
                  <th className="border border-black py-2 px-1 w-12">Nilai</th>
                  <th className="border border-black py-2 px-1 w-12">Predikat</th>
                  <th className="border border-black py-2 px-4">Deskripsi Kemajuan Belajar</th>
                </tr>
              </thead>
              <tbody>
                {report.grades.map((grade, idx) => (
                  <tr key={idx} className="border border-black">
                    <td className="border border-black py-1 px-1 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2">{grade.subject}</td>
                    <td className="border border-black py-1 px-1 text-center">{grade.kkm}</td>
                    <td className="border border-black py-1 px-1 text-center font-semibold">{grade.score || 0}</td>
                    <td className="border border-black py-1 px-1 text-center">{grade.predicate}</td>
                    <td className="border border-black py-1 px-3 text-xs leading-relaxed">{grade.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extra section wrapper */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-3">B. Ekstrakurikuler</h4>
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr className="bg-gray-100 font-bold text-center">
                    <th className="border border-black py-1 w-8">No</th>
                    <th className="border border-black py-1">Kegiatan Ekstrakurikuler</th>
                    <th className="border border-black py-1 w-20">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {report.extracurriculars && report.extracurriculars.length > 0 ? (
                    report.extracurriculars.map((ext, idx) => (
                      <tr key={idx}>
                        <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                        <td className="border border-black py-1 px-2">{ext.name}</td>
                        <td className="border border-black py-1 px-2 text-center">{ext.predicate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="border border-black py-2 text-center text-gray-500">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">C. Ketidakhadiran</h4>
              <table className="w-full border-collapse border border-black text-sm">
                <tbody>
                  <tr>
                    <td className="border border-black py-1 px-4 w-40">Sakit</td>
                    <td className="border border-black py-1 px-4 text-center">: {report.attendance.sick} hari</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1 px-4">Izin</td>
                    <td className="border border-black py-1 px-4 text-center">: {report.attendance.permission} hari</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1 px-4">Tanpa Keterangan</td>
                    <td className="border border-black py-1 px-4 text-center">: {report.attendance.absent} hari</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-12">
            <h4 className="font-bold mb-3">D. Catatan Wali Kelas</h4>
            <div className="border border-black p-4 min-h-[80px] italic text-gray-800">
              "{report.notes || "Tingkatkan terus semangat belajarmu!"}"
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between mt-16 px-8 text-sm">
            <div className="text-center w-48">
              <p>Mengetahui,</p>
              <p>Orang Tua/Wali</p>
              <div className="mt-20 border-b border-black"></div>
              <p className="mt-1">Nama Orang Tua</p>
            </div>
            
            <div className="text-center w-48">
              <p>{settings.schoolAddress.split(',')[0] || "Jakarta"}, {formatIndonesianDate(new Date(report.createdAt))}</p>
              <p>Wali Kelas</p>
              <div className="mt-20 border-b border-black font-bold uppercase"></div>
              <p className="mt-1">NIP. -</p>
            </div>
          </div>
          <div className="text-center mt-12 w-full flex justify-center">
            <div className="text-center w-64">
              <p>Mengetahui,</p>
              <p>Kepala Sekolah</p>
              <div className="mt-20 border-b border-black font-bold uppercase">{settings.headmasterName}</div>
              <p className="mt-1">NIP. {settings.headmasterNip}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
