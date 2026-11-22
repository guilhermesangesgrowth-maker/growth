/* =====================================================================
 * HOME: pop-up de formulário antes do WhatsApp
 * Qualquer link de WhatsApp da página (botões e flutuante) abre este pop-up.
 * Perguntas: nome, WhatsApp, e-mail, porte e momento (as mesmas dos guias).
 * Ao enviar: grava na mesma planilha dos guias (origem "home-whatsapp"),
 * avisa o GTM e abre o WhatsApp em nova guia (dentro do clique, então não é bloqueado).
 * Quem já respondeu neste navegador vai direto para o WhatsApp.
 * Eventos (mesmo esquema dos guias): form_open, form_step, generate_lead, qualify_lead, whatsapp_open.
 * ===================================================================== */
(function () {
  "use strict";
  window.GS_WA_FORM = true;   // avisa o agentico.js que os cliques de WhatsApp desta página são medidos aqui

  var CONFIG = {
    leadEndpoint: "https://docs.google.com/forms/d/e/1FAIpQLSf7K-fnfHxo8OGYD715wdvWaF0r1p61pyV3kAbxDS8_Pd_n6w/formResponse",
    formFields: { etapa: "entry.176202070", origem: "entry.1587842509", nome: "entry.598034783", email: "entry.362575635", whatsapp: "entry.745510118", pagina: "entry.722341163", segmento: "entry.1739758473", porte: "entry.1257151820", estagio: "entry.1229289482", jornada: "entry.1355015536", consentimento: "entry.748315144", investe: "entry.1475592940" },
    origem: "home-whatsapp",
    storageKey: "home-wa-v1"
  };
  var PORTES = ["Só eu", "Entre 2 e 20 pessoas", "Entre 21 e 100 pessoas", "Mais de 101 pessoas"];
  var MOMENTOS = [
    "Nunca investi em marketing/vendas e quero saber mais",
    "Invisto até R$20mil/mês em marketing/vendas e quero otimizar resultados",
    "Invisto mais do que R$20mil/mês em marketing/vendas e quero otimizar resultados",
    "Invisto em marketing/vendas e estou satisfeito com o resultado"
  ];
  var MQL = MOMENTOS[2];
  var WA_LINK = 'a[href*="api.whatsapp.com"], a[href*="wa.me/"]';

  var lead = null, pendingUrl = "", origemClique = "", lastFocus = null;
  try { lead = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "null"); } catch (e) {}

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function $(id) { return document.getElementById(id); }
  function qual(l) { return l && l.momento === MQL ? "mql" : "pre-qualificacao"; }
  function dl(event, extra) {
    var o = { event: event, origem: CONFIG.origem, qualificacao: lead ? qual(lead) : "sem-cadastro", porte: (lead && lead.porte) || "", momento: (lead && lead.momento) || "" };
    for (var k in (extra || {})) o[k] = extra[k];
    (window.dataLayer = window.dataLayer || []).push(o);
  }
  function sendLead(stage) {
    if (!CONFIG.leadEndpoint || !lead) return;
    var f = CONFIG.formFields, b = new URLSearchParams();
    b.append(f.etapa, stage); b.append(f.origem, CONFIG.origem);
    b.append(f.nome, lead.nome); b.append(f.email, lead.email); b.append(f.whatsapp, lead.whatsapp);
    b.append(f.segmento, ""); b.append(f.porte, lead.porte); b.append(f.jornada, "");
    b.append(f.consentimento, "sim"); b.append(f.investe, lead.momento);
    b.append(f.estagio, qual(lead) === "mql" ? "MQL" : "pré-qualificação");
    b.append(f.pagina, location.href.split("#")[0]);
    try { fetch(CONFIG.leadEndpoint, { method: "POST", mode: "no-cors", body: b, keepalive: true }).catch(function () {}); } catch (e) {}
  }

  /* quem já se cadastrou em um dos guias chega com os dados preenchidos */
  function prefill() {
    var d = {};
    ["g30d-v3", "gha-v2"].forEach(function (k) {
      try {
        var g = JSON.parse(localStorage.getItem(k) || "{}").lead;
        if (!g) return;
        d.nome = d.nome || g.nome; d.whatsapp = d.whatsapp || g.whatsapp; d.email = d.email || g.email;
        if (!d.porte && PORTES.indexOf(g.porte) >= 0) d.porte = g.porte;
        if (!d.momento && MOMENTOS.indexOf(g.momento) >= 0) d.momento = g.momento;
      } catch (e) {}
    });
    return d;
  }

  function maskBr(d) {
    d = d.slice(0, 11);
    if (d.length > 6) return "(" + d.slice(0, 2) + ") " + d.slice(2, d.length > 10 ? 7 : 6) + "-" + d.slice(d.length > 10 ? 7 : 6);
    if (d.length > 2) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 0) return "(" + d;
    return "";
  }
  function maskPhone(v) {
    v = String(v); var d = v.replace(/[^0-9]/g, "");
    if (v.trim().charAt(0) === "+") {
      if (d.slice(0, 2) === "55") return "+55" + (d.length > 2 ? " " + maskBr(d.slice(2)) : "");
      return "+" + d.slice(0, 15);
    }
    return maskBr(d);
  }
  function phoneOk(v) {
    var d = String(v).replace(/[^0-9]/g, "");
    if (String(v).trim().charAt(0) === "+") return d.slice(0, 2) === "55" ? (d.length === 12 || d.length === 13) : (d.length >= 8 && d.length <= 15);
    return d.length === 10 || d.length === 11;
  }

  /* ---------- pop-up ---------- */
  var back = document.createElement("div"); back.className = "wf-backdrop"; back.hidden = true; back.setAttribute("data-wf-close", "");
  var box = document.createElement("div"); box.className = "wf"; box.hidden = true;
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "wf-title");
  document.body.appendChild(back); document.body.appendChild(box);

  /* uma pergunta por tela, com barra de progresso (mesmo formato do pop-up dos guias) */
  var QS = [
    { k: "nome", type: "text", q: "Qual é o seu nome?", ph: "Seu nome", ac: "name", im: "text" },
    { k: "whatsapp", type: "tel", q: "Qual é o seu WhatsApp?", ph: "(00) 00000-0000", ac: "tel", im: "tel" },
    { k: "email", type: "email", q: "Qual é o seu melhor e-mail?", ph: "voce@email.com", ac: "email", im: "email" },
    { k: "porte", type: "opts", q: "Quantas pessoas trabalham com você hoje?" },
    { k: "momento", type: "final", q: "Qual é o momento do seu negócio?" }
  ];
  var step = 0, draft = {};

  function render() {
    var q = QS[step], n = QS.length, body;
    if (q.type === "opts") {
      body = '<div class="wf-opts" role="radiogroup" aria-labelledby="wf-q">' + PORTES.map(function (p) {
        return '<button type="button" role="radio" aria-checked="' + (draft.porte === p) + '" class="wf-opt' + (draft.porte === p ? " here" : "") + '" data-wf-opt="' + esc(p) + '">' + esc(p) + '</button>';
      }).join("") + '</div><span class="wf-err" id="wf-err" role="alert"></span>';
    } else if (q.type === "final") {
      body = '<form id="wfForm" novalidate><div class="wf-radios" role="radiogroup" aria-labelledby="wf-q">' + MOMENTOS.map(function (t) {
        return '<label class="wf-r"><input type="radio" name="wf-momento" value="' + esc(t) + '"' + (draft.momento === t ? " checked" : "") + '><span>' + esc(t) + '</span></label>';
      }).join("") + '</div>' +
        '<label class="wf-consent"><input id="wf-consent" type="checkbox"><span>Concordo em receber contatos sobre growth, conforme a LGPD.</span></label>' +
        '<span class="wf-err" id="wf-err" role="alert"></span>' +
        '<button type="submit" class="btn btn--primary wf-go">Ir para o WhatsApp</button></form>';
    } else {
      body = '<form id="wfForm" novalidate>' +
        '<input class="wf-in" id="wf-in" type="' + q.type + '" inputmode="' + q.im + '" autocomplete="' + q.ac + '" placeholder="' + esc(q.ph) + '" value="' + esc(draft[q.k] || "") + '" aria-labelledby="wf-q">' +
        '<span class="wf-err" id="wf-err" role="alert"></span>' +
        '<button type="submit" class="btn btn--primary wf-go">Continuar</button></form>';
    }
    box.innerHTML =
      '<button type="button" class="wf-x" data-wf-close aria-label="Fechar">×</button>' +
      '<p class="eyebrow">Atendimento pelo WhatsApp</p>' +
      '<p class="wf-head" id="wf-title">Você será direcionado para atendimento agora mesmo. Antes disso, responda:</p>' +
      (step > 0 ? '<button type="button" class="wf-back" data-wf-back>← Voltar</button>' : '') +
      '<div class="wf-prog" aria-hidden="true"><i style="width:' + Math.round((step + 1) / n * 100) + '%"></i></div>' +
      '<p class="wf-count">Pergunta ' + (step + 1) + ' de ' + n + '</p>' +
      '<h2 class="wf-title" id="wf-q" tabindex="-1">' + esc(q.q) + '</h2>' + body;
    var inp = $("wf-in");
    setTimeout(function () { (inp || $("wf-q")).focus({ preventScroll: true }); }, 30);
  }
  function openForm(url, origem) {
    pendingUrl = url; origemClique = origem; lastFocus = document.activeElement;
    draft = prefill(); step = 0;
    render();
    back.hidden = false; box.hidden = false; document.body.classList.add("wf-open");
    dl("form_open", { modo: "whatsapp", local: origem }); dl("form_step", { pergunta: QS[0].k, passo: 1 });
  }
  function next() { step++; render(); dl("form_step", { pergunta: QS[step].k, passo: step + 1 }); }
  function closeForm() {
    if (box.hidden) return;
    back.hidden = true; box.hidden = true; box.innerHTML = ""; document.body.classList.remove("wf-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function goWhatsApp(url) {
    var w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (e) {} return; }
    setTimeout(function () { location.href = url; }, 300);   // nova guia bloqueada: vai na mesma
  }
  function err(msg, field) { $("wf-err").textContent = msg; if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); } }

  function origemDe(a) {
    if (a.closest(".wa-float")) return "flutuante";
    var s = a.closest("section[id], header, footer");
    return s ? (s.id || s.tagName.toLowerCase()) : "pagina";
  }

  /* captura antes dos outros cliques da página */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(WA_LINK);
    if (!a || box.contains(a) || a.closest("#gha-root")) return;   // o pop-up do guia tem o próprio fluxo
    e.preventDefault();
    var origem = origemDe(a);
    if (lead) {   // já respondeu: direto para o WhatsApp
      sendLead("whatsapp-" + origem); dl("whatsapp_open", { modo: "direto", local: origem });
      goWhatsApp(a.href); return;
    }
    openForm(a.href, origem);
  }, true);

  function validate(k, v) {
    if (k === "nome") return v.length < 2 ? "Informe seu nome." : "";
    if (k === "whatsapp") return phoneOk(v) ? "" : "Informe um WhatsApp com DDD (aceita +55).";
    if (k === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Informe um e-mail válido.";
    return "";
  }

  box.addEventListener("click", function (e) {
    if (e.target.closest("[data-wf-close]")) { closeForm(); return; }
    if (e.target.closest("[data-wf-back]")) { if (step > 0) { step--; render(); } return; }
    var o = e.target.closest("[data-wf-opt]");
    if (o) { draft[QS[step].k] = o.getAttribute("data-wf-opt"); next(); }
  });
  back.addEventListener("click", closeForm);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) closeForm(); });
  box.addEventListener("input", function (e) {
    if (e.target.id === "wf-in" && e.target.type === "tel") e.target.value = maskPhone(e.target.value);
    e.target.removeAttribute && e.target.removeAttribute("aria-invalid");
    var m = $("wf-err"); if (m) m.textContent = "";
  });
  box.addEventListener("submit", function (e) {
    if (e.target.id !== "wfForm") return;
    e.preventDefault();
    var q = QS[step];
    if (q.type !== "final") {
      var el = $("wf-in"), v = el.value.trim(), m = validate(q.k, v);
      if (m) return err(m, el);
      draft[q.k] = v; next(); return;
    }
    var momento = box.querySelector('input[name="wf-momento"]:checked');
    if (!momento) return err("Escolha uma opção.");
    if (!$("wf-consent").checked) return err("Marque para continuar.");
    lead = { nome: draft.nome, whatsapp: draft.whatsapp, email: draft.email, porte: draft.porte, momento: momento.value };
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(lead)); } catch (e2) {}
    sendLead("cadastro");
    dl("generate_lead", { local: origemClique });
    if (qual(lead) === "mql") dl("qualify_lead", { local: origemClique });
    dl("whatsapp_open", { modo: "formulario", local: origemClique });
    goWhatsApp(pendingUrl);   // ainda dentro do envio do formulário: o navegador permite a nova guia
    closeForm();
  });
})();
