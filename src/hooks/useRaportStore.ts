import { useState, useEffect } from 'react';
import { StudentReport } from '../types';

export function useRaportStore() {
  const [reports, setReports] = useState<StudentReport[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('raport_pintar_data');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  const saveReports = (newReports: StudentReport[]) => {
    setReports(newReports);
    localStorage.setItem('raport_pintar_data', JSON.stringify(newReports));
  };

  const addReport = (report: Omit<StudentReport, 'id' | 'createdAt'>) => {
    const newReport: StudentReport = {
      ...report,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    saveReports([newReport, ...reports]);
  };

  const bulkAddReports = (newReports: Omit<StudentReport, 'id' | 'createdAt'>[]) => {
    const reportsToAdd: StudentReport[] = newReports.map(r => ({
      ...r,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }));
    saveReports([...reportsToAdd, ...reports]);
  };

  const updateReport = (id: string, updated: Partial<StudentReport>) => {
    saveReports(reports.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const deleteReport = (id: string) => {
    saveReports(reports.filter(r => r.id !== id));
  };

  const getReportById = (id: string) => reports.find(r => r.id === id);

  return {
    reports,
    addReport,
    bulkAddReports,
    updateReport,
    deleteReport,
    getReportById
  };
}
