/**
 * Standalone Google Apps Script (Codigo.gs) backend code.
 * This runs serverless on Google Apps Script, attached to Google Sheets & Drive.
 */
export const APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * BACKEND GOOGLE APPS SCRIPT - OPERAÇÃO FUMAÇA / VISTORIAS VEICULARES
 * ====================================================================
 * Este script atua como API Serverless para receber dados via POST (no-cors),
 * processar uploads em Base64, salvá-los no Google Drive com permissão pública,
 * registrar uma nova linha na planilha (aba 'OPERACA') e retornar o link de WhatsApp.
 *
 * INSTRUÇÕES DE IMPLANTAÇÃO:
 * 1. Crie uma planilha no Google Sheets (ex: "Registro_Operacao_Fumaca").
 * 2. Crie uma aba nomeada exatamente como: OPERACA
 * 3. Na linha 1 da aba OPERACA, defina os seguintes cabeçalhos:
 *    A: ID_OPERACAO | B: BLITZ | C: VEICULO | D: PLACA | E: STATUS |
 *    F: FOTO_VEICULO_FRENTE | G: FOTO_VEICULO_TRAZ | H: FOTO_DOC_CNH |
 *    I: FOTO_CRLV_F | J: FOTO_CRLV_V | K: WHATSAPP
 * 4. Acesse o menu: Extensões > Apps Script.
 * 5. Substitua todo o conteúdo do arquivo 'Código.gs' por este script.
 * 6. Clique em "Implantar" (Deploy) > "Nova Implantação" (New deployment).
 * 7. Selecione o tipo: "App da Web" (Web app).
 * 8. Configurações obrigatórias:
 *    - Executar como: "Eu" (seu e-mail / Me)
 *    - Quem pode acessar: "Qualquer pessoa" (Anyone) - CRÍTICO para permitir chamadas do GitHub Pages!
 * 9. Autorize as permissões de acesso ao Google Drive e Planilhas.
 * 10. Copie o URL da Web App gerado (termina com /exec) e cole no Frontend.
 */

// Configuração Padrão do Número WhatsApp (caso não venha no payload)
var WHATSAPP_NUMERO_PADRAO = "5511974987081";
var NOME_PASTA_DRIVE = "Midia_Fumaca";
var NOME_ABA_PLANILHA = "OPERACA";

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Suporte tanto para dados enviados como texto JSON puro quanto parâmetros
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var timestamp = new Date();
    // Fuso horário de Brasília (GMT-03:00)
    var timestampStr = Utilities.formatDate(timestamp, "GMT-03:00", "yyyy-MM-dd_HH-mm-ss");
    var dataStr = Utilities.formatDate(timestamp, "GMT-03:00", "dd/MM/yyyy");
    var horaStr = Utilities.formatDate(timestamp, "GMT-03:00", "HH:mm");

    // Extração e normalização dos dados do formulário
    var idOperacao = data.idOperacao || "#" + Math.floor(1000 + Math.random() * 9000);
    var blitz = data.blitz || "BLITZ OPERACIONAL";
    var veiculo = data.veiculo || "NÃO INFORMADO";
    var placa = data.placa ? data.placa.toString().toUpperCase().trim() : "SEM_PLACA";
    var status = data.status || "EM TESTE";
    var phoneDestino = data.whatsappPhone || WHATSAPP_NUMERO_PADRAO;
    
    // Limpeza do telefone (somente números)
    phoneDestino = phoneDestino.toString().replace(/\\D/g, "");
    if (!phoneDestino) phoneDestino = WHATSAPP_NUMERO_PADRAO;

    /**
     * Função auxiliar para decodificar Base64 e salvar no Google Drive
     */
    function salvarArquivoNoDrive(fileDataObj, sufixoNome) {
      if (!fileDataObj || !fileDataObj.data) return "";
      
      try {
        var folders = DriveApp.getFoldersByName(NOME_PASTA_DRIVE);
        var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(NOME_PASTA_DRIVE);

        var placaLimpa = placa ? placa.replace(/[^a-zA-Z0-9]/g, "_") : "VEICULO";
        var ext = "jpg";
        if (fileDataObj.name && fileDataObj.name.indexOf('.') !== -1) {
          ext = fileDataObj.name.split('.').pop().toLowerCase();
        } else if (fileDataObj.mimeType && fileDataObj.mimeType.indexOf('/') !== -1) {
          ext = fileDataObj.mimeType.split('/')[1].replace('jpeg', 'jpg');
        }

        var novoNome = timestampStr + "_" + placaLimpa + "_" + sufixoNome + "." + ext;

        // Extrai a parte pura do base64 ignorando "data:image/...;base64,"
        var base64Part = fileDataObj.data;
        if (base64Part.indexOf(',') !== -1) {
          base64Part = base64Part.split(',')[1];
        }

        var decoded = Utilities.base64Decode(base64Part);
        var mimeType = fileDataObj.mimeType || "image/jpeg";
        var blob = Utilities.newBlob(decoded, mimeType, novoNome);

        var file = folder.createFile(blob);
        // Define permissão pública para que o link direto possa ser acessado no WhatsApp/relatórios
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch (err) {
        Logger.log("Erro ao salvar arquivo " + sufixoNome + ": " + err);
        return "ERRO_UPLOAD: " + err.toString();
      }
    }

    // Processamento dos 5 arquivos/fotos enviados
    var fotoFrenteUrl = salvarArquivoNoDrive(data.fotoFrente, "Veiculo_Frente");
    var fotoTrazUrl   = salvarArquivoNoDrive(data.fotoTraz,   "Veiculo_Traz");
    var fotoCnhUrl    = salvarArquivoNoDrive(data.fotoCnh,    "Documento_CNH");
    var fotoCrlvFUrl  = salvarArquivoNoDrive(data.fotoCrlvF,  "CRLV_Frente");
    var fotoCrlvVUrl  = salvarArquivoNoDrive(data.fotoCrlvV,  "CRLV_Verso");

    // Emojis de status
    var emojiStatus = "⏳";
    if (status === "APROVADO") emojiStatus = "✅";
    else if (status === "REPROVADO") emojiStatus = "❌";
    else if (status === "LIBERADO") emojiStatus = "🟢";

    // Montagem da mensagem formatada para WhatsApp
    var relatorioWhatsApp = "🚗 *RELATÓRIO DE VISTORIA VEICULAR*\\n" +
                            "_____________\\n\\n" +
                            "📋 *ID do Registro:* " + idOperacao + "\\n" +
                            "🛡️ *Nome Blitz:* " + blitz + "\\n" +
                            "🛞 *Placa:* " + placa + "\\n" +
                            "🚘 *Veículo:* " + veiculo + "\\n" +
                            "📅 *Data:* " + dataStr + "\\n" +
                            "⏰ *Hora:* " + horaStr + "\\n" +
                            emojiStatus + " *Status:* " + status + "\\n" +
                            "_____________\\n\\n" +
                            "📷 *Fotos e Documentos:* \\n" +
                            (fotoFrenteUrl ? "• Frente: " + fotoFrenteUrl + "\\n" : "") +
                            (fotoTrazUrl   ? "• Traseira: " + fotoTrazUrl + "\\n" : "") +
                            (fotoCnhUrl    ? "• CNH: " + fotoCnhUrl + "\\n" : "") +
                            (fotoCrlvFUrl  ? "• CRLV (Frente): " + fotoCrlvFUrl + "\\n" : "") +
                            (fotoCrlvVUrl  ? "• CRLV (Verso): " + fotoCrlvVUrl + "\\n" : "") +
                            "\\n_Emitido via Sistema de Vistorias e Registros._";

    var linkWhatsApp = "https://api.whatsapp.com/send?phone=" + phoneDestino + "&text=" + encodeURIComponent(relatorioWhatsApp);

    // Salva na aba OPERACA da planilha
    var sheetOperacao = ss.getSheetByName(NOME_ABA_PLANILHA);
    if (!sheetOperacao) {
      // Se não existir a aba com o nome exato, pega a primeira aba ou cria
      sheetOperacao = ss.getSheets()[0];
    }

    sheetOperacao.appendRow([
      idOperacao,       // Coluna A: ID_OPERACAO
      blitz,            // Coluna B: BLITZ
      veiculo,          // Coluna C: VEICULO
      placa,            // Coluna D: PLACA
      status,           // Coluna E: STATUS
      fotoFrenteUrl,    // Coluna F: FOTO_VEICULO_FRENTE
      fotoTrazUrl,      // Coluna G: FOTO_VEICULO_TRAZ
      fotoCnhUrl,       // Coluna H: FOTO_DOC_CNH
      fotoCrlvFUrl,     // Coluna I: FOTO_CRLV_F
      fotoCrlvVUrl,     // Coluna J: FOTO_CRLV_V
      linkWhatsApp      // Coluna K: WHATSAPP
    ]);

    var responsePayload = {
      status: "success",
      idOperacao: idOperacao,
      placa: placa,
      timestamp: timestampStr,
      relatorio: relatorioWhatsApp,
      linkWhatsApp: linkWhatsApp,
      urls: {
        fotoFrente: fotoFrenteUrl,
        fotoTraz: fotoTrazUrl,
        fotoCnh: fotoCnhUrl,
        fotoCrlvF: fotoCrlvFUrl,
        fotoCrlvV: fotoCrlvVUrl
      }
    };

    return ContentService.createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Erro no doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "API OPERACAO FUMACA / VISTORIAS ativa e operante.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
