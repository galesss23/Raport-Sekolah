import { useState, useEffect } from 'react';
import { SchoolSettings } from '../types';

const defaultSettings: SchoolSettings = {
  schoolName: "SMP/SMA Contoh Berpadu",
  schoolAddress: "Jl. Pendidikan No. 1, Jakarta",
  headmasterName: "Budi Santoso, M.Pd.",
  headmasterNip: "19800101 200501 1 001",
  logoUrl: ""
};

export function useSettingsStore() {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('raport_pintar_settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const saveSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    localStorage.setItem('raport_pintar_settings', JSON.stringify(newSettings));
  };

  return {
    settings,
    saveSettings
  };
}
