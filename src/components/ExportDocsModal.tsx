import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Database,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { APPS_SCRIPT_CODE } from '../utils/appsScriptCode';
import { generateStandaloneIndexHtml } from '../utils/standaloneHtml';
import { AppSettings } from '../types';

interface ExportDocsModalProps {
  settings: AppSettings;
}

export const ExportDocsModal: React.FC<ExportDocsModalProps> = ({ settings }) => {
  const [subTab, setSubTab] = useState<'html' | 'script' | 'guide'>('html');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const standaloneHtml = generateStandaloneIndexHtml(
    settings.scriptUrl,
    settings.whatsappPhone,
    settings.defaultBlitz
  );

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    });
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(standaloneHtml).then(() => {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    });
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Codigo.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => setSubTab('html')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            subTab === 'html'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Frontend (index.html)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('script')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            subTab === 'script'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backend (Codigo.gs)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('guide')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            subTab === 'guide'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guia Passo a Passo</span>
        </button>
      </div>

      {/* Subtab: Frontend Standalone index.html */}
      {subTab === 'html' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  index.html Estático (GitHub Pages)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  HTML5 puro, CSS moderno e Vanilla JS sem dependências externas.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  {copiedHtml ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto whitespace-pre leading-relaxed">
              {standaloneHtml}
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-blue-300 text-xs">
              <span className="font-semibold block mb-0.5">🚀 Como publicar no GitHub Pages:</span>
              1. Crie um repositório no GitHub (ex: <code className="text-white bg-blue-950 px-1 rounded">vistoria-app</code>).<br />
              2. Faça upload deste arquivo <code className="text-white bg-blue-950 px-1 rounded">index.html</code> na raiz.<br />
              3. Vá em Settings &gt; Pages &gt; Branch: main / root e Salve. Pronto!
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Backend Codigo.gs */}
      {subTab === 'script' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Codigo.gs (Google Apps Script API)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Manipula doPost, uploads no Drive (Midia_Fumaca) e appendRow em OPERACA.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadScript}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto whitespace-pre leading-relaxed">
              {APPS_SCRIPT_CODE}
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300 text-xs">
              <span className="font-semibold block mb-0.5">⚠️ Permissão Crítica no Apps Script:</span>
              Ao implantar, certifique-se de marcar <strong>"Quem pode acessar: Qualquer pessoa"</strong> (Anyone). Se deixar "Somente eu", o navegador bloqueará com erro 401/403.
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Guide */}
      {subTab === 'guide' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Arquitetura Desacoplada: Passo a Passo
            </h3>

            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Preparar a Planilha Google</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Crie uma planilha no Google Sheets e renomeie a primeira aba para <span className="text-blue-400 font-mono">OPERACA</span>.
                </p>
                <div className="mt-2 p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
                  Linha 1 (Cabeçalhos de A a K):<br />
                  A: ID_OPERACAO | B: BLITZ | C: VEICULO | D: PLACA | E: STATUS | F: FOTO_VEICULO_FRENTE | G: FOTO_VEICULO_TRAZ | H: FOTO_DOC_CNH | I: FOTO_CRLV_F | J: FOTO_CRLV_V | K: WHATSAPP
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Adicionar o Script Backend</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Na planilha, clique em <strong>Extensões &gt; Apps Script</strong>. Cole o código de <span className="text-emerald-400 font-mono">Codigo.gs</span>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Implantar como Web App</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Clique no botão azul <strong>Implantar &gt; Nova Implantação</strong>. Escolha a engrenagem e selecione <strong>App da Web</strong>:
                </p>
                <ul className="list-disc list-inside text-slate-400 text-[11px] mt-1 space-y-0.5">
                  <li><strong>Executar como:</strong> Eu (seu e-mail)</li>
                  <li><strong>Quem pode acessar:</strong> Qualquer pessoa (Anyone)</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                4
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Configurar URL no Frontend</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Copie a URL de implantação gerada (que termina em <code className="text-blue-400">/exec</code>) e cole na aba <strong>Configurações</strong> do app ou no arquivo <code className="text-blue-400">index.html</code>.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                5
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Comunicação CORS & no-cors</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  O envio é feito com <code className="text-emerald-400">mode: 'no-cors'</code> e cabeçalho <code className="text-emerald-400">Content-Type: 'text/plain'</code>. Isso garante que o navegador transmita com sucesso sem rejeição de CORS.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
