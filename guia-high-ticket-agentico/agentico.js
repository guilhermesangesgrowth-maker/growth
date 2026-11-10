/* =====================================================================
 * GUIA HIGH TICKET AGÊNTICO: pop-up de captura no site principal
 * Mesmo fluxo do Guia Growth 30D, em 3 telas:
 *   1) abertura (avança com clique ou em 7 segundos)
 *   2) cadastro, uma pergunta por tela
 *   3) entrega do guia (9 agentes, comandos com botão de copiar, PDF)
 * Abre por: botões com [data-gha-open], link direto #guia-agentico,
 * ou sozinho (uma vez por visita) depois de tempo/rolagem na página.
 * Depois do cadastro a URL vira #guia-agentico-1 (investe em marketing)
 * ou #guia-agentico-2 (não investe), para gatilhos de remarketing no GTM.
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
    storageKey: "gha-v1",
    dismissKey: "gha-dismiss",
    hash: "#guia-agentico",
    base: "guia-high-ticket-agentico/",   // caminho da pasta do guia a partir da página que carrega o script
    pdf: "guia-high-ticket-agentico.pdf",
    introMs: 7000,
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
  var INVEST = ["Não invisto em marketing", "Invisto mas não tenho o resultado que gostaria", "Invisto e estou satisfeito(a) com o resultado"];
  var QS = [
    { k: "nome", type: "text", q: "Qual é o seu nome?", ph: "Seu nome", ac: "name", im: "text" },
    { k: "whatsapp", type: "tel", q: "Qual é o seu WhatsApp?", ph: "(00) 00000-0000", ac: "tel", im: "tel" },
    { k: "email", type: "email", q: "Qual é o seu melhor e-mail?", ph: "voce@email.com", ac: "email", im: "email" },
    { k: "segmento", type: "opts", q: "Qual é o seu segmento?" },
    { k: "frente", type: "opts", q: "Onde o seu negócio mais precisa de ajuda hoje?" },
    { k: "investe", type: "final", q: "Já investe em marketing (agência, audiovisual ou tráfego)?" }
  ];
  var SCREENS = ["intro", "lead", "pb"];

  /* ---------- estado ---------- */
  var state = { lead: null, segmento: null, frente: null, checks: {} };
  var ui = { open: false, screen: "intro", q: 0, draft: {}, timer: null, copies: [], lastFocus: null };

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
      state.lead = s.lead || null; state.segmento = s.segmento || null; state.frente = s.frente || null; state.checks = s.checks || {};
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {}
  }
  /* Quem já se cadastrou no Guia Growth 30D chega com nome, WhatsApp e e-mail preenchidos */
  function prefill() {
    try {
      var g = JSON.parse(localStorage.getItem("g30d-v3") || "{}");
      if (g.lead) { ui.draft.nome = g.lead.nome || ""; ui.draft.whatsapp = g.lead.whatsapp || ""; ui.draft.email = g.lead.email || ""; }
      if (g.segmento) ui.draft.segmento = g.segmento;
    } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function seg(id) { return SEGS.filter(function (s) { return s.id === id; })[0]; }
  function frente(id) { return FRENTES.filter(function (f) { return f.id === id; })[0]; }
  function segLabel() { var s = seg(state.segmento); return s ? s.label : ""; }
  function frenteLabel() { var f = frente(state.frente); return f ? f.nome + " (" + f.sub + ")" : ""; }
  function totalAgentes() { return FRENTES.reduce(function (n, f) { return n + f.agentes.length; }, 0); }

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
    b.append(f.segmento, segLabel()); b.append(f.porte, "");
    b.append(f.estagio, frenteLabel()); b.append(f.jornada, state.frente || "");
    b.append(f.consentimento, state.lead.consent ? "sim" : "nao"); b.append(f.investe, state.lead.investe || "");
    b.append(f.pagina, location.href.split("#")[0]);
    try { fetch(CONFIG.leadEndpoint, { method: "POST", mode: "no-cors", body: b, keepalive: true }).catch(function () {}); } catch (e) {}
  }
  function qualKey() {
    var v = state.lead && state.lead.investe;
    if (v === INVEST[1]) return "qualificado-insatisfeito";
    if (v === INVEST[2]) return "qualificado-satisfeito";
    if (v === INVEST[0]) return "nao-qualificado";
    return "";
  }
  function guideHash() {
    var k = qualKey();
    if (k === "nao-qualificado") return CONFIG.hash + "-2";
    return k ? CONFIG.hash + "-1" : CONFIG.hash;
  }
  window.dataLayer = window.dataLayer || [];
  function dl(event, extra) {
    var o = { event: event, guia: CONFIG.origem, qualificacao: qualKey() || "sem-cadastro", segmento: segLabel(), frente: state.frente || "" };
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

  /* mockup: painel de projetos com os 9 agentes */
  function mockHtml() {
    var groups = FRENTES.map(function (f, i) {
      var items = f.agentes.map(function (a) { return '<li>' + esc(a.nome.replace("Agente ", "").replace(/^de /, "")) + '</li>'; }).join("");
      return '<div class="gha-mk__g gha-mk__g' + (i + 1) + '"><b>' + esc(f.nome) + '</b><ul>' + items + '</ul></div>';
    }).join("");
    return '<div class="gha-stage" id="ghaMock" aria-hidden="true"><div class="gha-mk">' +
      '<div class="gha-mk__top"><span></span><span></span><span></span><em>Projetos</em></div>' +
      '<div class="gha-mk__in"><p class="gha-mk__k">Guia High Ticket Agêntico</p><p class="gha-mk__h">' + totalAgentes() + ' agentes prontos no Claude</p>' + groups +
      '<div class="gha-mk__chat"><span class="gha-mk__msg">Prepare o briefing da reunião de amanhã</span><span class="gha-mk__typing"><i></i><i></i><i></i></span></div>' +
      '</div></div><span class="gha-glow"></span></div>';
  }

  var MARQ = ["Médicos", "Dentistas", "Arquitetos", "Engenheiros", "Advogados", "Consultores", "Executivos", "Empresários"].map(function (s) { return "<span>" + s + "</span>"; }).join("");
  function introHtml() {
    return '<div class="gha-screen gha-screen--intro">' +
      '<p class="eyebrow">Material gratuito · novo</p>' +
      '<h2 class="gha-h1" tabindex="-1">Monte <span class="text-orange">' + totalAgentes() + ' agentes no Claude</span> que cuidam do marketing, das vendas e da gestão do seu negócio high-ticket.</h2>' +
      '<p class="gha-lead">Guia plug-and-play: instruções prontas para copiar e colar, comandos do dia a dia e a rotina da semana. Sem programar.</p>' +
      '<ul class="gha-pills">' + FRENTES.map(function (f) { return '<li><b>' + esc(f.nome) + '</b><small>' + esc(f.sub) + '</small></li>'; }).join("") + '</ul>' +
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
      var list = q.k === "segmento"
        ? SEGS.map(function (s) { return { v: s.id, l: s.label }; })
        : FRENTES.map(function (f) { return { v: f.id, l: f.nome, s: f.sub }; });
      body = '<div class="gha-opts' + (q.k === "frente" ? " gha-opts--col" : "") + '" role="radiogroup">' + list.map(function (o) {
        return '<button type="button" role="radio" aria-checked="' + (d[q.k] === o.v) + '" class="gha-opt' + (d[q.k] === o.v ? " here" : "") + '" data-gha-opt="' + esc(o.v) + '">' + esc(o.l) + (o.s ? '<small>' + esc(o.s) + '</small>' : "") + '</button>';
      }).join("") + '</div><span class="gha-err" id="gha-err" role="alert"></span>';
    } else if (q.type === "final") {
      body = '<form id="ghaForm" novalidate><div class="gha-radios">' + INVEST.map(function (t) {
        return '<label class="gha-radio"><input type="radio" name="gha-investe" value="' + esc(t) + '"' + (d.investe === t ? " checked" : "") + '><span class="gha-dot"></span><span>' + esc(t) + '</span></label>';
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

  /* ---------- tela 3: o guia ---------- */
  function copyBlock(text, label) {
    var i = ui.copies.push(text) - 1;
    return '<div class="gha-copy"><div class="gha-copy__bar"><span>' + esc(label) + '</span><button type="button" class="gha-copy__btn" data-gha-copy="' + i + '">Copiar</button></div><pre>' + esc(text) + '</pre></div>';
  }

  function agentHtml(a, n, f) {
    var cmds = a.comandos.map(function (c) {
      var i = ui.copies.push(c.p) - 1;
      return '<li class="gha-cmd"><div><b>' + esc(c.t) + '</b><p>' + esc(c.p) + '</p></div><button type="button" class="gha-copy__btn" data-gha-copy="' + i + '" aria-label="Copiar comando ' + esc(c.t) + '">Copiar</button></li>';
    }).join("");
    var acts = a.acoes.map(function (x, k) {
      var key = a.id + "-" + k, on = !!state.checks[key];
      return '<li><label class="gha-check' + (on ? " on" : "") + '"><input type="checkbox" data-gha-check="' + key + '"' + (on ? " checked" : "") + '><span class="gha-box"></span><span class="gha-act"><em>' + esc(x.w) + '</em>' + esc(x.t) + '</span></label></li>';
    }).join("");
    return '<article class="gha-ag" id="gha-ag-' + a.id + '">' +
      '<h4 class="gha-ag__h"><button type="button" class="gha-ag__head" aria-expanded="false" aria-controls="gha-agb-' + a.id + '" data-gha-toggle="' + a.id + '">' +
      '<span class="gha-ag__num">' + pad(n) + '</span><span class="gha-ag__txt"><span class="gha-ag__name">' + esc(a.nome) + '</span><span class="gha-ag__sub">' + esc(a.faz) + '</span></span>' +
      '<span class="gha-chev" aria-hidden="true"></span></button></h4>' +
      '<div class="gha-ag__body" id="gha-agb-' + a.id + '" hidden>' +
      '<p class="gha-when"><span>Quando usar</span>' + esc(a.quando) + '</p>' +
      '<p class="gha-intro">' + esc(a.intro) + '</p>' +
      '<h5 class="gha-sub">1 · Crie o projeto "' + esc(a.nome) + '" e cole as instruções</h5>' + copyBlock(a.instrucoes, "Instruções do projeto") +
      '<h5 class="gha-sub">2 · Anexe no conhecimento do projeto</h5><ul class="gha-files">' + a.anexos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>' +
      '<h5 class="gha-sub">3 · Comandos do dia a dia</h5><ul class="gha-cmds">' + cmds + '</ul>' +
      '<h5 class="gha-sub">Faça nesta semana</h5><ul class="gha-acts">' + acts + '</ul>' +
      '<div class="gha-errors"><b>Erros comuns</b><ul>' + a.erros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '</div></article>';
  }

  function setupHtml() {
    var S = D.SETUP;
    var steps = S.passos.map(function (p, i) { return '<li><i>' + (i + 1) + '</i><div><b>' + esc(p.t) + '</b><p>' + esc(p.p) + '</p></div></li>'; }).join("");
    return '<section class="gha-setup" id="gha-setup"><p class="gha-fr__k">Passo 0</p><h3 class="gha-fr__h">' + esc(S.titulo) + '</h3>' +
      S.intro.map(function (p) { return '<p class="gha-intro">' + esc(p) + '</p>'; }).join("") +
      '<ol class="gha-steps">' + steps + '</ol>' +
      '<h5 class="gha-sub">Modelo do Cérebro do Negócio</h5>' + copyBlock(S.cerebro, "Cérebro do Negócio") + '</section>';
  }

  function orderedFrentes() {
    var list = FRENTES.slice();
    if (state.frente) list.sort(function (a, b) { return (b.id === state.frente) - (a.id === state.frente); });
    return list;
  }

  function guideBody(opts) {
    opts = opts || {};
    var sg = seg(state.segmento), n = 0;
    var frentes = (opts.fixedOrder ? FRENTES : orderedFrentes()).map(function (f) {
      var prio = !opts.fixedOrder && f.id === state.frente;
      var ex = sg && sg.ex && sg.ex[f.id] ? '<p class="gha-seg"><b>No seu segmento (' + esc(sg.label) + ')</b>' + esc(sg.ex[f.id]) + '</p>' : "";
      var base = FRENTES.indexOf(f) * 3;
      var ags = f.agentes.map(function (a, k) { return agentHtml(a, base + k + 1, f); }).join("");
      n += f.agentes.length;
      return '<section class="gha-fr' + (prio ? " is-prio" : "") + '" id="gha-fr-' + f.id + '"><div class="gha-fr__top"><p class="gha-fr__k">Frente ' + (FRENTES.indexOf(f) + 1) + '</p>' + (prio ? '<span class="gha-tag">Sua prioridade</span>' : "") + '</div>' +
        '<h3 class="gha-fr__h">' + esc(f.nome) + '</h3><p class="gha-fr__s">' + esc(f.sub) + '</p>' + ex +
        '<div class="gha-ag-list">' + ags + '</div></section>';
    }).join("");
    var semana = '<section class="gha-week"><p class="gha-fr__k">Rotina agêntica</p><h3 class="gha-fr__h">A sua semana com os agentes</h3><ol>' +
      D.SEMANA.map(function (s) { return '<li><b>' + esc(s.d) + '</b><span>' + esc(s.t) + '</span></li>'; }).join("") + '</ol>' +
      '<p class="gha-note">Cuidado com dados: não cole documentos, prontuários ou números de clientes identificáveis. Troque nomes por iniciais e revise tudo antes de enviar.</p></section>';
    return setupHtml() + frentes + semana;
  }

  function pbHtml() {
    ui.copies = [];
    var sg = seg(state.segmento), f = frente(state.frente);
    var lead = (f ? "Começamos pela sua prioridade: " + f.nome + ". " : "") + "Abra cada agente, copie as instruções para um Projeto no Claude e use os comandos prontos.";
    return '<div class="gha-screen gha-screen--pb"><p class="eyebrow">Guia High Ticket Agêntico' + (sg ? " · " + esc(sg.label) : "") + '</p>' +
      '<h2 class="gha-title" tabindex="-1">Seus ' + totalAgentes() + ' agentes no Claude</h2>' +
      '<p class="gha-lead">' + esc(lead) + '</p>' +
      '<div class="gha-toc">' + ['<a href="#gha-setup" data-gha-jump="gha-setup">Montagem</a>'].concat(orderedFrentes().map(function (x) { return '<a href="#gha-fr-' + x.id + '" data-gha-jump="gha-fr-' + x.id + '">' + esc(x.nome) + '</a>'; })).join("") +
      '<a class="gha-dl" href="' + CONFIG.base + CONFIG.pdf + '" download data-gha-dl>Baixar PDF</a></div>' +
      guideBody() + '</div>';
  }

  function screenHtml() { return ui.screen === "intro" ? introHtml() : ui.screen === "lead" ? qHtml() : pbHtml(); }

  function shell() {
    clearTimeout(ui.timer);
    var pb = ui.screen === "pb";
    document.body.classList.toggle("gha-s3", pb);
    var main = $("ghaMain");
    if (!pb && main && $("ghaMock")) {   // o mockup fica: só o conteúdo ao lado muda
      main.innerHTML = screenHtml();
      root.querySelector(".gha-steps-bar").innerHTML = stepsHtml();
      $("ghaScroll").scrollTop = 0;
      after(); return;
    }
    root.innerHTML =
      '<div class="gha-backdrop" data-gha-close></div>' +
      '<div class="gha" role="dialog" aria-modal="true" aria-label="Guia High Ticket Agêntico">' +
      '<div class="gha-topbar"><div class="gha-steps-bar" aria-hidden="true">' + stepsHtml() + '</div>' +
      '<div class="gha-actions">' + (state.lead ? '<button type="button" class="gha-reset" data-gha-reset>Recomeçar</button>' : "") +
      '<button type="button" class="gha-x" data-gha-close aria-label="Fechar o guia">×</button></div></div>' +
      '<div class="gha-scroll" id="ghaScroll">' + (pb ? screenHtml() : '<div class="gha-split">' + mockHtml() + '<div class="gha-main" id="ghaMain">' + screenHtml() + '</div></div>') + '</div>' +
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
  function startFlow() { if (location.hash === CONFIG.hash || isOurHash(location.hash)) open(); else location.hash = state.lead ? guideHash() : CONFIG.hash; }

  function resetAll() {
    state = { lead: null, segmento: null, frente: null, checks: {} };
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
    state.lead = { nome: d.nome, email: d.email, whatsapp: d.whatsapp, investe: d.investe, consent: true };
    state.segmento = d.segmento; state.frente = d.frente; save();
    try { localStorage.removeItem(CONFIG.dismissKey); } catch (e) {}
    sendLead("cadastro");
    dl("gha_cadastro");
    if (qualKey().indexOf("qualificado") === 0) dl("lead_qualificado");
    history.replaceState(null, "", location.pathname + location.search + guideHash());
    go("pb");
  }

  /* ---------- copiar ---------- */
  function copy(text, btn) {
    function ok() { btn.textContent = "Copiado"; btn.classList.add("is-done"); setTimeout(function () { btn.textContent = "Copiar"; btn.classList.remove("is-done"); }, 1800); }
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
    if (t.closest("[data-gha-dl]")) { sendLead("download-pdf"); dl("gha_download_pdf"); return; }
    var cp = t.closest("[data-gha-copy]");
    if (cp) { copy(ui.copies[+cp.getAttribute("data-gha-copy")], cp); dl("gha_copiar"); return; }
    var jp = t.closest("[data-gha-jump]");
    if (jp) { e.preventDefault(); var el = $(jp.getAttribute("data-gha-jump")); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    var tg = t.closest("[data-gha-toggle]");
    if (tg) { toggle(tg.getAttribute("data-gha-toggle")); return; }
    if (t.closest(".gha-screen--intro")) { go("lead"); return; }
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
      var r = root.querySelector('input[name="gha-investe"]:checked');
      if (!r) { err("Escolha uma opção."); return; }
      if (!$("gha-consent").checked) { err("Marque para continuar."); return; }
      ui.draft.investe = r.value; finishLead(); return;
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

  /* expõe o render para a página do PDF */
  window.GHA = { guideBody: function () { ui.copies = []; return guideBody({ fixedOrder: true }); }, waUrl: waUrl, total: totalAgentes };

  load();
  if (!document.body.classList.contains("gha-pdf")) {
    window.addEventListener("hashchange", route);
    if (openOnLoad && !location.hash) history.replaceState(null, "", location.pathname + location.search + (state.lead ? guideHash() : CONFIG.hash));
    route();
    armAuto();
  }
})();
