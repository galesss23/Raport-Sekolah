import React, { useState } from 'react';
import { Sidebar, ViewState } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { FormView } from './views/FormView';
import { PreviewView } from './views/PreviewView';
import { SettingsView } from './views/SettingsView';
import { useRaportStore } from './hooks/useRaportStore';
import { useSettingsStore } from './hooks/useSettingsStore';
import { StudentReport } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const { reports, addReport, bulkAddReports, updateReport, deleteReport, getReportById } = useRaportStore();
  const { settings, saveSettings } = useSettingsStore();

  const handleSaveForm = (data: Omit<StudentReport, 'id' | 'createdAt'>) => {
    if (editingId) {
      updateReport(editingId, data);
    } else {
      addReport(data);
    }
    setEditingId(null);
    setCurrentView('dashboard');
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setCurrentView('form');
  };

  const handlePreview = (id: string) => {
    setPreviewingId(id);
    setCurrentView('preview');
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setCurrentView('form');
  };

  const handleSelectView = (view: ViewState) => {
    if (view === 'form') {
      handleCreateNew();
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="flex bg-[#F8FAFC] font-sans min-h-screen text-slate-800 print:bg-white print:m-0 overflow-x-hidden">
      {/* Hide Sidebar on Print */}
      <div className="print:hidden shrink-0">
        <Sidebar currentView={currentView} onChangeView={handleSelectView} />
      </div>

      <main className="flex-1 w-full relative print:w-full">
        {currentView === 'dashboard' && (
          <div className="print:hidden h-full">
            <DashboardView 
              reports={reports} 
              onViewPreview={handlePreview} 
              onEdit={handleEdit} 
              onDelete={deleteReport}
              onBulkAdd={bulkAddReports}
            />
          </div>
        )}

        {currentView === 'form' && (
          <div className="print:hidden h-full overflow-y-auto">
            <FormView 
              initialData={editingId ? getReportById(editingId) : null}
              onSave={handleSaveForm}
              onCancel={() => setCurrentView('dashboard')}
            />
          </div>
        )}

        {currentView === 'preview' && previewingId && (
          <div className="h-full overflow-y-auto print:overflow-visible">
             <PreviewView 
                report={getReportById(previewingId)!}
                settings={settings}
                onBack={() => {
                  setPreviewingId(null);
                  setCurrentView('dashboard');
                }}
             />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="print:hidden h-full">
             <SettingsView 
               settings={settings}
               onSave={saveSettings}
             />
          </div>
        )}
      </main>
    </div>
  );
}
