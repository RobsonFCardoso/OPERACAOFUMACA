import React, { useState } from 'react';
import {
  History,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  FileSpreadsheet,
  Check,
  Calendar,
  Clock,
  Car,
  Image as ImageIcon,
} from 'lucide-react';
import { VistoriaRecord, VistoriaStatus } from '../types';

interface HistoryListProps {
  records: VistoriaRecord[];
  onClearHistory: () => void;
  onSelectRecord: (record: VistoriaRecord) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  onClearHistory,
  onSelectRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.idOperacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.blitz.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopy = (e: React.MouseEvent, record: VistoriaRecord) => {
    e.stopPropagation();
    navigator.clipboard.writeText(record.whatsappMessage).then(() => {
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getStatusBadge = (status: VistoriaStatus) => {
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
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
            <History className="w-4 h-4 text-blue-400" />
            <span>Histórico Local de Vistorias ({records.length})</span>
          </div>

          {records.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa, veículo ou ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-slate-200 placeholder-slate-600 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          {['ALL', 'EM TESTE', 'APROVADO', 'REPROVADO', 'LIBERADO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors font-medium ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredRecords.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
          <Car className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            {records.length === 0
              ? 'Nenhuma vistoria registrada ainda neste dispositivo.'
              : 'Nenhum registro encontrado para a busca informada.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectRecord(item)}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {item.idOperacao}
                    </span>
                    <span className="font-mono font-black text-xs text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50">
                      {item.placa}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-300 mt-1">
                    {item.veiculo}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.blitz}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Copiar mensagem WhatsApp"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={item.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 transition-colors"
                    title="Abrir no WhatsApp"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {item.photosCount} fotos
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.dateStr} {item.timeStr}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
