import React, { useState } from 'react';
import {
  Shield,
  Car,
  FileText,
  Camera,
  RefreshCw,
  Send,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { VistoriaFormData, VistoriaStatus, AppSettings, FilePayload } from '../types';
import { PhotoUploader } from './PhotoUploader';

interface VistoriaFormProps {
  initialBlitz: string;
  settings: AppSettings;
  onSubmit: (formData: VistoriaFormData) => Promise<void>;
  isSubmitting: boolean;
  submissionProgress: string;
}

const PRESET_BLITZ = [
  'BLITZ 10H ÀS 12H - APOIO ROMO',
  'BLITZ NOTURNA - GCM',
  'OPERAÇÃO LEI SECA',
  'FISCALIZAÇÃO INTEGRADA',
];

const PRESET_VEICULOS = [
  'VW Gol',
  'Fiat Strada',
  'GM Onix',
  'Toyota Corolla',
  'Honda CG 160',
  'Hyundai HB20',
];

export const VistoriaForm: React.FC<VistoriaFormProps> = ({
  initialBlitz,
  settings,
  onSubmit,
  isSubmitting,
  submissionProgress,
}) => {
  const [idOperacao, setIdOperacao] = useState<string>(() => {
    return '#OP-' + Math.floor(1000 + Math.random() * 9000);
  });
  const [blitz, setBlitz] = useState<string>(initialBlitz || 'BLITZ 10H ÀS 12H - APOIO ROMO');
  const [veiculo, setVeiculo] = useState<string>('');
  const [placa, setPlaca] = useState<string>('');
  const [status, setStatus] = useState<VistoriaStatus>('EM TESTE');

  // 5 Photo uploads
  const [fotoFrente, setFotoFrente] = useState<FilePayload | null>(null);
  const [fotoTraz, setFotoTraz] = useState<FilePayload | null>(null);
  const [fotoCnh, setFotoCnh] = useState<FilePayload | null>(null);
  const [fotoCrlvF, setFotoCrlvF] = useState<FilePayload | null>(null);
  const [fotoCrlvV, setFotoCrlvV] = useState<FilePayload | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const generateNewId = () => {
    setIdOperacao('#OP-' + Math.floor(1000 + Math.random() * 9000));
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.length > 7) raw = raw.slice(0, 7);
    setPlaca(raw);
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanId = idOperacao.trim();
    const cleanBlitz = blitz.trim();
    const cleanVeiculo = veiculo.trim();
    const cleanPlaca = placa.trim().toUpperCase();

    if (!cleanId || !cleanBlitz || !cleanVeiculo || !cleanPlaca) {
      setFormError('Preencha os campos obrigatórios (*) para continuar.');
      return;
    }

    if (cleanPlaca.length < 7) {
      setFormError('A placa do veículo deve conter 7 caracteres (Ex: ABC1D23 ou ABC1234).');
      return;
    }

    await onSubmit({
      idOperacao: cleanId,
      blitz: cleanBlitz,
      veiculo: cleanVeiculo,
      placa: cleanPlaca,
      status,
      fotoFrente,
      fotoTraz,
      fotoCnh,
      fotoCrlvF,
      fotoCrlvV,
    });
  };

  const totalPhotos = [fotoFrente, fotoTraz, fotoCnh, fotoCrlvF, fotoCrlvV].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Operação & Blitz */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Dados da Operação</span>
          </div>
          <button
            type="button"
            onClick={generateNewId}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            title="Gerar novo ID"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Novo ID</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID do Registro / Operação *
            </label>
            <div className="relative">
              <input
                type="text"
                value={idOperacao}
                onChange={(e) => setIdOperacao(e.target.value)}
                placeholder="Ex: #OP-1042"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono text-slate-100 placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome da Blitz / Apoio *
            </label>
            <input
              type="text"
              value={blitz}
              onChange={(e) => setBlitz(e.target.value)}
              placeholder="Ex: BLITZ 10H ÀS 12H - APOIO ROMO"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_BLITZ.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBlitz(preset)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                    blitz === preset
                      ? 'bg-blue-600/30 border border-blue-500/60 text-blue-300 font-medium'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Identificação do Veículo & Status */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
          <Car className="w-4 h-4 text-blue-400" />
          <span>Identificação do Veículo</span>
        </div>

        <div className="space-y-3.5">
          {/* Placa Mercosul Card Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Placa do Veículo *
            </label>
            <div className="bg-white rounded-xl border-2 border-blue-700 overflow-hidden shadow-inner max-w-xs mx-auto">
              <div className="bg-blue-700 text-white px-3 py-0.5 flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="flex items-center gap-1">
                  🇧🇷 <span>BRASIL</span>
                </span>
                <span className="text-[9px] font-mono tracking-normal opacity-80">MERCOSUL</span>
              </div>
              <div className="px-3 py-1 flex items-center justify-center bg-slate-50">
                <input
                  type="text"
                  value={placa}
                  onChange={handlePlacaChange}
                  placeholder="ABC1D23"
                  maxLength={8}
                  required
                  className="w-full text-center text-2xl font-black font-mono tracking-widest text-slate-950 placeholder-slate-300 outline-none uppercase bg-transparent py-1"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-1">
              Formato Mercosul (ex: BRA2E19) ou Tradicional (ex: ABC1234)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Modelo / Marca do Veículo *
            </label>
            <input
              type="text"
              value={veiculo}
              onChange={(e) => setVeiculo(e.target.value)}
              placeholder="Ex: VW Gol 1.6 / GM Onix Plus"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
            />
            {/* Quick Vehicle Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_VEICULOS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setVeiculo(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                    veiculo === preset
                      ? 'bg-blue-600/30 border border-blue-500/60 text-blue-300'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Status Segmented Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status da Vistoria *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('EM TESTE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  status === 'EM TESTE'
                    ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-sm shadow-amber-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>⏳</span>
                <span>EM TESTE</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('APROVADO')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  status === 'APROVADO'
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>✅</span>
                <span>APROVADO</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('REPROVADO')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  status === 'REPROVADO'
                    ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-sm shadow-rose-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>❌</span>
                <span>REPROVADO</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('LIBERADO')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  status === 'LIBERADO'
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🟢</span>
                <span>LIBERADO</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fotos & Documentos (Google Drive) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Camera className="w-4 h-4 text-blue-400" />
            <span>Mídias & Documentos</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {totalPhotos} de 5 selecionadas
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Arquivos convertidos em base64 e salvos na pasta <span className="text-slate-300 font-mono">Midia_Fumaca</span> do Google Drive com links públicos.
        </p>

        <div className="space-y-2.5">
          <PhotoUploader
            label="1. Veículo (Frente)"
            sublabel="Foto frontal mostrando a placa"
            fileData={fotoFrente}
            onFileSelect={setFotoFrente}
            compress={settings.autoCompressImages}
            maxWidth={settings.maxImageWidth}
            quality={settings.imageQuality}
          />

          <PhotoUploader
            label="2. Veículo (Traseira)"
            sublabel="Foto traseira com placa e lanternas"
            fileData={fotoTraz}
            onFileSelect={setFotoTraz}
            compress={settings.autoCompressImages}
            maxWidth={settings.maxImageWidth}
            quality={settings.imageQuality}
          />

          <PhotoUploader
            label="3. Documento CNH"
            sublabel="Foto da CNH física ou captura do PDF digital"
            fileData={fotoCnh}
            onFileSelect={setFotoCnh}
            compress={settings.autoCompressImages}
            maxWidth={settings.maxImageWidth}
            quality={settings.imageQuality}
          />

          <PhotoUploader
            label="4. CRLV (Frente)"
            sublabel="Documento de registro e licenciamento (frente)"
            fileData={fotoCrlvF}
            onFileSelect={setFotoCrlvF}
            compress={settings.autoCompressImages}
            maxWidth={settings.maxImageWidth}
            quality={settings.imageQuality}
          />

          <PhotoUploader
            label="5. CRLV (Verso)"
            sublabel="Documento de registro e licenciamento (verso)"
            fileData={fotoCrlvV}
            onFileSelect={setFotoCrlvV}
            compress={settings.autoCompressImages}
            maxWidth={settings.maxImageWidth}
            quality={settings.imageQuality}
          />
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{submissionProgress || 'Enviando ao Apps Script...'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Salvar Vistoria e Gerar WhatsApp</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-500 text-center mt-2">
          Envio via método <span className="font-mono text-slate-400">POST</span> (modo <span className="font-mono text-slate-400">no-cors</span>) para Google Apps Script.
        </p>
      </div>
    </form>
  );
};
