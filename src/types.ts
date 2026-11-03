export type VistoriaStatus = 'EM TESTE' | 'APROVADO' | 'REPROVADO' | 'LIBERADO';

export interface FilePayload {
  name: string;
  mimeType: string;
  data: string; // Base64 data URL (e.g. data:image/jpeg;base64,...)
  sizeKB?: number;
}

export interface VistoriaFormData {
  idOperacao: string;
  blitz: string;
  veiculo: string;
  placa: string;
  status: VistoriaStatus;
  fotoFrente: FilePayload | null;
  fotoTraz: FilePayload | null;
  fotoCnh: FilePayload | null;
  fotoCrlvF: FilePayload | null;
  fotoCrlvV: FilePayload | null;
}

export interface VistoriaRecord {
  id: string;
  idOperacao: string;
  blitz: string;
  veiculo: string;
  placa: string;
  status: VistoriaStatus;
  timestamp: string;
  dateStr: string;
  timeStr: string;
  whatsappLink: string;
  whatsappMessage: string;
  photosCount: number;
  syncedWithAppsScript: boolean;
  scriptUrlUsed: string;
}

export interface AppSettings {
  scriptUrl: string;
  whatsappPhone: string;
  autoCompressImages: boolean;
  maxImageWidth: number;
  imageQuality: number;
  defaultBlitz: string;
  keepBlitzOnReset: boolean;
  simulationMode: boolean;
}
