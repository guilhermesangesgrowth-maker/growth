/* =====================================================================
 * GUIA HIGH TICKET AGÊNTICO: pop-up de captura
 * Mesmo fluxo do Guia Growth 30D, em 3 telas:
 *   1) abertura (avança com clique ou em 8 segundos)
 *   2) cadastro, uma pergunta por tela (o diagrama das 3 áreas fica no topo)
 *   3) entrega: implementação guiada (o Claude do lead entrevista e monta
 *      os agentes), visão dos 9 agentes e rotina da semana
 * Abre por: botões com [data-gha-open], link direto #guia-agentico,
 * ou sozinho (uma vez por visita) depois de tempo/rolagem na página.
 * Depois do cadastro a URL vira #guia-agentico-1 (equipe de 2 ou mais pessoas)
 * ou #guia-agentico-2 (autônomo), para gatilhos de remarketing no GTM.
 * Depende de agentico-data.js (GHA_DATA).
 * ===================================================================== */
(function () {
  "use strict";

  var CONFIG = {
    whatsapp: "5519998878022",
    // Mesmo Google Forms do Guia Growth 30D: as respostas caem na mesma planilha, separadas pela coluna "origem"
    leadEndpoint: "https://docs.google.com/forms/d/e/1FAIpQLSf7K-fnfHxo8OGYD715wdvWaF0r1p61pyV3kAbxDS8_Pd_n6w/formResponse",
    formFields: { etapa: "entry.176202070", origem: "entry.1587842509", nome: "entry.598034783", email: "entry.362575635", whatsapp: "entry.745510118", pagina: "entry.722341163", segmento: "entry.1739758473", porte: "entry.1257151820", estagio: "entry.1229289482", jornada: "entry.1355015536", consentimento: "entry.748315144", investe: "entry.1475592940" },
    origem: "guia-high-ticket-agentico",
    storageKey: "gha-v2",
    dismissKey: "gha-dismiss",
    hash: "#guia-agentico",
    base: "guia-high-ticket-agentico/",   // caminho da pasta do guia a partir da página que carrega o script
    pdf: "kit-guia-high-ticket-agentico.pdf",
    introMs: 8000,
    // abertura automática: depois de X ms OU de rolar Y da página (o que vier primeiro), uma vez por visita.
    // Não abre se a pessoa já se cadastrou ou fechou o pop-up nos últimos N dias.
    auto: { enabled: true, delayMs: 18000, scrollRatio: 0.45, snoozeDays: 3 }
  };
  /* Ajustes por página, via atributos na tag <script>:
   *   data-base="..."        caminho até a pasta do guia (na própria página do guia: "")
   *   data-open-on-load      abre o pop-up assim que a página carrega (página própria do guia) */
  var me = document.currentScript;
  if (me && me.hasAttribute("data-base")) CONFIG.base = me.getAttribute("data-base");
  var openOnLoad = !!(me && me.hasAttribute("data-open-on-load"));
  if (openOnLoad) CONFIG.auto.enabled = false;
  var D = window.GHA_DATA;
  if (!D) return;
  var FRENTES = D.FRENTES, SEGS = D.SEGS;

  /* Pergunta de qualificação: tamanho da equipe. "Somente eu" = não qualificado */
  var PORTES = ["Somente eu (autônomo)", "2-30 pessoas", "31-99 pessoas", "+100 pessoas"];
  var QS = [
    { k: "nome", type: "text", q: "Qual é o seu nome?", ph: "Seu nome", ac: "name", im: "text" },
    { k: "whatsapp", type: "tel", q: "Qual é o seu WhatsApp?", ph: "(00) 00000-0000", ac: "tel", im: "tel" },
    { k: "email", type: "email", q: "Qual é o seu melhor e-mail?", ph: "voce@email.com", ac: "email", im: "email" },
    { k: "segmento", type: "opts", q: "Qual é o seu segmento?" },
    { k: "porte", type: "final", q: "Quantas pessoas trabalham com você?" }
  ];
  var SCREENS = ["intro", "lead", "pb"];

  /* ---------- estado ---------- */
  var state = { lead: null, segmento: null, checks: {} };
  var ui = { open: false, screen: "intro", q: 0, draft: {}, timer: null, copies: [], lastFocus: null };

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
      state.lead = s.lead || null; state.segmento = s.segmento || null; state.checks = s.checks || {};
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {}
  }
  /* Quem já se cadastrou no Guia Growth 30D (ou na versão anterior deste guia) chega com os dados preenchidos */
  function prefill() {
    ["g30d-v3", "gha-v1"].forEach(function (k) {
      try {
        var g = JSON.parse(localStorage.getItem(k) || "{}");
        if (g.lead) { ui.draft.nome = ui.draft.nome || g.lead.nome || ""; ui.draft.whatsapp = ui.draft.whatsapp || g.lead.whatsapp || ""; ui.draft.email = ui.draft.email || g.lead.email || ""; }
        if (g.segmento && !ui.draft.segmento) ui.draft.segmento = g.segmento;
      } catch (e) {}
    });
  }

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function seg(id) { return SEGS.filter(function (s) { return s.id === id; })[0]; }
  function segLabel() { var s = seg(state.segmento); return s ? s.label : ""; }
  function totalAgentes() { return FRENTES.reduce(function (n, f) { return n + f.agentes.length; }, 0); }
  function firstName() { return state.lead && state.lead.nome ? String(state.lead.nome).trim().split(/\s+/)[0] : ""; }

  function waUrl() {
    var msg = "Olá, vim do Guia High Ticket Agêntico e quero agendar uma Sessão Diagnóstico!";
    return "https://api.whatsapp.com/send/?phone=" + CONFIG.whatsapp + "&text=" + encodeURIComponent(msg);
  }

  /* ---------- planilha (Google Forms) e dataLayer ---------- */
  function sendLead(stage) {
    if (!CONFIG.leadEndpoint || !state.lead) return;
    var f = CONFIG.formFields, b = new URLSearchParams();
    b.append(f.etapa, stage); b.append(f.origem, CONFIG.origem);
    b.append(f.nome, state.lead.nome); b.append(f.email, state.lead.email); b.append(f.whatsapp, state.lead.whatsapp);
    b.append(f.segmento, segLabel()); b.append(f.porte, state.lead.porte || "");
    b.append(f.estagio, ""); b.append(f.jornada, "");
    b.append(f.consentimento, state.lead.consent ? "sim" : "nao"); b.append(f.investe, "");
    b.append(f.pagina, location.href.split("#")[0]);
    try { fetch(CONFIG.leadEndpoint, { method: "POST", mode: "no-cors", body: b, keepalive: true }).catch(function () {}); } catch (e) {}
  }
  function qualKey() {
    var v = state.lead && state.lead.porte;
    if (!v) return "";
    return v === PORTES[0] ? "nao-qualificado" : "qualificado";
  }
  function guideHash() {
    var k = qualKey();
    if (k === "nao-qualificado") return CONFIG.hash + "-2";
    return k ? CONFIG.hash + "-1" : CONFIG.hash;
  }
  window.dataLayer = window.dataLayer || [];
  function dl(event, extra) {
    var o = { event: event, guia: CONFIG.origem, qualificacao: qualKey() || "sem-cadastro", segmento: segLabel(), porte: (state.lead && state.lead.porte) || "" };
    for (var k in (extra || {})) o[k] = extra[k];
    window.dataLayer.push(o);
  }

  /* ---------- casca do pop-up ---------- */
  var root = document.createElement("div");
  root.id = "gha-root"; root.hidden = true;
  document.body.appendChild(root);

  function stepsHtml() {
    var n = SCREENS.indexOf(ui.screen) + 1;
    return [1, 2, 3].map(function (i) { return '<i class="' + (i <= n ? "on" : "") + '"></i>'; }).join("");
  }

  /* diagrama circular: o negócio no centro e as 3 áreas em órbita */
  function diagramHtml(cls) {
    var nodes = [
      { f: FRENTES[0], x: 210, y: 50, lx: 210, ly1: 21, ly2: 38 },
      { f: FRENTES[1], x: 296.6, y: 200, lx: 320, ly1: 250, ly2: 268 },
      { f: FRENTES[2], x: 123.4, y: 200, lx: 100, ly1: 250, ly2: 268 }
    ];
    var spokes = nodes.map(function (n) { return '<line class="dg-spoke" x1="210" y1="150" x2="' + n.x + '" y2="' + n.y + '"/>'; }).join("");
    var dots = nodes.map(function (n, i) {
      return '<circle class="dg-pulse dg-pulse' + (i + 1) + '" cx="' + n.x + '" cy="' + n.y + '" r="11"/><circle class="dg-node" cx="' + n.x + '" cy="' + n.y + '" r="11"/>' +
        '<text class="dg-name" x="' + n.lx + '" y="' + n.ly1 + '" text-anchor="middle">' + esc(n.f.nome) + '</text>' +
        '<text class="dg-role" x="' + n.lx + '" y="' + n.ly2 + '" text-anchor="middle">' + esc(n.f.papel) + '</text>';
    }).join("");
    var aria = FRENTES.map(function (f) { return f.nome + ": " + f.papel; }).join("; ");
    return '<div class="gha-dg ' + (cls || "") + '"><svg viewBox="0 0 420 276" role="img" aria-label="Seu negócio no centro, com 3 áreas de agentes. ' + esc(aria) + '">' +
      '<circle class="dg-ring" cx="210" cy="150" r="100"/>' + spokes +
      '<circle class="dg-orbit" r="4.5"><animateMotion dur="9s" repeatCount="indefinite" path="M210,50 a100,100 0 1,1 -0.1,0"/></circle>' +
      '<circle class="dg-core" cx="210" cy="150" r="48"/><text class="dg-core-t" x="210" y="146" text-anchor="middle">Seu negócio</text><text class="dg-core-s" x="210" y="164" text-anchor="middle">high-ticket</text>' +
      dots + '</svg></div>';
  }

  var MARQ = ["Médicos", "Dentistas", "Arquitetos", "Engenheiros", "Advogados", "Consultores", "Executivos", "Empresários"].map(function (s) { return "<span>" + s + "</span>"; }).join("");
  function introHtml() {
    return '<div class="gha-screen gha-screen--intro">' +
      '<h2 class="gha-h1" tabindex="-1">Se você fatura mais do que <span class="text-orange">R$50 mil por mês</span> e vende serviços de pelo menos R$3 mil, o <span class="text-orange">guia high ticket agêntico</span> acelera as principais áreas do seu negócio em menos de 24h!</h2>' +
      '<p class="gha-h2">Implemente agentes e sistemas automáticos que serão seus copilotos para voar mais alto.</p>' +
      '<p class="eyebrow gha-for">Para quem vende serviços de alto valor:</p>' +
      '<div class="gha-marquee" role="img" aria-label="Médicos, dentistas, arquitetos, engenheiros, advogados, consultores, executivos e empresários"><div class="gha-marquee__t" aria-hidden="true">' + MARQ + MARQ + '</div></div>' +
      '<button type="button" class="btn btn--primary gha-go" data-gha-next>Acessar guia gratuito</button>' +
      '<div class="gha-bar" aria-hidden="true"><i style="animation-duration:' + CONFIG.introMs + 'ms"></i></div></div>';
  }

  function qHtml() {
    var q = QS[ui.q], d = ui.draft, n = QS.length;
    var head = '<button type="button" class="gha-back" data-gha-qback>← Voltar</button>' +
      '<div class="gha-prog" aria-hidden="true"><i style="width:' + Math.round((ui.q + 1) / n * 100) + '%"></i></div>' +
      '<p class="eyebrow">Pergunta ' + (ui.q + 1) + ' de ' + n + '</p>' +
      '<h2 class="gha-title" tabindex="-1">' + esc(q.q) + '</h2>';
    var body;
    if (q.type === "opts") {
      body = '<div class="gha-opts" role="radiogroup">' + SEGS.map(function (s) {
        return '<button type="button" role="radio" aria-checked="' + (d.segmento === s.id) + '" class="gha-opt' + (d.segmento === s.id ? " here" : "") + '" data-gha-opt="' + esc(s.id) + '">' + esc(s.label) + '</button>';
      }).join("") + '</div><span class="gha-err" id="gha-err" role="alert"></span>';
    } else if (q.type === "final") {
      body = '<form id="ghaForm" novalidate><div class="gha-radios">' + PORTES.map(function (t) {
        return '<label class="gha-radio"><input type="radio" name="gha-porte" value="' + esc(t) + '"' + (d.porte === t ? " checked" : "") + '><span class="gha-dot"></span><span>' + esc(t) + '</span></label>';
      }).join("") + '</div>' +
        '<label class="gha-consent" for="gha-consent"><input id="gha-consent" type="checkbox"><span>Concordo em receber o guia e contatos sobre growth, conforme a LGPD.</span></label>' +
        '<span class="gha-err" id="gha-err" role="alert"></span>' +
        '<button type="submit" class="btn btn--primary gha-next">Liberar o guia</button>' +
        '<p class="gha-priv">Sem spam. Você pode pedir a remoção dos seus dados quando quiser.</p></form>';
    } else {
      body = '<form id="ghaForm" novalidate><label class="gha-sr" for="gha-in">' + esc(q.q) + '</label>' +
        '<input id="gha-in" class="gha-in" type="' + q.type + '" autocomplete="' + q.ac + '" inputmode="' + q.im + '" placeholder="' + esc(q.ph) + '" value="' + esc(d[q.k] || "") + '">' +
        '<span class="gha-err" id="gha-err" role="alert"></span>' +
        '<button type="submit" class="btn btn--primary gha-next">Continuar</button></form>';
    }
    return '<div class="gha-screen gha-screen--q">' + head + body + '</div>';
  }

  /* ---------- tela 3: entrega ---------- */
  function copyBlock(text, label) {
    var i = ui.copies.push(text) - 1;
    return '<div class="gha-copy"><div class="gha-copy__bar"><span>' + esc(label) + '</span><button type="button" class="gha-copy__btn" data-gha-copy="' + i + '">Copiar</button></div><pre>' + esc(text) + '</pre></div>';
  }
  function copyBtn(text, label, cls) {
    var i = ui.copies.push(text) - 1;
    return '<button type="button" class="gha-copy__btn ' + (cls || "") + '" data-gha-copy="' + i + '" data-label="' + esc(label) + '">' + esc(label) + '</button>';
  }

  function agentHtml(a, n) {
    var cmds = a.comandos.map(function (c) {
      var i = ui.copies.push(c.p) - 1;
      return '<li class="gha-cmd"><div><b>' + esc(c.t) + '</b><p>' + esc(c.p) + '</p></div><button type="button" class="gha-copy__btn" data-gha-copy="' + i + '" aria-label="Copiar comando ' + esc(c.t) + '">Copiar</button></li>';
    }).join("");
    var acts = a.acoes.map(function (x, k) {
      var key = a.id + "-" + k, on = !!state.checks[key];
      return '<li><label class="gha-check' + (on ? " on" : "") + '"><input type="checkbox" data-gha-check="' + key + '"' + (on ? " checked" : "") + '><span class="gha-box"></span><span class="gha-act"><em>' + esc(x.w) + '</em>' + esc(x.t) + '</span></label></li>';
    }).join("");
    return '<article class="gha-ag" id="gha-ag-' + a.id + '">' +
      '<h5 class="gha-ag__h"><button type="button" class="gha-ag__head" aria-expanded="false" aria-controls="gha-agb-' + a.id + '" data-gha-toggle="' + a.id + '">' +
      '<span class="gha-ag__num">' + pad(n) + '</span><span class="gha-ag__txt"><span class="gha-ag__name">' + esc(a.nome) + '</span><span class="gha-ag__sub">' + esc(a.faz) + '</span>' +
      '<span class="gha-ag__when">' + esc(a.quando) + '</span></span>' +
      '<span class="gha-chev" aria-hidden="true"></span></button></h5>' +
      '<div class="gha-ag__body" id="gha-agb-' + a.id + '" hidden>' +
      '<p class="gha-intro">' + esc(a.intro) + '</p>' +
      '<h6 class="gha-sub">Comandos do dia a dia</h6><ul class="gha-cmds">' + cmds + '</ul>' +
      '<h6 class="gha-sub">Faça nesta semana</h6><ul class="gha-acts">' + acts + '</ul>' +
      '<div class="gha-errors"><b>Erros comuns</b><ul>' + a.erros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '<details class="gha-more"><summary>Ver as instruções-base deste agente</summary><p class="gha-note">Na implementação guiada o Claude personaliza estas instruções para você. Use direto só se preferir montar à mão.</p>' + copyBlock(a.instrucoes, "Instruções-base do projeto") +
      '<p class="gha-files-k">Anexe no projeto:</p><ul class="gha-files">' + a.anexos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></details>' +
      '</div></article>';
  }

  function implHtml() {
    var pdf = CONFIG.base + CONFIG.pdf;
    var steps = D.IMPL.map(function (p, i) {
      var extra = "";
      if (i === 0) extra = '<a class="btn btn--primary gha-kit-dl" href="' + pdf + '" download data-gha-dl>Baixar Kit de Implementação (PDF)</a>';
      if (i === 1) extra = copyBlock(D.START, "Comando de início") + '<p class="gha-alt">Sem como anexar o PDF (no celular, por exemplo)? ' + copyBtn(D.kitText(), "Copiar o kit completo", "gha-copy__btn--ghost") + ' e cole na conversa no lugar do arquivo.</p>';
      return '<li><i>' + (i + 1) + '</i><div><b>' + esc(p.t) + '</b><p>' + esc(p.p) + '</p>' + extra + '</div></li>';
    }).join("");
    var S = D.SETUP;
    var manual = '<details class="gha-more"><summary>Prefere montar à mão, sem entrevista?</summary>' +
      '<ol class="gha-mini-steps">' + S.passos.map(function (p) { return '<li><b>' + esc(p.t) + '.</b> ' + esc(p.p) + '</li>'; }).join("") + '</ol>' +
      copyBlock(S.cerebro, "Modelo do Cérebro do Negócio") + '<p class="gha-note">Depois, abra cada agente abaixo e use as instruções-base.</p></details>';
    return '<section class="gha-impl" id="gha-impl"><p class="gha-fr__k">Implementação guiada · menos de 24h</p>' +
      '<h3 class="gha-fr__h">O seu Claude entrevista você e monta os agentes</h3>' +
      '<p class="gha-intro">Você conversa e o Claude monta. O Kit ensina o Claude a fazer as perguntas certas e a entregar os 9 agentes com as suas ofertas, o seu cliente e o seu jeito de falar.</p>' +
      '<ol class="gha-impl__steps">' + steps + '</ol>' + manual + '</section>';
  }

  function teamHtml() {
    var sg = seg(state.segmento), n = 0;
    var cols = FRENTES.map(function (f, i) {
      var ex = sg && sg.ex && sg.ex[f.id] ? '<p class="gha-seg"><b>No seu segmento</b>' + esc(sg.ex[f.id]) + '</p>' : "";
      var ags = f.agentes.map(function (a) { n++; return agentHtml(a, n); }).join("");
      return '<div class="gha-area" id="gha-fr-' + f.id + '"><div class="gha-area__h"><span class="gha-area__n">' + (i + 1) + '</span><div><h4>' + esc(f.nome) + '</h4><p>' + esc(f.papel) + '</p></div></div>' + ex +
        '<div class="gha-ag-list">' + ags + '</div></div>';
    }).join("");
    return '<section class="gha-team" id="gha-agentes"><p class="gha-fr__k">Sua equipe de agentes</p><h3 class="gha-fr__h">' + totalAgentes() + ' agentes, 3 áreas</h3>' +
      '<p class="gha-intro">Veja o que cada agente faz e quando usar. Abra um agente para ver os comandos prontos, a checklist e os erros comuns.</p>' +
      diagramHtml("gha-dg--sm") + cols + '</section>';
  }

  function weekHtml() {
    return '<section class="gha-week" id="gha-rotina"><p class="gha-fr__k">Rotina agêntica</p><h3 class="gha-fr__h">A sua semana com os agentes</h3><ol>' +
      D.SEMANA.map(function (s) { return '<li><b>' + esc(s.d) + '</b><span>' + esc(s.t) + '</span></li>'; }).join("") + '</ol>' +
      '<p class="gha-note">Cuidado com dados: não cole documentos, prontuários ou números de clientes identificáveis. Troque nomes por iniciais e revise tudo antes de enviar.</p></section>';
  }

  function pbHtml() {
    ui.copies = [];
    var sg = seg(state.segmento), nm = firstName();
    return '<div class="gha-screen gha-screen--pb"><p class="eyebrow">Guia High Ticket Agêntico' + (sg ? " · " + esc(sg.label) : "") + '</p>' +
      '<h2 class="gha-title" tabindex="-1">' + (nm ? esc(nm) + ", seus " : "Seus ") + totalAgentes() + ' agentes estão prontos para implementar</h2>' +
      '<nav class="gha-toc" aria-label="Seções do guia"><a href="#gha-impl" data-gha-jump="gha-impl">1. Implementar</a><a href="#gha-agentes" data-gha-jump="gha-agentes">2. Agentes</a><a href="#gha-rotina" data-gha-jump="gha-rotina">3. Rotina</a>' +
      '<a class="gha-dl" href="' + CONFIG.base + CONFIG.pdf + '" download data-gha-dl>Baixar Kit</a></nav>' +
      implHtml() + teamHtml() + weekHtml() + '</div>';
  }

  function screenHtml() { return ui.screen === "intro" ? introHtml() : ui.screen === "lead" ? qHtml() : pbHtml(); }

  function shell() {
    clearTimeout(ui.timer);
    var pb = ui.screen === "pb";
    document.body.classList.toggle("gha-s3", pb);
    var main = $("ghaMain");
    if (!pb && main && $("ghaTopDg")) {   // o diagrama fica no topo: só o conteúdo abaixo muda
      main.innerHTML = screenHtml();
      root.querySelector(".gha-steps-bar").innerHTML = stepsHtml();
      $("ghaTopDg").classList.toggle("is-compact", ui.screen === "lead");
      $("ghaScroll").scrollTop = 0;
      after(); return;
    }
    root.innerHTML =
      '<div class="gha-backdrop" data-gha-close></div>' +
      '<div class="gha" role="dialog" aria-modal="true" aria-label="Guia High Ticket Agêntico">' +
      '<div class="gha-topbar"><div class="gha-steps-bar" aria-hidden="true">' + stepsHtml() + '</div>' +
      '<div class="gha-actions">' + (state.lead ? '<button type="button" class="gha-reset" data-gha-reset>Recomeçar</button>' : "") +
      '<button type="button" class="gha-x" data-gha-close aria-label="Fechar o guia">×</button></div></div>' +
      '<div class="gha-scroll" id="ghaScroll">' + (pb ? screenHtml() :
        '<div class="gha-flow"><div class="gha-flow__dg' + (ui.screen === "lead" ? " is-compact" : "") + '" id="ghaTopDg">' + diagramHtml() + '</div><div class="gha-main" id="ghaMain">' + screenHtml() + '</div></div>') + '</div>' +
      (pb ? '<div class="gha-foot"><p>Quer os agentes rodando no seu negócio com acompanhamento?</p><a class="btn btn--primary" id="ghaWa" href="' + esc(waUrl()) + '" target="_blank" rel="noopener">Agendar Sessão Diagnóstico</a></div>' : "") +
      '</div>';
    after();
  }

  function after() {
    var inp = $("gha-in");
    if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 60);
    else { var h = root.querySelector(".gha-title, .gha-h1"); if (h) h.focus({ preventScroll: true }); }
    if (ui.screen === "intro") ui.timer = setTimeout(function () { if (ui.open && ui.screen === "intro") go("lead"); }, CONFIG.introMs);
  }
  function go(name) { ui.screen = name; dl("gha_tela", { tela: name }); shell(); }

  /* ---------- abrir, fechar, rotas ---------- */
  function isOurHash(h) { return h === CONFIG.hash || h.indexOf(CONFIG.hash + "-") === 0; }
  function open() {
    if (ui.open) return;
    ui.open = true; ui.lastFocus = document.activeElement;
    ui.q = 0; ui.draft = {}; prefill();
    ui.screen = state.lead ? "pb" : "intro";
    root.hidden = false;
    document.body.classList.add("gha-open");
    dl("gha_abrir");
    shell();
  }
  function close() {
    if (!ui.open) return;
    ui.open = false; clearTimeout(ui.timer);
    root.hidden = true; root.innerHTML = "";
    document.body.classList.remove("gha-open", "gha-s3");
    if (!state.lead) { try { localStorage.setItem(CONFIG.dismissKey, String(Date.now())); } catch (e) {} }
    if (ui.lastFocus && ui.lastFocus.focus) ui.lastFocus.focus({ preventScroll: true });
  }
  function closeAndClean() {
    if (isOurHash(location.hash)) history.pushState(null, "", location.pathname + location.search);
    close();
  }
  function route() {
    if (isOurHash(location.hash)) {
      open();
      if (state.lead && location.hash !== guideHash()) history.replaceState(null, "", location.pathname + location.search + guideHash());
    } else close();
  }
  function startFlow() { if (isOurHash(location.hash)) open(); else location.hash = state.lead ? guideHash() : CONFIG.hash; }

  function resetAll() {
    state = { lead: null, segmento: null, checks: {} };
    try { localStorage.removeItem(CONFIG.storageKey); } catch (e) {}
    history.replaceState(null, "", location.pathname + location.search + CONFIG.hash);
    ui.q = 0; ui.draft = {}; prefill(); go("intro");
  }

  /* ---------- cadastro ---------- */
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
  function validate(k, v) {
    if (k === "nome") return v.length < 2 ? "Informe seu nome." : "";
    if (k === "whatsapp") return phoneOk(v) ? "" : "Informe um WhatsApp com DDD (aceita +55).";
    if (k === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Informe um e-mail válido.";
    return "";
  }
  function err(msg) { var e = $("gha-err"); if (e) e.textContent = msg || ""; }
  function finishLead() {
    var d = ui.draft;
    state.lead = { nome: d.nome, email: d.email, whatsapp: d.whatsapp, porte: d.porte, consent: true };
    state.segmento = d.segmento; save();
    try { localStorage.removeItem(CONFIG.dismissKey); } catch (e) {}
    sendLead("cadastro");
    dl("gha_cadastro");
    if (qualKey() === "qualificado") dl("lead_qualificado");
    history.replaceState(null, "", location.pathname + location.search + guideHash());
    go("pb");
  }

  /* ---------- copiar ---------- */
  function copy(text, btn) {
    var label = btn.getAttribute("data-label") || "Copiar";
    function ok() { btn.textContent = "Copiado"; btn.classList.add("is-done"); setTimeout(function () { btn.textContent = label; btn.classList.remove("is-done"); }, 1800); }
    function fallback() {
      var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (e) {}
      document.body.removeChild(t);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  function toggle(id) {
    var art = $("gha-ag-" + id); if (!art) return;
    var head = art.querySelector(".gha-ag__head"), body = $("gha-agb-" + id);
    var on = head.getAttribute("aria-expanded") !== "true";
    head.setAttribute("aria-expanded", on ? "true" : "false");
    body.hidden = !on; art.classList.toggle("is-open", on);
    if (on) dl("gha_agente", { agente: id });
  }

  /* ---------- eventos ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("[data-gha-open]")) { e.preventDefault(); dl("gha_cta", { local: t.closest("[data-gha-open]").getAttribute("data-gha-open") || "" }); startFlow(); return; }
    if (!ui.open || !root.contains(t)) return;
    if (t.closest("[data-gha-close]")) { closeAndClean(); return; }
    if (t.closest("[data-gha-reset]")) { resetAll(); return; }
    if (t.closest("#ghaWa")) { sendLead("cta-whatsapp"); dl("gha_cta_whatsapp"); return; }
    if (t.closest("[data-gha-dl]")) { sendLead("download-kit"); dl("gha_download_kit"); return; }
    var cp = t.closest("[data-gha-copy]");
    if (cp) { copy(ui.copies[+cp.getAttribute("data-gha-copy")], cp); dl("gha_copiar"); return; }
    var jp = t.closest("[data-gha-jump]");
    if (jp) { e.preventDefault(); var el = $(jp.getAttribute("data-gha-jump")); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    var tg = t.closest("[data-gha-toggle]");
    if (tg) { toggle(tg.getAttribute("data-gha-toggle")); return; }
    if (t.closest(".gha-screen--intro") || (ui.screen === "intro" && t.closest("#ghaTopDg"))) { go("lead"); return; }
    if (t.closest("[data-gha-qback]")) { if (ui.q > 0) { ui.q--; shell(); } else go("intro"); return; }
    var qo = t.closest("[data-gha-opt]");
    if (qo) { ui.draft[QS[ui.q].k] = qo.getAttribute("data-gha-opt"); ui.q++; shell(); return; }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && ui.open) closeAndClean(); });
  root.addEventListener("input", function (e) {
    if (e.target && e.target.id === "gha-in") { if (e.target.type === "tel") e.target.value = maskPhone(e.target.value); err(""); }
  });
  root.addEventListener("submit", function (e) {
    if (e.target.id !== "ghaForm") return;
    e.preventDefault();
    var q = QS[ui.q];
    if (q.type === "final") {
      var r = root.querySelector('input[name="gha-porte"]:checked');
      if (!r) { err("Escolha uma opção."); return; }
      if (!$("gha-consent").checked) { err("Marque para continuar."); return; }
      ui.draft.porte = r.value; finishLead(); return;
    }
    var el = $("gha-in"), v = el.value.trim(), m = validate(q.k, v);
    if (m) { err(m); el.focus(); return; }
    ui.draft[q.k] = v; ui.q++; shell();
  });
  root.addEventListener("change", function (e) {
    var k = e.target.getAttribute && e.target.getAttribute("data-gha-check");
    if (!k) return;
    state.checks[k] = e.target.checked; save();
    var lab = e.target.closest(".gha-check"); if (lab) lab.classList.toggle("on", e.target.checked);
  });

  /* ---------- abertura automática ---------- */
  function autoOk() {
    if (!CONFIG.auto.enabled || ui.open || state.lead) return false;
    if (location.hash && location.hash.length > 1) return false;
    var mb = document.getElementById("modalBackdrop"); if (mb && mb.classList.contains("is-open")) return false;
    try { var t = +localStorage.getItem(CONFIG.dismissKey) || 0; if (Date.now() - t < CONFIG.auto.snoozeDays * 864e5) return false; } catch (e) {}
    return true;
  }
  function armAuto() {
    if (!autoOk()) return;
    var fired = false;
    function fire() { if (fired) return; fired = true; window.removeEventListener("scroll", onScroll); clearTimeout(tm); if (autoOk()) { dl("gha_auto"); location.hash = CONFIG.hash; } }
    function onScroll() { var h = document.documentElement; if ((h.scrollTop + window.innerHeight) / h.scrollHeight >= CONFIG.auto.scrollRatio) fire(); }
    var tm = setTimeout(fire, CONFIG.auto.delayMs);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* expõe o diagrama e o WhatsApp para a página do PDF */
  window.GHA = { diagram: diagramHtml, waUrl: waUrl, total: totalAgentes };

  load();
  if (!document.body.classList.contains("gha-pdf")) {
    window.addEventListener("hashchange", route);
    if (openOnLoad && !location.hash) history.replaceState(null, "", location.pathname + location.search + (state.lead ? guideHash() : CONFIG.hash));
    route();
    armAuto();
  }
})();
