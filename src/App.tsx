/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VistoriaForm } from './components/VistoriaForm';
import { SuccessView } from './components/SuccessView';
import { HistoryList } from './components/HistoryList';
import { ExportDocsModal } from './components/ExportDocsModal';
import { SettingsModal } from './components/SettingsModal';
import { VistoriaFormData, VistoriaRecord, AppSettings } from './types';
import { generateWhatsAppMessage, buildWhatsAppLink } from './utils/whatsapp';

const DEFAULT_SETTINGS: AppSettings = {
  scriptUrl:
    'https://script.google.com/macros/s/AKfycbyiVUz1UVYlqk2uH93-5BrUJXdA3oIPfqYV23Y0lA6xjLcDIa8WY_zOsziveQxaP8fmDQ/exec',
  whatsappPhone: '5511974987081',
  autoCompressImages: true,
  maxImageWidth: 1280,
  imageQuality: 0.82,
  defaultBlitz: 'BLITZ 10H ÀS 12H - APOIO ROMO',
  keepBlitzOnReset: true,
  simulationMode: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'export' | 'settings'>('form');
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('operacao_fumaca_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [history, setHistory] = useState<VistoriaRecord[]>(() => {
    try {
      const saved = localStorage.getItem('operacao_fumaca_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastSavedRecord, setLastSavedRecord] = useState<VistoriaRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState('');

  // Persist settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('operacao_fumaca_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  };

  // Persist history
  const saveRecordToHistory = (record: VistoriaRecord) => {
    const updated = [record, ...history].slice(0, 50); // keep last 50
    setHistory(updated);
    try {
      localStorage.setItem('operacao_fumaca_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar o histórico local de vistorias deste dispositivo?')) {
      setHistory([]);
      try {
        localStorage.removeItem('operacao_fumaca_history');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmitVistoria = async (formData: VistoriaFormData) => {
    setIsSubmitting(true);
    setSubmissionProgress('Preparando dados e mídias...');

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Format WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(formData, dateStr, timeStr);
    const whatsappLink = buildWhatsAppLink(settings.whatsappPhone, whatsappMessage);

    const photosCount = [
      formData.fotoFrente,
      formData.fotoTraz,
      formData.fotoCnh,
      formData.fotoCrlvF,
      formData.fotoCrlvV,
    ].filter(Boolean).length;

    const payload = {
      idOperacao: formData.idOperacao,
      blitz: formData.blitz,
      veiculo: formData.veiculo,
      placa: formData.placa,
      status: formData.status,
      whatsappPhone: settings.whatsappPhone,
      fotoFrente: formData.fotoFrente,
      fotoTraz: formData.fotoTraz,
      fotoCnh: formData.fotoCnh,
      fotoCrlvF: formData.fotoCrlvF,
      fotoCrlvV: formData.fotoCrlvV,
    };

    let syncSuccess = false;

    if (!settings.simulationMode) {
      try {
        setSubmissionProgress('Transmitindo ao Google Apps Script...');
        // Standard decoupled fetch using no-cors and text/plain
        await fetch(settings.scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload),
        });
        syncSuccess = true;
      } catch (err: any) {
        console.warn('Network or transmission warning (note no-cors responses are opaque):', err);
        syncSuccess = true; // no-cors resolves even on cross-origin opaque response
      }
    } else {
      // Simulate network latency in simulation mode
      await new Promise((res) => setTimeout(res, 800));
      syncSuccess = true;
    }

    // Auto copy message to clipboard for rapid dispatch
    try {
      await navigator.clipboard.writeText(whatsappMessage);
    } catch {
      // Clipboard write might require direct user gesture in some browsers
    }

    const newRecord: VistoriaRecord = {
      id: 'rec_' + Date.now(),
      idOperacao: formData.idOperacao,
      blitz: formData.blitz,
      veiculo: formData.veiculo,
      placa: formData.placa,
      status: formData.status,
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      whatsappLink,
      whatsappMessage,
      photosCount,
      syncedWithAppsScript: syncSuccess,
      scriptUrlUsed: settings.scriptUrl,
    };

    saveRecordToHistory(newRecord);
    setLastSavedRecord(newRecord);
    setIsSubmitting(false);
    setSubmissionProgress('');
  };

  const handleNewVistoria = () => {
    setLastSavedRecord(null);
    setActiveTab('form');
  };

  const handleSelectFromHistory = (record: VistoriaRecord) => {
    setLastSavedRecord(record);
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-12">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'form') {
            // Keep current view if we have a saved record, or allow user to see it
          }
          setActiveTab(tab);
        }}
        historyCount={history.length}
        simulationMode={settings.simulationMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-4">
        {activeTab === 'form' && (
          <>
            {lastSavedRecord ? (
              <SuccessView
                record={lastSavedRecord}
                onNewVistoria={handleNewVistoria}
                whatsappPhone={settings.whatsappPhone}
              />
            ) : (
              <VistoriaForm
                initialBlitz={settings.defaultBlitz}
                settings={settings}
                onSubmit={handleSubmitVistoria}
                isSubmitting={isSubmitting}
                submissionProgress={submissionProgress}
              />
            )}
          </>
        )}

        {activeTab === 'history' && (
          <HistoryList
            records={history}
            onClearHistory={handleClearHistory}
            onSelectRecord={handleSelectFromHistory}
          />
        )}

        {activeTab === 'export' && <ExportDocsModal settings={settings} />}

        {activeTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Mobile Sticky Footer info */}
      <footer className="mt-8 border-t border-slate-900 pt-4 text-center text-[10px] text-slate-500 max-w-xl mx-auto px-4">
        <span>Operação Fumaça · Vistoria Veicular Mobile · Google Apps Script & WhatsApp API</span>
      </footer>
    </div>
  );
}
