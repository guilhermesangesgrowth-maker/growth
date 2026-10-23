/**
 * Recebe os cadastros do Guia Growth 30D (e de outras iscas) e grava no Google Sheets.
 *
 * Como publicar (uma vez):
 * 1. Crie uma planilha no Google Sheets (ex.: "Leads Growth Hub").
 * 2. Menu Extensões > Apps Script. Apague o código de exemplo e cole este arquivo inteiro.
 * 3. Clique em Implantar > Nova implantação > tipo "App da Web".
 *    - Executar como: Eu (sua conta)
 *    - Quem tem acesso: Qualquer pessoa
 * 4. Autorize o acesso quando o Google pedir e copie a URL que termina em /exec.
 * 5. Cole essa URL em CONFIG.leadEndpoint no arquivo guia-growth-30d/guia.js.
 * 6. Para testar, rode a função testeManual() no editor e confira se uma linha apareceu na aba "Leads".
 *
 * Cada pessoa vira UMA linha (identificada por e-mail + origem). As etapas seguintes
 * (resultado, clique no WhatsApp) atualizam a mesma linha.
 */

var ABA = "Leads";
var COLUNAS = [
  "criado_em", "atualizado_em", "origem", "nome", "email", "whatsapp", "cargo", "porte", "perfil",
  "consentimento", "ultima_etapa", "nota", "nivel",
  "tese", "produto", "posicionamento", "canais", "ia", "vendas", "expansao",
  "clicou_whatsapp", "pagina"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var dados = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!dados.email) return resposta_({ ok: false, erro: "sem e-mail" });
    gravar_(dados);
    return resposta_({ ok: true });
  } catch (err) {
    return resposta_({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return resposta_({ ok: true, servico: "leads growth hub" });
}

function gravar_(d) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight("bold");
  }

  var agora = new Date();
  var email = String(d.email).trim().toLowerCase();
  var origem = String(d.origem || "");
  var idxEmail = COLUNAS.indexOf("email") + 1;
  var idxOrigem = COLUNAS.indexOf("origem") + 1;

  // procura a linha existente (mesmo e-mail e mesma origem)
  var ultima = aba.getLastRow();
  var linha = 0;
  if (ultima > 1) {
    var valores = aba.getRange(2, 1, ultima - 1, COLUNAS.length).getValues();
    for (var i = valores.length - 1; i >= 0; i--) {
      if (String(valores[i][idxEmail - 1]).toLowerCase() === email && String(valores[i][idxOrigem - 1]) === origem) {
        linha = i + 2;
        break;
      }
    }
  }

  var registro = {};
  if (linha) {
    var atual = aba.getRange(linha, 1, 1, COLUNAS.length).getValues()[0];
    COLUNAS.forEach(function (c, k) { registro[c] = atual[k]; });
  } else {
    registro.criado_em = agora;
  }

  registro.atualizado_em = agora;
  registro.origem = origem;
  registro.email = email;
  ["nome", "whatsapp", "cargo", "porte", "perfil", "pagina"].forEach(function (c) {
    if (d[c]) registro[c] = d[c];
  });
  if (d.consent) registro.consentimento = d.consent;
  if (d.stage) registro.ultima_etapa = d.stage;

  if (d.stage === "resultado") {
    registro.nota = d.score;
    registro.nivel = d.nivel;
    var a = d.areas || {};
    ["tese", "produto", "posicionamento", "canais", "ia", "vendas", "expansao"].forEach(function (k) { registro[k] = a[k]; });
  }
  if (d.stage === "cta-whatsapp") registro.clicou_whatsapp = "sim";

  var linhaValores = COLUNAS.map(function (c) { return registro[c] === undefined ? "" : registro[c]; });
  if (linha) aba.getRange(linha, 1, 1, COLUNAS.length).setValues([linhaValores]);
  else aba.appendRow(linhaValores);
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Rode esta função no editor para criar a aba e testar a gravação. */
function testeManual() {
  gravar_({ stage: "cadastro", origem: "teste", nome: "Teste", email: "teste@exemplo.com", whatsapp: "(19) 99999-9999", cargo: "Dono, CEO ou sócio", porte: "Só eu", perfil: "outro", consent: "sim", pagina: "teste" });
  gravar_({ stage: "resultado", origem: "teste", email: "teste@exemplo.com", score: 12, nivel: "estruturado", areas: { tese: 2, produto: 1, posicionamento: 3, canais: 1, ia: 2, vendas: 2, expansao: 1 } });
}
