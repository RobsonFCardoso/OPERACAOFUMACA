import React, { useState } from 'react';
import {
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  PlusCircle,
  FileText,
  Car,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { VistoriaRecord } from '../types';

interface SuccessViewProps {
  record: VistoriaRecord;
  onNewVistoria: () => void;
  whatsappPhone: string;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  record,
  onNewVistoria,
  whatsappPhone,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(record.whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'REPROVADO':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      case 'LIBERADO':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80';
      case 'EM TESTE':
      default:
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>

        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-base font-bold text-slate-100">
          Vistoria Registrada com Sucesso!
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Os dados foram enviados para a planilha <span className="text-slate-300 font-mono">OPERACA</span> e as mídias salvas no Google Drive.
        </p>

        {/* Quick summary grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Registro</span>
            <span className="font-semibold text-slate-200">{record.idOperacao}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Placa</span>
            <span className="font-bold font-mono text-blue-400 tracking-wider">
              {record.placa}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Veículo</span>
            <span className="text-slate-300 truncate block">{record.veiculo}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Status</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(
                record.status
              )}`}
            >
              {record.status}
            </span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              {record.photosCount} fotos processadas
            </span>
            <span>
              {record.dateStr} às {record.timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Main Action: Send to WhatsApp */}
      <div className="space-y-2">
        <a
          href={record.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            // Auto copy text on clicking whatsapp just in case mobile opens blank
            navigator.clipboard.writeText(record.whatsappMessage).catch(() => {});
          }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all text-center"
        >
          <Share2 className="w-4 h-4" />
          <span>Enviar Relatório via WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>

        {/* Copy Text Button */}
        <button
          type="button"
          onClick={handleCopyText}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 text-xs font-medium border border-slate-700/80 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copiado para Área de Transferência!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copiar Texto Formatado do Relatório</span>
            </>
          )}
        </button>
      </div>

      {/* WhatsApp Message Preview Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Mensagem formatada para o WhatsApp:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Destino: +{whatsappPhone}
          </span>
        </div>
        <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] font-sans text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto selection:bg-blue-600 selection:text-white">
          {record.whatsappMessage}
        </pre>
      </div>

      {/* New Vistoria Button */}
      <button
        type="button"
        onClick={onNewVistoria}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Iniciar Nova Vistoria</span>
      </button>
    </div>
  );
};
