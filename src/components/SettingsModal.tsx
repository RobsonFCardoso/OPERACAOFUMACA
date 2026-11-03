import React, { useState } from 'react';
import {
  Settings,
  Link2,
  Phone,
  Image,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formState, setFormState] = useState<AppSettings>(settings);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    loading?: boolean;
  }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestConnection = async () => {
    if (!formState.scriptUrl) {
      setTestResult({ success: false, message: 'Informe a URL do Google Apps Script.' });
      return;
    }

    setTestResult({ loading: true });

    try {
      // In browser, Apps Script GET may be redirected; fetch in no-cors or standard GET
      const resp = await fetch(formState.scriptUrl, {
        method: 'GET',
        mode: 'no-cors',
      });

      setTestResult({
        success: true,
        message: 'Endpoint alcançado! O script respondeu à requisição.',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Falha ao conectar: ${err.message || 'Erro de rede'}`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults: AppSettings = {
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
    setFormState(defaults);
    onSaveSettings(defaults);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Settings className="w-4 h-4 text-blue-400" />
            <span>Configurações da API & Integrações</span>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Padrão</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Script URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-blue-400" />
              URL do Web App (Google Apps Script) *
            </label>
            <input
              type="url"
              value={formState.scriptUrl}
              onChange={(e) =>
                setFormState({ ...formState, scriptUrl: e.target.value })
              }
              placeholder="https://script.google.com/macros/s/.../exec"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 font-mono text-xs text-slate-200 outline-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-slate-500">
                Endpoint público de implantação que recebe o método POST
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testResult.loading}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                {testResult.loading ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>

            {testResult.message && (
              <div
                className={`mt-2 p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  testResult.success
                    ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800/80 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* WhatsApp Destination Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Telefone de Destino do WhatsApp *
            </label>
            <input
              type="text"
              value={formState.whatsappPhone}
              onChange={(e) =>
                setFormState({ ...formState, whatsappPhone: e.target.value })
              }
              placeholder="Ex: 5511974987081"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 font-mono text-xs text-slate-200 outline-none"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Código do país (55) + DDD (11) + número do celular sem traços ou parênteses.
            </span>
          </div>

          {/* Default Blitz Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome da Blitz Padrão
            </label>
            <input
              type="text"
              value={formState.defaultBlitz}
              onChange={(e) =>
                setFormState({ ...formState, defaultBlitz: e.target.value })
              }
              placeholder="Ex: BLITZ 10H ÀS 12H - APOIO ROMO"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-slate-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Media & Performance Settings */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
          <Image className="w-4 h-4 text-blue-400" />
          <span>Compressão & Otimização de Mídia</span>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formState.autoCompressImages}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  autoCompressImages: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
            />
            <div>
              <span className="font-semibold text-slate-200 block">
                Comprimir imagens no navegador (Recomendado)
              </span>
              <span className="text-[11px] text-slate-400 block">
                Reduz o tamanho de 10MB para ~200KB antes de converter para Base64, evitando timeouts no Google Apps Script.
              </span>
            </div>
          </label>

          {formState.autoCompressImages && (
            <div className="pl-6 pt-1 space-y-2">
              <div>
                <span className="text-[11px] text-slate-400 block">
                  Largura máxima da imagem: {formState.maxImageWidth}px
                </span>
                <input
                  type="range"
                  min="800"
                  max="1920"
                  step="80"
                  value={formState.maxImageWidth}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      maxImageWidth: Number(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Test / Simulation Mode Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.simulationMode}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    simulationMode: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">
                  Modo Simulação / Teste Local
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Permite gerar o relatório e o link do WhatsApp instantaneamente sem enviar chamada HTTP para a planilha (útil para testar offline).
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {/* Save Button */}
      <button
        type="submit"
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all"
      >
        Salvar Alterações
      </button>
    </form>
  );
};
