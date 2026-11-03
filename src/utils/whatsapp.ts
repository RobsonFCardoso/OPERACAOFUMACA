import { VistoriaFormData, VistoriaStatus } from '../types';

export function getStatusEmoji(status: VistoriaStatus): string {
  switch (status) {
    case 'APROVADO':
      return '✅';
    case 'REPROVADO':
      return '❌';
    case 'LIBERADO':
      return '🟢';
    case 'EM TESTE':
    default:
      return '⏳';
  }
}

export function sanitizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '5511974987081';
  // If user entered 11 digits (e.g. 11974987081), prepend country code 55
  if (digits.length === 10 || digits.length === 11) {
    return '55' + digits;
  }
  return digits;
}

export function generateWhatsAppMessage(
  data: Partial<VistoriaFormData> & {
    idOperacao: string;
    blitz: string;
    veiculo: string;
    placa: string;
    status: VistoriaStatus;
  },
  dateStr?: string,
  timeStr?: string
): string {
  const now = new Date();
  const dStr = dateStr || now.toLocaleDateString('pt-BR');
  const tStr = timeStr || now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const emoji = getStatusEmoji(data.status);

  const fotos = [];
  if (data.fotoFrente) fotos.push('• Frente do Veículo: [Anexada]');
  if (data.fotoTraz) fotos.push('• Traseira do Veículo: [Anexada]');
  if (data.fotoCnh) fotos.push('• CNH do Condutor: [Anexada]');
  if (data.fotoCrlvF) fotos.push('• CRLV (Frente): [Anexada]');
  if (data.fotoCrlvV) fotos.push('• CRLV (Verso): [Anexada]');

  const fotosBlock = fotos.length > 0 
    ? `\n📷 *Fotos e Documentos:* \n${fotos.join('\n')}\n`
    : '';

  return (
    `🚗 *RELATÓRIO DE VISTORIA VEICULAR*\n` +
    `_____________\n\n` +
    `📋 *ID do Registro:* ${data.idOperacao}\n` +
    `🛡️ *Nome Blitz:* ${data.blitz}\n` +
    `🛞 *Placa:* ${data.placa.toUpperCase()}\n` +
    `🚘 *Veículo:* ${data.veiculo}\n` +
    `📅 *Data:* ${dStr}\n` +
    `⏰ *Hora:* ${tStr}\n` +
    `${emoji} *Status:* ${data.status}\n` +
    `_____________\n` +
    fotosBlock +
    `\n_Emitido via Sistema de Vistorias e Registros._`
  );
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

export function buildWaMeLink(phone: string, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
