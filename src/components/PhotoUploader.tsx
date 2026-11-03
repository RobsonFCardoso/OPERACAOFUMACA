import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check, Eye, Loader2, Image as ImageIcon } from 'lucide-react';
import { FilePayload } from '../types';
import { fileToBase64Optimized } from '../utils/imageCompressor';

interface PhotoUploaderProps {
  label: string;
  sublabel: string;
  fileData: FilePayload | null;
  onFileSelect: (payload: FilePayload | null) => void;
  compress?: boolean;
  maxWidth?: number;
  quality?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  label,
  sublabel,
  fileData,
  onFileSelect,
  compress = true,
  maxWidth = 1280,
  quality = 0.82,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const { dataUrl, sizeKB } = await fileToBase64Optimized(
        file,
        compress,
        maxWidth,
        quality
      );

      onFileSelect({
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        data: dataUrl,
        sizeKB: sizeKB,
      });
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Falha ao processar imagem.');
    } finally {
      setIsProcessing(false);
      // Reset input value to allow selecting same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
  };

  return (
    <>
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {fileData ? (
              <div
                onClick={() => setShowLightbox(true)}
                className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 cursor-pointer group flex-shrink-0"
              >
                <img
                  src={fileData.data}
                  alt={label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-slate-400" />
              </div>
            )}

            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-200 truncate">{label}</h4>
              <p className="text-[11px] text-slate-400 truncate">{sublabel}</p>
              {fileData && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
                    <Check className="w-3 h-3" /> Pronto ({fileData.sizeKB || 0} KB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isProcessing ? (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-950/60 text-blue-400 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Otimizando</span>
              </div>
            ) : fileData ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Ver imagem"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                  title="Remover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {/* Camera direct button (ideal for mobile) */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm shadow-blue-600/20"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto</span>
                </button>

                {/* Upload from file/gallery */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-700/60"
                  title="Escolher arquivo"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Lightbox Modal */}
      {showLightbox && fileData && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{label}</h3>
                <p className="text-xs text-slate-400">
                  {fileData.name} · {fileData.sizeKB} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-[70vh] flex items-center justify-center bg-black/40 overflow-auto">
              <img
                src={fileData.data}
                alt={label}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
