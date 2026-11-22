/* =====================================================================
 * HOME: pop-up de formulário antes do WhatsApp
 * Qualquer link de WhatsApp da página (botões e flutuante) abre este pop-up.
 * Perguntas: nome, WhatsApp, e-mail, porte e momento (as mesmas dos guias).
 * Ao enviar: grava na mesma planilha dos guias (origem "home-whatsapp"),
 * avisa o GTM e abre o WhatsApp em nova guia (dentro do clique, então não é bloqueado).
 * Quem já respondeu neste navegador vai direto para o WhatsApp.
 * ===================================================================== */
(function () {
  "use strict";

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

  function radios(name, list, cur, cls) {
    return '<div class="' + cls + '">' + list.map(function (t) {
      return '<label class="wf-r"><input type="radio" name="' + name + '" value="' + esc(t) + '"' + (cur === t ? " checked" : "") + '><span>' + esc(t) + '</span></label>';
    }).join("") + '</div>';
  }
  function render(d) {
    box.innerHTML =
      '<button type="button" class="wf-x" data-wf-close aria-label="Fechar">×</button>' +
      '<p class="eyebrow">Atendimento pelo WhatsApp</p>' +
      '<h2 class="wf-title" id="wf-title" tabindex="-1">Você será direcionado para atendimento agora mesmo.</h2>' +
      '<p class="wf-lead">Antes disso, responda:</p>' +
      '<form id="wfForm" novalidate>' +
      '<label class="wf-f"><span>Qual é o seu nome?</span><input class="wf-in" id="wf-nome" name="nome" type="text" autocomplete="name" placeholder="Seu nome" value="' + esc(d.nome) + '"></label>' +
      '<label class="wf-f"><span>Qual é o seu WhatsApp?</span><input class="wf-in" id="wf-whats" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000" value="' + esc(d.whatsapp) + '"></label>' +
      '<label class="wf-f"><span>Qual é o seu melhor e-mail?</span><input class="wf-in" id="wf-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com" value="' + esc(d.email) + '"></label>' +
      '<fieldset class="wf-group"><legend class="wf-q">Quantas pessoas trabalham com você hoje?</legend>' + radios("wf-porte", PORTES, d.porte, "wf-opts") + '</fieldset>' +
      '<fieldset class="wf-group"><legend class="wf-q">Qual é o momento do seu negócio?</legend>' + radios("wf-momento", MOMENTOS, d.momento, "wf-radios") + '</fieldset>' +
      '<label class="wf-consent"><input id="wf-consent" type="checkbox"><span>Concordo em receber contatos sobre growth, conforme a LGPD.</span></label>' +
      '<span class="wf-err" id="wf-err" role="alert"></span>' +
      '<button type="submit" class="btn btn--primary wf-go">Ir para o WhatsApp</button>' +
      '</form>';
  }
  function openForm(url, origem) {
    pendingUrl = url; origemClique = origem; lastFocus = document.activeElement;
    render(prefill());
    back.hidden = false; box.hidden = false; document.body.classList.add("wf-open");
    dl("home_whatsapp_form", { clique: origem });
    var first = $("wf-nome"); setTimeout(function () { (first && !first.value ? first : $("wf-title")).focus({ preventScroll: true }); }, 30);
  }
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
      sendLead("whatsapp-" + origem); dl("home_whatsapp_direto", { clique: origem });
      goWhatsApp(a.href); return;
    }
    openForm(a.href, origem);
  }, true);

  box.addEventListener("click", function (e) { if (e.target.closest("[data-wf-close]")) closeForm(); });
  back.addEventListener("click", closeForm);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) closeForm(); });
  box.addEventListener("input", function (e) {
    if (e.target.id === "wf-whats") e.target.value = maskPhone(e.target.value);
    e.target.removeAttribute && e.target.removeAttribute("aria-invalid");
    var m = $("wf-err"); if (m) m.textContent = "";
  });
  box.addEventListener("submit", function (e) {
    if (e.target.id !== "wfForm") return;
    e.preventDefault();
    var nome = $("wf-nome"), whats = $("wf-whats"), email = $("wf-email");
    var porte = box.querySelector('input[name="wf-porte"]:checked'), momento = box.querySelector('input[name="wf-momento"]:checked');
    if (nome.value.trim().length < 2) return err("Informe seu nome.", nome);
    if (!phoneOk(whats.value)) return err("Informe um WhatsApp com DDD (aceita +55).", whats);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) return err("Informe um e-mail válido.", email);
    if (!porte) return err("Escolha quantas pessoas trabalham com você.");
    if (!momento) return err("Escolha o momento do seu negócio.");
    if (!$("wf-consent").checked) return err("Marque para continuar.");
    lead = { nome: nome.value.trim(), whatsapp: whats.value.trim(), email: email.value.trim(), porte: porte.value, momento: momento.value };
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(lead)); } catch (e2) {}
    sendLead("cadastro");
    dl("home_whatsapp_cadastro", { clique: origemClique });
    if (qual(lead) === "mql") dl("lead_qualificado", { clique: origemClique });
    goWhatsApp(pendingUrl);   // ainda dentro do envio do formulário: o navegador permite a nova guia
    closeForm();
  });
})();
