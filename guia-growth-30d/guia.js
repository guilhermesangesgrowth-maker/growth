/* Guia Growth 30D: scripts da página (menu, cases e fluxo do diagnóstico) */
document.getElementById("year").textContent = new Date().getFullYear();
/* ============ NAV SHADOW ON SCROLL ============ */
const navEl = document.getElementById("nav");
window.addEventListener(
  "scroll",
  () => {
    navEl.style.borderBottomColor = window.scrollY > 20 ? "rgba(255,107,0,0.35)" : "";
  },
  { passive: true }
);

/* ============ MENU MOBILE (SANDUÍCHE) ============ */
(function initMobileNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMobile");
  if (!nav || !toggle || !menu) return;

  function setOpen(open) {
    nav.classList.toggle("nav--open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("nav--open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  window.matchMedia("(min-width: 860px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();

/* ============ CASES: CARROSSEL AUTOMÁTICO NO MOBILE (4s) ============ */
(function initCasesCarousel() {
  const grid = document.querySelector(".cases-grid");
  if (!grid) return;

  const mobile = window.matchMedia("(max-width: 899px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;
  let resumeTimer = null;
  let index = 0;

  const cards = () => grid.querySelectorAll(".case-card");

  function currentIndex() {
    const list = cards();
    if (!list.length) return 0;
    const step = list[0].offsetWidth + (parseFloat(getComputedStyle(grid).columnGap) || 14);
    return Math.max(0, Math.min(list.length - 1, Math.round(grid.scrollLeft / step)));
  }

  function go(n) {
    const list = cards();
    if (!list.length) return;
    index = (n + list.length) % list.length;
    grid.scrollTo({ left: list[index].offsetLeft, behavior: "smooth" });
  }

  function start() {
    if (reduce || timer || !mobile.matches) return;
    timer = setInterval(() => go(currentIndex() + 1), 4000);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    clearTimeout(resumeTimer);
  }
  function resumeLater() {
    stop();
    resumeTimer = setTimeout(start, 6000);
  }

  grid.addEventListener("touchstart", stop, { passive: true });
  grid.addEventListener("touchend", resumeLater, { passive: true });
  grid.addEventListener("mouseenter", stop);
  grid.addEventListener("mouseleave", start);
  grid.addEventListener("focusin", stop);
  grid.addEventListener("focusout", start);

  mobile.addEventListener("change", () => {
    stop();
    if (mobile.matches) start();
    else grid.scrollLeft = 0;
  });
  start();
})();

/* =====================================================================
 * GUIA GROWTH 30D: fluxo captura -> diagnóstico -> resultado + playbook
 * Tudo em uma única URL: / (captura), #diagnostico (perguntas), #resultado
 * ===================================================================== */
var CONFIG = {
  whatsapp: "5519998878022",
  leadEndpoint: "",        // URL do Web App do Google Apps Script (ver leads-sheets.gs). Vazio = não envia
  origem: "guia-growth-30d",
  storageKey: "g30d-v2",
  gateBefore: 5            // o cadastro aparece antes da pergunta de índice 5 (a 6ª), ou seja, entre a 5ª e a 6ª
};

/* ---------- Áreas do método (uma pergunta e uma seção do playbook para cada) ---------- */
var AREAS = [
  { id: "tese", short: "Tese", name: "Tese", sub: "O cenário do mercado",
    tip: "Escreva a sua tese em três frases: o que o mercado faz de errado, o que você faz diferente e qual resultado o cliente leva." },
  { id: "produto", short: "Produto", name: "Construção do produto", sub: "ICP e problem-solving",
    tip: "Escolha um cliente ideal e um problema, e desenhe o método em 3 a 5 etapas com um entregável em cada uma." },
  { id: "posicionamento", short: "Posição", name: "Posicionamento", sub: "A frase que o cliente certo reconhece",
    tip: "Escreva a frase de posicionamento e atualize bio, proposta e apresentação com ela, junto com três provas." },
  { id: "canais", short: "Canais", name: "Canais de aquisição", sub: "Funis do método",
    tip: "Escolha dois canais, defina uma rotina semanal para cada um e acompanhe quantas conversas qualificadas eles geram." },
  { id: "ia", short: "IA e martech", name: "IA e martech", sub: "Soluções core de IA e martech",
    tip: "Organize o CRM com etapas e origem do lead, monte um painel simples e automatize a primeira resposta e o follow-up." },
  { id: "vendas", short: "Vendas", name: "Processos de vendas", sub: "Alta performance em inside sales",
    tip: "Padronize a sessão diagnóstico com roteiro, termine sempre com proposta e próximo passo agendado e crie a cadência de follow-up." },
  { id: "expansao", short: "Expansão", name: "Satisfação e expansão", sub: "CX e expansão de receita",
    tip: "Defina um marco de resultado para cada cliente, peça indicação nesse momento e tenha uma oferta de continuidade pronta." }
];

/* ---------- Perguntas: 1 de perfil (sem nota) + 7 (uma por área), de 0 a 3 pontos ---------- */
var QUESTIONS = [
  { id: "perfil", area: null, text: "Qual é a sua atuação principal?", opts: [
    { t: "Saúde (médico, dentista, psicólogo...)", v: "saude" },
    { t: "Engenharia ou arquitetura", v: "engenharia-arquitetura" },
    { t: "Advocacia, contabilidade ou finanças", v: "juridico-financas" },
    { t: "Executivo(a) ou gestor(a) de empresa", v: "executivo" },
    { t: "Empresário(a) de varejo ou serviço de alto ticket", v: "empresario" },
    { t: "Outro", v: "outro" } ] },

  { id: "q_tese", area: "tese", text: "Você sabe qual é o inimigo comum do seu cliente, a prática ou crença do mercado que atrapalha o resultado dele?", opts: [
    { t: "Nunca pensei nisso.", s: 0 },
    { t: "Tenho uma ideia, mas nunca escrevi.", s: 1 },
    { t: "Tenho uma tese escrita e uso nas conversas.", s: 2 },
    { t: "A tese está clara e aparece no conteúdo, na proposta e na venda.", s: 3 } ] },
  { id: "q_produto", area: "produto", text: "Quão claro é o cliente que você atende e o problema que resolve?", opts: [
    { t: "Atendo quem aparecer.", s: 0 },
    { t: "Tenho um perfil geral, sem um problema específico.", s: 1 },
    { t: "Cliente ideal e problema definidos.", s: 2 },
    { t: "Cliente, problema, resultado e método documentados e testados.", s: 3 } ] },
  { id: "q_posicionamento", area: "posicionamento", text: "Como o mercado entende o que você faz e por que escolher você?", opts: [
    { t: "Me descrevem pelo cargo ou pela formação.", s: 0 },
    { t: "Falo do que sei fazer, sem delimitar público e resultado.", s: 1 },
    { t: "Tenho uma frase com público e resultado.", s: 2 },
    { t: "Frase, diferencial e provas consistentes em perfil, proposta e conversas.", s: 3 } ] },
  { id: "q_canais", area: "canais", text: "De onde vêm hoje os seus potenciais clientes?", opts: [
    { t: "Quase só de indicação, sem previsibilidade.", s: 0 },
    { t: "Indicação e algum conteúdo ocasional.", s: 1 },
    { t: "Mais de um canal ativo, com rotina.", s: 2 },
    { t: "Canais acompanhados, com meta de conversas por mês.", s: 3 } ] },

  { id: "q_ia", area: "ia", text: "Como você usa CRM, automação e IA na operação de vendas?", opts: [
    { t: "Planilhas e conversas soltas.", s: 0 },
    { t: "CRM básico ou uso ocasional de IA.", s: 1 },
    { t: "CRM organizado, com automações e IA em tarefas repetitivas.", s: 2 },
    { t: "Ferramentas integradas, com painel e números por etapa.", s: 3 } ] },
  { id: "q_vendas", area: "vendas", text: "Como é o seu processo de vendas, da primeira conversa ao fechamento?", opts: [
    { t: "Conversa solta, sem roteiro.", s: 0 },
    { t: "Roteiro informal, que muda a cada conversa.", s: 1 },
    { t: "Sessão diagnóstico com roteiro, proposta e follow-up com prazos.", s: 2 },
    { t: "Processo padronizado, com número por etapa e meta semanal.", s: 3 } ] },
  { id: "q_expansao", area: "expansao", text: "Como você mantém e expande a receita de quem já é cliente?", opts: [
    { t: "O projeto termina e a relação também.", s: 0 },
    { t: "Peço indicação de vez em quando.", s: 1 },
    { t: "Acompanho o cliente e peço indicação depois do resultado.", s: 2 },
    { t: "Rotina de acompanhamento, indicações, upsell e parcerias planejados.", s: 3 } ] }
];

var LEVELS = [
  { slug: "inicial", name: "Base a construir", range: "0 a 5", min: 0,
    summary: "A consultoria ainda depende de indicação e de decisões soltas. O melhor retorno está em definir tese, produto e posicionamento antes de investir em canais.",
    next: "Comece pela semana 0 do plano: tese, produto e posicionamento. Depois abra um canal por vez." },
  { slug: "exploratorio", name: "Em validação", range: "6 a 10", min: 6,
    summary: "Você já vende, mas o resultado depende de esforço individual. O ganho vem de transformar o que funciona em processo.",
    next: "Padronize a sessão diagnóstico, crie a cadência de follow-up e escolha dois canais para rodar com rotina." },
  { slug: "estruturado", name: "Estruturado", range: "11 a 16", min: 11,
    summary: "Há produto, canais e rotina de vendas. O próximo salto vem de medir cada etapa e de expandir a receita de quem já é cliente.",
    next: "Meça o funil por etapa, automatize o que é repetitivo e ative indicação e continuidade." },
  { slug: "avancado", name: "Previsível", range: "17 a 21", min: 17,
    summary: "A consultoria tem processo e números. O foco passa a ser escala, ticket e retorno por canal.",
    next: "Otimize o canal que mais rende, aumente o ticket com uma oferta de continuidade e delegue tarefas repetitivas para automação e IA." }
];
var MAX_SCORE = 21;

/* ---------- Playbook: uma seção para cada área do método ---------- */
var PLAYBOOK = {
  tese: {
    title: "Autoridade sozinha deixou de vender consultoria",
    intro: [
      "Quem compra consultoria recebe ofertas de agências, gurus e concorrentes todos os dias. Ter um currículo forte abre portas, mas a decisão de compra pede uma tese: o que o mercado faz de errado, o que você faz diferente e qual resultado o cliente leva.",
      "A tese também organiza tudo o que vem depois. Ela define o que você publica, o que você promete e como você conduz a venda."
    ],
    cardsTitle: "Os três inimigos comuns",
    cards: [
      { t: "A agência que só posta", p: "Entrega post bonito, alcance e curtida, e a agenda segue vazia. O que paga a conta são reuniões marcadas e contratos fechados." },
      { t: "A agenda limitada", p: "No modelo de serviços, a receita fica presa ao seu tempo. O resultado é uma rotina exaustiva e um teto de faturamento." },
      { t: "O guru do marketing", p: "Vende mentoria em grupo, repete a mesma fórmula para todo mundo e não mergulha no seu negócio." }
    ],
    dream: "O sonho comum: mais receita com menos trabalho, sem depender só de postar.",
    actions: [
      { w: "Semana 0", t: "Escreva a sua tese em três frases: o que o mercado faz de errado, o que você faz e qual resultado o cliente leva." },
      { w: "Semana 0", t: "Liste cinco concorrentes ou alternativas e anote como cada um se posiciona." },
      { w: "Semana 1", t: "Pergunte a cinco clientes por que escolheram você e quais alternativas consideraram." },
      { w: "Semana 1", t: "Transforme a tese em uma pauta fixa de conteúdo e em um slide da sua apresentação de vendas." }
    ],
    errors: ["Copiar a tese de outra pessoa do mercado.", "Uma tese genérica como \"ajudo empresas a crescer\".", "Falar mal de concorrentes em vez de mostrar a prática que prejudica o cliente."]
  },
  produto: {
    title: "Defina quem você atende e qual problema resolve",
    intro: [
      "Consultoria que atende qualquer pessoa vira consultoria difícil de vender. O produto começa por um cliente ideal (ICP) e por um problema que ele reconhece e paga para resolver.",
      "Depois vem o método: etapas curtas, cada uma com um entregável. É isso que transforma conhecimento em algo que o cliente enxerga, compara e compra."
    ],
    cardsTitle: "Os quatro blocos do produto",
    cards: [
      { t: "Cliente ideal", p: "Quem é, em que setor e porte atua, em que momento está e qual gatilho faz essa pessoa procurar ajuda." },
      { t: "Problema", p: "A dor em uma frase, nas palavras do cliente, e o custo de continuar com ela." },
      { t: "Resultado e prazo", p: "O que muda ao final do projeto e em quanto tempo, com uma forma clara de medir." },
      { t: "Método e entregáveis", p: "Três a cinco etapas com nome, cada uma com um entregável que o cliente recebe." }
    ],
    actions: [
      { w: "Semana 0", t: "Escolha um cliente ideal e escreva as cinco perguntas que ele faz antes de contratar." },
      { w: "Semana 0", t: "Liste três problemas que você resolve e escolha o de maior urgência e maior valor." },
      { w: "Semana 0", t: "Desenhe o método em 3 a 5 etapas com nome e entregável. Dê um nome ao método." },
      { w: "Semana 1", t: "Feche escopo, prazo e preço baseado no valor do resultado, e não nas horas." }
    ],
    errors: ["Atender todos os perfis e depois não saber vender para nenhum.", "Vender horas em vez de resultado.", "Método sem nome e sem entregáveis, que o cliente não consegue comparar."]
  },
  posicionamento: {
    title: "Uma frase que faz o cliente certo levantar a mão",
    intro: [
      "Posicionamento é a resposta rápida para \"por que contratar você e não outra pessoa?\". Quem tem carreira sólida costuma se descrever pelo cargo e pela formação. O cliente quer saber o que muda para ele.",
      "A frase de posicionamento junta público, resultado, prazo e método, e precisa aparecer do mesmo jeito no perfil, na proposta e na conversa de venda."
    ],
    formula: "Ajudo [público] a [resultado] em [prazo], com [método].",
    cardsTitle: "O que sustenta o posicionamento",
    cards: [
      { t: "Categoria", p: "Em que \"prateleira\" o cliente coloca você. Ela precisa ser entendida em segundos." },
      { t: "Diferencial", p: "A prática ou o método que só você faz desse jeito e por que isso gera melhor resultado." },
      { t: "Prova", p: "Casos, números públicos, depoimentos e a sua trajetória, escolhidos para o cliente ideal." },
      { t: "Consistência", p: "A mesma frase em bio, LinkedIn, proposta, apresentação e abertura da sessão diagnóstico." }
    ],
    actions: [
      { w: "Semana 0", t: "Escreva a frase de posicionamento com a fórmula e peça a três pessoas para repeti-la com as palavras delas." },
      { w: "Semana 1", t: "Atualize bio, LinkedIn, proposta e primeiro slide da apresentação com a frase." },
      { w: "Semana 1", t: "Reúna três provas relevantes para o seu cliente ideal e deixe-as prontas para uso." }
    ],
    errors: ["Descrever-se pelo cargo e pela lista de serviços.", "Prometer resultado sem prova.", "Mudar a frase a cada semana e confundir o mercado."]
  },
  canais: {
    title: "Gerar, converter e monetizar demanda",
    intro: [
      "O método Máquina de Receita organiza a aquisição em três funis. Cada funil tem ações próprias, e você não precisa de todas ao mesmo tempo. Dois canais bem executados valem mais que seis abandonados.",
      "O critério de escolha é simples: onde o seu cliente ideal já está e onde você consegue manter uma rotina semanal."
    ],
    cardsTitle: "Os três funis",
    cards: [
      { t: "Funil 1 · Gerar demanda", p: "Atrair o público certo.", list: ["Conteúdo de fundo de funil: formatos que falam direto da oferta", "Rede de contatos: lista qualificada e abordagem", "Mídia paga: tráfego para uma página de conversão"] },
      { t: "Funil 2 · Converter demanda", p: "Transformar audiência em conversas.", list: ["Material rico trocado por contato (como este guia)", "Social engagement a partir de comentários e mensagens", "Masterclass em grupo que termina na oferta de entrada", "Remarketing para quem já conhece você"] },
      { t: "Funil 3 · Monetizar demanda", p: "Fazer a conversa virar receita.", list: ["Sessão diagnóstico", "Oferta de entrada de baixo risco", "Prova de conceito com escopo curto", "Upsell e continuidade para clientes"] }
    ],
    actions: [
      { w: "Semana 1", t: "Escolha dois canais, um de conteúdo ou rede de contatos e um de conversão, e defina a rotina semanal de cada um." },
      { w: "Semana 1", t: "Crie um material rico de entrada (diagnóstico, guia ou checklist) com uma chamada para a sessão diagnóstico." },
      { w: "Semana 2", t: "Leia os números: quantas conversas cada canal gerou e quantas viraram sessão diagnóstico." },
      { w: "Semana 3", t: "Aumente o volume no canal que gerou mais sessões e pause o que não gerou." }
    ],
    errors: ["Abrir muitos canais ao mesmo tempo.", "Publicar sem uma chamada para ação.", "Medir curtida em vez de conversa qualificada."]
  },
  ia: {
    title: "A base de dados primeiro, a IA depois",
    intro: [
      "Ferramenta nova não resolve processo desorganizado. A ordem de construção importa: dados primeiro, depois automações, depois inteligência e, por último, os canais.",
      "Para quem vende consultoria sozinho ou com time pequeno, a meta é economizar tempo nas tarefas repetitivas e nunca perder uma oportunidade por falta de resposta."
    ],
    cardsTitle: "As soluções core",
    cards: [
      { t: "CRM e pipeline", p: "Cada oportunidade com etapa, dono, origem e próxima ação. É a fonte única de verdade." },
      { t: "Painel de growth", p: "Cinco números na mesma tela: conversas, sessões diagnóstico, propostas, fechamentos e receita." },
      { t: "Automação", p: "Resposta inicial, lembretes de follow-up e avisos de proposta parada, sem trabalho manual." },
      { t: "IA aplicada", p: "Resumo de reunião, rascunho de proposta, qualificação do contato e pesquisa de mercado, sempre com revisão humana." },
      { t: "Mídia e tracking", p: "Origem de cada contato registrada até a venda, para saber o que realmente gera receita." }
    ],
    actions: [
      { w: "Semana 1", t: "Monte o CRM com as etapas do seu funil e a origem do contato. Pode ser uma ferramenta simples." },
      { w: "Semana 1", t: "Crie o painel com cinco números e abra-o toda segunda-feira." },
      { w: "Semana 3", t: "Automatize a primeira resposta e o lembrete de follow-up." },
      { w: "Semana 3", t: "Escolha uma tarefa repetitiva para a IA (por exemplo, resumo de reunião ou rascunho de proposta) e defina quem revisa." }
    ],
    errors: ["Comprar ferramenta antes de desenhar o processo.", "Colocar IA em cima de um CRM bagunçado.", "Automatizar a conversa sem prever a entrada de uma pessoa."]
  },
  vendas: {
    title: "Uma sessão diagnóstico que termina em decisão",
    intro: [
      "Alta performance em inside sales vem de processo, e não de talento natural. Quem vende conhecimento vence quando conduz a conversa com perguntas, mostra o custo do problema e fecha o próximo passo na hora.",
      "A sessão diagnóstico é o coração da venda. Ela precisa de roteiro, de uma proposta que sai rápido e de um follow-up com prazo."
    ],
    cardsTitle: "O roteiro da sessão diagnóstico",
    cards: [
      { t: "1. Contexto", p: "Entenda o negócio, o momento e o que levou a pessoa a procurar você agora." },
      { t: "2. Dor e custo", p: "Aprofunde o problema e o que ele custa em receita, tempo e energia." },
      { t: "3. Visão", p: "Peça para o cliente descrever o resultado ideal e como saberia que chegou lá." },
      { t: "4. Plano", p: "Apresente o método em etapas e o que acontece em cada uma." },
      { t: "5. Proposta", p: "Escopo, prazo, preço e condições, em uma página, enviada no mesmo dia." },
      { t: "6. Próximo passo", p: "Saia da conversa com uma data de decisão combinada." }
    ],
    actions: [
      { w: "Semana 0", t: "Escreva o roteiro da sessão com as perguntas de cada etapa." },
      { w: "Semana 1", t: "Crie um modelo de proposta de uma página que você consiga enviar em até 24 horas." },
      { w: "Semana 2", t: "Monte a cadência de follow-up: mensagem em 1 dia, 3 dias e 7 dias, com prova, resposta às objeções e data de decisão." },
      { w: "Semana 4", t: "Revise as propostas abertas, decida com cada pessoa e registre os motivos das perdas." }
    ],
    errors: ["Apresentar o método antes de entender o problema.", "Mandar a proposta dias depois da conversa.", "Esperar o cliente voltar sem data combinada."]
  },
  expansao: {
    title: "O cliente satisfeito é o seu melhor canal",
    intro: [
      "Vender para quem já confia em você custa menos do que conquistar um cliente novo. Satisfação e expansão fecham o ciclo da máquina de receita: o resultado do cliente gera indicação, continuidade e parcerias.",
      "Isso exige método. Sem um marco de resultado e um momento certo para pedir, a indicação fica ao acaso."
    ],
    cardsTitle: "As quatro alavancas",
    cards: [
      { t: "Experiência do cliente (CX)", p: "Onboarding claro, rituais de acompanhamento e entregáveis no prazo combinado." },
      { t: "Indicações", p: "Pedido feito no marco de resultado, com uma frase pronta e um modelo de apresentação ao novo contato." },
      { t: "Upsell e cross-sell", p: "Continuidade do projeto, um nível acima do serviço ou um produto complementar, planejados antes do fim do projeto." },
      { t: "Parceiros", p: "Profissionais de áreas complementares que atendem o mesmo público e trocam indicações com você." }
    ],
    actions: [
      { w: "Semana 2", t: "Defina o marco de resultado de cada cliente em andamento e a data de uma conversa de avaliação." },
      { w: "Semana 3", t: "Faça o pedido de indicação nesse marco, com a frase pronta." },
      { w: "Semana 4", t: "Monte a oferta de continuidade e apresente aos clientes que concluíram o projeto." },
      { w: "Semana 4", t: "Liste três profissionais complementares e proponha uma parceria de indicação." }
    ],
    errors: ["Encerrar o projeto sem conversar sobre o próximo passo.", "Pedir indicação antes de o cliente ver resultado.", "Não medir a satisfação, só presumir."]
  }
};

var PLAN30 = [
  { w: "Semana 0", t: "Preparação", d: "Tese, produto e posicionamento. Painel de números definido." },
  { w: "Semana 1", t: "Início", d: "Dois canais no ar, CRM montado e material rico publicado." },
  { w: "Semana 2", t: "Otimizações", d: "Leitura dos primeiros números e ajuste do roteiro de vendas." },
  { w: "Semana 3", t: "Aceleração", d: "Mais volume no que gerou sessões e automações na operação." },
  { w: "Semana 4", t: "Fechamento", d: "Propostas, decisões, indicações e oferta de continuidade." }
];

/* ===================================================================== */
/* Estado e utilidades                                                    */
/* ===================================================================== */
var state = { i: 0, answers: {}, lead: null, leadDraft: {}, done: false, checks: {}, mode: "q" };

function loadState() {
  try {
    var raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return;
    var s = JSON.parse(raw);
    state.answers = s.answers || {};
    state.lead = s.lead || null;
    state.done = !!s.done;
    state.checks = s.checks || {};
    state.i = s.i || 0;
  } catch (e) {}
}
function saveState() {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({ answers: state.answers, lead: state.lead, done: state.done, checks: state.checks, i: state.i }));
  } catch (e) {}
}

function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function pad(n) { return (n < 10 ? "0" : "") + n; }

var views = { captura: $("view-captura"), quiz: $("view-quiz"), resultado: $("view-resultado") };
var shared = $("shared-bottom");
var navCta = $("navCta");
var navLinks = $("navLinksCaptura");

function levelFor(total) {
  var lv = LEVELS[0];
  for (var k = 0; k < LEVELS.length; k++) { if (total >= LEVELS[k].min) lv = LEVELS[k]; }
  return lv;
}

function compute() {
  var per = {}, total = 0;
  AREAS.forEach(function (a) { per[a.id] = 0; });
  QUESTIONS.forEach(function (q) {
    if (!q.area) return;
    var a = state.answers[q.id];
    if (a !== undefined) { per[q.area] = q.opts[a].s; total += q.opts[a].s; }
  });
  return { per: per, total: total, level: levelFor(total) };
}

function profileSlug() {
  var a = state.answers.perfil;
  return a === undefined ? "nao-informado" : QUESTIONS[0].opts[a].v;
}

function answeredCount() {
  return QUESTIONS.filter(function (q) { return state.answers[q.id] !== undefined; }).length;
}

function waUrl(withResult) {
  var msg = "Olá! ";
  if (state.lead) msg = "Olá, sou " + state.lead.nome + " (" + state.lead.cargo + ", " + state.lead.porte + "). ";
  if (withResult) {
    var r = compute();
    msg += "Fiz o diagnóstico Growth 30D (nota " + r.total + "/" + MAX_SCORE + ", nível " + r.level.name + ") e quero agendar uma Sessão Diagnóstico!";
  } else {
    msg = "Olá, vim do hub de growth e quero agendar uma Sessão Diagnóstico!";
  }
  return "https://api.whatsapp.com/send/?phone=" + CONFIG.whatsapp + "&text=" + encodeURIComponent(msg);
}

/* Envia o cadastro ao Google Sheets (Apps Script). Cada etapa atualiza a mesma linha. */
function sendLead(stage) {
  if (!CONFIG.leadEndpoint || !state.lead) return;
  var r = compute();
  var payload = {
    stage: stage, origem: CONFIG.origem,
    nome: state.lead.nome, email: state.lead.email, whatsapp: state.lead.whatsapp,
    cargo: state.lead.cargo, porte: state.lead.porte, perfil: profileSlug(),
    consent: state.lead.consent ? "sim" : "nao", pagina: location.href.split("#")[0]
  };
  if (stage === "resultado") { payload.score = r.total; payload.nivel = r.level.slug; payload.areas = r.per; }
  try {
    fetch(CONFIG.leadEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(payload), keepalive: true }).catch(function () {});
  } catch (err) {}
}

/* ===================================================================== */
/* Roteamento por hash: (vazio) captura | #diagnostico | #resultado       */
/* ===================================================================== */
var current = "";
function showView(name) {
  current = name;
  Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
  shared.hidden = name === "quiz";
  document.body.setAttribute("data-view", name);
  navLinks.hidden = name !== "captura";
  navCta.hidden = name === "quiz";
  if (name === "resultado") { navCta.textContent = "Agendar Sessão Diagnóstico"; navCta.setAttribute("data-mode", "wa"); }
  else { navCta.textContent = "Acessar guia"; navCta.removeAttribute("data-mode"); }
}

function goTo(hash) {
  if (location.hash === hash) route(); else location.hash = hash;
}

function route() {
  var h = location.hash;
  if (h === "#resultado") {
    if (state.done) { renderResult(); showView("resultado"); window.scrollTo(0, 0); return; }
    if (state.lead || answeredCount() > 0) { location.hash = "#diagnostico"; return; }
    history.replaceState(null, "", location.pathname + location.search);
    showView("captura"); return;
  }
  if (h === "#diagnostico") {
    showView("quiz");
    if (state.done) { state.answers = {}; state.done = false; state.i = 0; saveState(); }
    startQuizFromState();
    window.scrollTo(0, 0);
    return;
  }
  showView("captura");
  if (h && h.length > 1) {
    var el = document.getElementById(h.slice(1));
    if (el) el.scrollIntoView();
  }
}

/* ===================================================================== */
/* Diagnóstico                                                            */
/* ===================================================================== */
function startQuizFromState() {
  // retoma na primeira pergunta sem resposta
  var firstOpen = 0;
  for (var k = 0; k < QUESTIONS.length; k++) { if (state.answers[QUESTIONS[k].id] === undefined) { firstOpen = k; break; } firstOpen = k + 1; }
  if (firstOpen >= QUESTIONS.length) firstOpen = QUESTIONS.length - 1;
  state.i = firstOpen;
  state.mode = (state.i >= CONFIG.gateBefore && !state.lead) ? "lead" : "q";
  if (state.mode === "lead") state.i = CONFIG.gateBefore;
  renderQuiz();
}

function progressHtml(upTo) {
  var bars = "";
  for (var k = 0; k < QUESTIONS.length; k++) bars += '<i class="' + (k <= upTo ? "on" : "") + '"></i>';
  return '<div class="gq-progress" aria-hidden="true">' + bars + '</div>';
}

/* Prévia desfocada do resultado: provoca a pessoa a continuar */
function peekHtml() {
  var n = AREAS.length, cx = 100, cy = 86, R = 62;
  function pt(i, rad) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return (cx + rad * Math.cos(a)).toFixed(1) + "," + (cy + rad * Math.sin(a)).toFixed(1); }
  var demo = [2.2, 1.4, 2.6, 1.1, 1.8, 2.4, 0.9];
  var rings = [1, 2, 3].map(function (v) { return '<polygon class="rd-grid" points="' + AREAS.map(function (_, i) { return pt(i, R * v / 3); }).join(" ") + '"/>'; }).join("");
  var area = AREAS.map(function (_, i) { return pt(i, R * demo[i] / 3); }).join(" ");
  var done = answeredCount(), total = QUESTIONS.length;
  var blur = Math.max(3, 12 - done * 1.2).toFixed(1);
  var left = total - done;
  var msg;
  if (state.mode === "lead") msg = "Falta o cadastro e " + left + " pergunta" + (left === 1 ? "" : "s") + " para liberar o seu resultado.";
  else if (!state.lead && done < CONFIG.gateBefore) msg = "O seu resultado aparece aqui. Você cadastra os dados na pergunta " + (CONFIG.gateBefore + 1) + ".";
  else msg = "Faltam " + left + " pergunta" + (left === 1 ? "" : "s") + " para liberar o seu resultado.";
  return '<div class="gq-peek" role="group" aria-label="Prévia desfocada do resultado">' +
    '<div class="gq-peek__inner" style="filter:blur(' + blur + 'px)" aria-hidden="true">' +
    '<div class="gq-peek__score"><b>14</b><small>/' + MAX_SCORE + '</small><span>Nível do seu negócio</span></div>' +
    '<svg viewBox="0 0 200 172" class="gq-peek__radar">' + rings + '<polygon class="rd-area" points="' + area + '"/></svg>' +
    '<div class="gq-peek__bars"><i style="width:72%"></i><i style="width:48%"></i><i style="width:86%"></i></div></div>' +
    '<div class="gq-peek__lock"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><p>' + esc(msg) + '</p></div></div>';
}

function renderQuiz() {
  if (state.mode === "lead") return renderLead();
  var q = QUESTIONS[state.i], n = QUESTIONS.length, cur = state.answers[q.id];
  var area = q.area ? AREAS.filter(function (a) { return a.id === q.area; })[0] : null;
  var opts = q.opts.map(function (o, idx) {
    var sel = cur === idx;
    return '<label class="gq-opt' + (sel ? " sel" : "") + '"><input type="radio" name="q" value="' + idx + '"' + (sel ? " checked" : "") + '><span class="gq-dot"></span><span>' + esc(o.t) + '</span></label>';
  }).join("");
  var last = state.i === n - 1;
  views.quiz.innerHTML =
    '<div class="gq"><div class="gq-card">' +
    progressHtml(state.i) +
    '<div class="gq-count"><span>Pergunta ' + (state.i + 1) + ' de ' + n + '</span><span>' + esc(area ? area.name : "Sobre você") + '</span></div>' +
    '<p class="eyebrow">' + esc(area ? area.sub : "Contexto") + '</p>' +
    '<fieldset class="gq-fs"><legend><h2 data-focus>' + esc(q.text) + '</h2></legend><div class="gq-opts">' + opts + '</div></fieldset>' +
    '<div class="gq-nav"><button class="btn btn--ghost" type="button" data-act="back">Voltar</button>' +
    '<button class="btn btn--primary" type="button" data-act="next"' + (cur === undefined ? " disabled" : "") + '>' + (last ? "Ver resultado" : "Próxima") + '</button></div>' +
    '</div>' + peekHtml() + '</div>';
  focusHeading();
}

function renderLead() {
  var d = state.leadDraft || {};
  function opts(list, cur) {
    return '<option value="">Selecione</option>' + list.map(function (t) { return '<option' + (cur === t ? " selected" : "") + '>' + esc(t) + '</option>'; }).join("");
  }
  var cargos = ["Profissional liberal ou autônomo(a)", "Dono, CEO ou sócio", "Diretor(a)", "Gerente", "Coordenador(a)", "Analista", "Consultor(a) ou freelancer", "Estudante", "Outro"];
  var portes = ["Só eu", "2 a 10 pessoas", "11 a 50 pessoas", "Mais de 50 pessoas"];
  function fld(id, label, control) {
    return '<div class="fld" id="fld-' + id + '"><label for="f-' + id + '">' + label + '</label>' + control + '<span class="err" id="err-' + id + '" role="alert"></span></div>';
  }
  var left = QUESTIONS.length - CONFIG.gateBefore;
  views.quiz.innerHTML =
    '<div class="gq"><div class="gq-card">' +
    progressHtml(CONFIG.gateBefore - 1) +
    '<div class="gq-count"><span>Falta pouco</span><span>' + left + ' perguntas restantes</span></div>' +
    '<p class="eyebrow">Seu resultado está quase pronto</p>' +
    '<h2 data-focus>Cadastre-se para continuar</h2>' +
    '<p class="gq-lead">Informe seus dados para seguir com as últimas perguntas e liberar o diagnóstico completo e o Playbook Growth 30D.</p>' +
    '<form class="gq-form" id="lead-form" novalidate>' +
    fld("nome", "Nome", '<input id="f-nome" name="nome" type="text" autocomplete="name" value="' + esc(d.nome || "") + '">') +
    '<div class="gq-two">' +
    fld("email", "E-mail", '<input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" value="' + esc(d.email || "") + '">') +
    fld("whats", "WhatsApp", '<input id="f-whats" name="whats" type="tel" autocomplete="tel" inputmode="tel" placeholder="(19) 99999-9999" value="' + esc(d.whatsapp || "") + '">') +
    '</div><div class="gq-two">' +
    fld("cargo", "Cargo", '<select id="f-cargo" name="cargo">' + opts(cargos, d.cargo) + '</select>') +
    fld("porte", "Tamanho da empresa", '<select id="f-porte" name="porte">' + opts(portes, d.porte) + '</select>') +
    '</div>' +
    '<div class="fld" id="fld-consent"><label class="gq-consent" for="f-consent"><input id="f-consent" name="consent" type="checkbox"' + (d.consent ? " checked" : "") + '><span>Concordo em receber o resultado e contatos sobre growth, conforme a LGPD.</span></label><span class="err" id="err-consent" role="alert"></span></div>' +
    '<p class="gq-privacy">Sem spam. Você pode pedir a remoção dos seus dados quando quiser.</p>' +
    '<div class="gq-nav"><button class="btn btn--ghost" id="backlead" type="button" data-act="backlead">Voltar</button><button class="btn btn--primary" id="submitlead" type="submit">Continuar</button></div>' +
    '</form></div>' + peekHtml() + '</div>';
  focusHeading();
}

function focusHeading() {
  var h = views.quiz.querySelector("[data-focus]");
  if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
}

function readLead() {
  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  var c = document.getElementById("f-consent");
  return { nome: v("f-nome"), email: v("f-email"), whatsapp: v("f-whats"), cargo: v("f-cargo"), porte: v("f-porte"), consent: !!(c && c.checked) };
}
function validateLead(d) {
  var e = {};
  if (d.nome.length < 2) e.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = "Informe um e-mail válido.";
  var digits = d.whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) e.whats = "Informe um WhatsApp com DDD.";
  if (!d.cargo) e.cargo = "Escolha o seu cargo.";
  if (!d.porte) e.porte = "Escolha o tamanho da empresa.";
  if (!d.consent) e.consent = "Marque para continuar.";
  return e;
}
function showLeadErrors(errs) {
  ["nome", "email", "whats", "cargo", "porte", "consent"].forEach(function (k) {
    var f = document.getElementById("fld-" + k), m = document.getElementById("err-" + k);
    if (!f || !m) return;
    f.classList.toggle("bad", !!errs[k]);
    m.textContent = errs[k] || "";
  });
}

/* ===================================================================== */
/* Resultado + playbook                                                   */
/* ===================================================================== */
function radarSvg(per) {
  var n = AREAS.length, cx = 190, cy = 160, R = 100, W = 380, H = 330;
  function ang(i) { return -Math.PI / 2 + i * 2 * Math.PI / n; }
  function pt(i, rad) { return [cx + rad * Math.cos(ang(i)), cy + rad * Math.sin(ang(i))]; }
  function poly(v) { return AREAS.map(function (_, i) { var p = pt(i, R * v / 3); return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  var rings = [1, 2, 3].map(function (v) { return '<polygon class="rd-grid" points="' + poly(v) + '"/>'; }).join("");
  var axes = AREAS.map(function (_, i) { var p = pt(i, R); return '<line class="rd-axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>'; }).join("");
  var area = AREAS.map(function (a, i) { var p = pt(i, R * per[a.id] / 3); return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
  var dots = AREAS.map(function (a, i) { var p = pt(i, R * per[a.id] / 3); return '<circle class="rd-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5"/>'; }).join("");
  var labels = AREAS.map(function (a, i) {
    var p = pt(i, R + 16), c = Math.cos(ang(i)), sn = Math.sin(ang(i));
    var anchor = c > 0.3 ? "start" : (c < -0.3 ? "end" : "middle");
    var y = sn < -0.6 ? p[1] - 20 : (sn > 0.6 ? p[1] + 10 : p[1] - 4);
    return '<text class="rd-lbl" text-anchor="' + anchor + '" x="' + p[0].toFixed(1) + '" y="' + y.toFixed(1) + '">' + esc(a.short) +
      '<tspan class="rd-val" x="' + p[0].toFixed(1) + '" dy="14">' + per[a.id] + '/3</tspan></text>';
  }).join("");
  return '<svg class="rd" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de teia de aranha com a pontuação do seu negócio por área">' +
    rings + axes + '<polygon class="rd-area" points="' + area + '"/>' + dots + labels + '</svg>';
}

function sectionHtml(area, idx, r, prio) {
  var d = PLAYBOOK[area.id], sc = r.per[area.id];
  var isPrio = prio.indexOf(area.id) !== -1;
  var intro = d.intro.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  var formula = d.formula ? '<p class="pb-formula">' + esc(d.formula) + '</p>' : "";
  var cards = d.cards.map(function (c) {
    var list = c.list ? '<ul>' + c.list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' : "";
    return '<div class="pb-card"><b>' + esc(c.t) + '</b><p>' + esc(c.p) + '</p>' + list + '</div>';
  }).join("");
  var dream = d.dream ? '<p class="pb-dream">' + esc(d.dream) + '</p>' : "";
  var acts = d.actions.map(function (a, k) {
    var key = area.id + "-" + k, on = !!state.checks[key];
    return '<li><label class="pb-check' + (on ? " on" : "") + '"><input type="checkbox" data-check="' + key + '"' + (on ? " checked" : "") + '><span class="pb-box"></span><span class="pb-act"><em>' + esc(a.w) + '</em>' + esc(a.t) + '</span></label></li>';
  }).join("");
  var errs = d.errors.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
  return '<section class="pb-sec' + (isPrio ? " is-prio" : "") + '" id="pb-' + area.id + '" aria-labelledby="pb-h-' + area.id + '">' +
    '<div class="pb-head"><span class="pb-num">' + pad(idx + 1) + '</span><div>' +
    '<p class="eyebrow">' + esc(area.name) + ' · ' + esc(area.sub) + '</p>' +
    '<h3 id="pb-h-' + area.id + '">' + esc(d.title) + '</h3>' +
    '<p class="pb-score"><span class="pb-chip">Seu nível: ' + sc + '/3</span>' + (isPrio ? '<span class="pb-chip pb-chip--prio">Prioridade para você</span>' : "") + '</p></div></div>' +
    '<div class="pb-intro">' + intro + '</div>' + formula +
    '<h4 class="pb-sub">' + esc(d.cardsTitle) + '</h4><div class="pb-cards">' + cards + '</div>' + dream +
    '<h4 class="pb-sub">Faça nos 30 dias</h4><ul class="pb-acts">' + acts + '</ul>' +
    '<div class="pb-errors"><b>Erros comuns</b><ul>' + errs + '</ul></div>' +
    '</section>';
}

function checksTotals() {
  var total = 0, done = 0;
  AREAS.forEach(function (a) { PLAYBOOK[a.id].actions.forEach(function (_, k) { total++; if (state.checks[a.id + "-" + k]) done++; }); });
  return { total: total, done: done };
}

function renderResult() {
  var r = compute(), lv = r.level;
  var ranked = AREAS.slice().sort(function (a, b) { return r.per[a.id] - r.per[b.id] || AREAS.indexOf(a) - AREAS.indexOf(b); });
  var prio = ranked.slice(0, 3).map(function (a) { return a.id; });
  var scale = LEVELS.map(function (l) {
    return '<div class="' + (l.slug === lv.slug ? "on" : "") + '">' + esc(l.name) + '<small>' + l.range + ' pontos</small></div>';
  }).join("");
  var bars = AREAS.map(function (a) {
    return '<button type="button" class="rs-bar" data-go="pb-' + a.id + '"><span class="rs-bar__row"><span>' + esc(a.name) + '</span><b>' + r.per[a.id] + '/3</b></span><span class="rs-bar__track"><i style="width:' + (r.per[a.id] / 3 * 100) + '%"></i></span></button>';
  }).join("");
  var prios = ranked.slice(0, 3).map(function (a, i) {
    return '<article class="rs-prio"><span class="rs-prio__n">' + (i + 1) + '</span><div><h4>' + esc(a.name) + ' <em>' + r.per[a.id] + '/3</em></h4><p>' + esc(a.tip) + '</p><button type="button" class="rs-link" data-go="pb-' + a.id + '">Ver no playbook →</button></div></article>';
  }).join("");
  var toc = AREAS.map(function (a, i) {
    return '<button type="button" class="pb-toc__item' + (prio.indexOf(a.id) !== -1 ? " prio" : "") + '" data-go="pb-' + a.id + '"><span>' + pad(i + 1) + '</span>' + esc(a.name) + '<small>' + r.per[a.id] + '/3</small></button>';
  }).join("");
  var plan = PLAN30.map(function (p) {
    return '<div class="pl-step"><span>' + esc(p.w) + '</span><b>' + esc(p.t) + '</b><p>' + esc(p.d) + '</p></div>';
  }).join("");
  var secs = AREAS.map(function (a, i) { return sectionHtml(a, i, r, prio); }).join("");
  var ct = checksTotals();
  var name = state.lead ? state.lead.nome.split(" ")[0] : "";

  views.resultado.innerHTML =
    '<section class="deck deck--light rs-top" id="resultado-topo"><div class="rs-wrap">' +
    '<p class="eyebrow">' + (name ? "Resultado de " + esc(name) : "Seu resultado") + '</p>' +
    '<div class="rs-score"><div class="rs-num" aria-label="Nota ' + r.total + ' de ' + MAX_SCORE + '">' + r.total + '<small>/' + MAX_SCORE + '</small></div>' +
    '<div><h2 class="rs-level" data-focus>' + esc(lv.name) + '</h2><p class="rs-sum">' + esc(lv.summary) + '</p></div></div>' +
    '<div class="rs-scale">' + scale + '</div>' +
    '<p class="rs-next"><b>Próximo passo:</b> ' + esc(lv.next) + '</p>' +
    '<div class="rs-grid"><div class="rs-radar">' + radarSvg(r.per) + '</div><div class="rs-bars"><p class="rs-label">Pontuação por área</p>' + bars + '</div></div>' +
    '<p class="rs-label rs-label--mt">Onde agir primeiro</p><div class="rs-prios">' + prios + '</div>' +
    '</div></section>' +

    '<section class="deck deck--tone pb-wrap" id="playbook"><div class="pb-inner">' +
    '<div class="deck__header deck__header--wide"><p class="eyebrow">Playbook Growth 30D</p>' +
    '<h2 class="deck__title">Mapeie a sua operação e tenha um plano para faturar pelo menos +10% em 30 dias</h2>' +
    '<p class="deck__subtitle">O playbook segue as 7 áreas do método Máquina de Receita. As áreas com a menor nota estão marcadas como prioridade. Marque cada ação concluída e acompanhe o seu avanço.</p></div>' +
    '<div class="pb-progress"><div class="pb-progress__txt"><b id="pbDone">' + ct.done + '</b> de ' + ct.total + ' ações concluídas</div><div class="pb-progress__bar"><i id="pbBar" style="width:' + (ct.total ? ct.done / ct.total * 100 : 0) + '%"></i></div></div>' +
    '<nav class="pb-toc" aria-label="Áreas do playbook">' + toc + '</nav>' +
    secs +
    '<section class="pb-sec pb-plan" id="pb-plano"><div class="pb-head"><span class="pb-num">30D</span><div><p class="eyebrow">Plano resumido</p><h3>Os 30 dias em cinco semanas</h3></div></div><div class="pl-steps">' + plan + '</div></section>' +
    '<div class="pb-cta"><p>Quer fazer isso com acompanhamento? Na Sessão Diagnóstico eu avalio o seu resultado e monto o plano para o seu caso.</p>' +
    '<a class="btn btn--primary" id="ctaWa" href="' + esc(waUrl(true)) + '" target="_blank" rel="noopener">Agendar Sessão Diagnóstico</a></div>' +
    '<div class="rs-again"><button class="btn btn--ghost" type="button" data-act="copy">Copiar resumo</button><button class="btn btn--ghost" type="button" data-act="redo">Refazer diagnóstico</button><span class="ok" id="okMsg" role="status"></span></div>' +
    '</div></section>';

  // atualiza os links de WhatsApp dos serviços com o resultado
  var wa = waUrl(true);
  document.querySelectorAll("#servicos .offer-card__cta").forEach(function (a) { a.setAttribute("href", wa); });
}

/* ===================================================================== */
/* Eventos                                                                */
/* ===================================================================== */
function startFlow() {
  if (state.done) { goTo("#resultado"); return; }
  goTo("#diagnostico");
}

document.addEventListener("click", function (e) {
  var cta = e.target.closest("#navCta");
  if (cta) {
    if (cta.getAttribute("data-mode") === "wa") { sendLead("cta-whatsapp"); window.open(waUrl(true), "_blank", "noopener"); }
    else startFlow();
    return;
  }
  var start = e.target.closest("[data-start]");
  if (start) { e.preventDefault(); startFlow(); return; }

  var anc = e.target.closest('a[href^="#"]');
  if (anc && current === "resultado") {
    var aid = anc.getAttribute("href").slice(1);
    if (aid === "servicos" || aid === "redes") {
      e.preventDefault();
      var tg = document.getElementById(aid);
      if (tg) window.scrollTo({ top: tg.getBoundingClientRect().top + window.scrollY - 76, behavior: "smooth" });
      return;
    }
  }

  var wa = e.target.closest("#ctaWa, #servicos .offer-card__cta");
  if (wa) sendLead("cta-whatsapp");

  var go = e.target.closest("[data-go]");
  if (go) {
    var el = document.getElementById(go.getAttribute("data-go"));
    if (el) { var top = el.getBoundingClientRect().top + window.scrollY - 76; window.scrollTo({ top: top, behavior: "smooth" }); }
    return;
  }

  var b = e.target.closest("[data-act]");
  if (!b) return;
  var act = b.getAttribute("data-act");
  if (act === "back") {
    if (state.i === 0) { history.pushState(null, "", location.pathname + location.search); route(); }
    else { state.mode = "q"; state.i -= 1; if (state.i === CONFIG.gateBefore - 1) state.mode = "q"; renderQuiz(); }
  } else if (act === "backlead") {
    state.mode = "q"; state.i = CONFIG.gateBefore - 1; renderQuiz();
  } else if (act === "next") {
    var q = QUESTIONS[state.i];
    if (state.answers[q.id] === undefined) return;
    saveState();
    if (state.i === QUESTIONS.length - 1) {
      state.done = true; saveState();
      sendLead("resultado");
      location.hash = "#resultado";
    } else if (state.i + 1 === CONFIG.gateBefore && !state.lead) {
      state.mode = "lead"; state.i = CONFIG.gateBefore; renderQuiz(); window.scrollTo(0, 0);
    } else {
      state.i += 1; renderQuiz(); window.scrollTo(0, 0);
    }
  } else if (act === "redo") {
    state.answers = {}; state.done = false; state.i = 0; state.mode = "q"; saveState();
    goTo("#diagnostico");
  } else if (act === "copy") {
    var r = compute();
    var txt = "Meu diagnóstico Growth 30D: " + r.total + "/" + MAX_SCORE + " (" + r.level.name + "). Faça o seu: " + location.href.split("#")[0];
    var ok = $("okMsg");
    var done = function () { ok.textContent = "Resumo copiado."; };
    var fail = function () { ok.textContent = "Não foi possível copiar. Resumo: " + txt; };
    try { navigator.clipboard.writeText(txt).then(done, fail); } catch (err) { fail(); }
  }
});

views.quiz.addEventListener("change", function (e) {
  if (e.target.name !== "q") return;
  var q = QUESTIONS[state.i];
  state.answers[q.id] = parseInt(e.target.value, 10);
  saveState();
  var labels = views.quiz.querySelectorAll(".gq-opt");
  for (var k = 0; k < labels.length; k++) labels[k].classList.toggle("sel", labels[k].contains(e.target));
  var nx = views.quiz.querySelector('[data-act="next"]');
  if (nx) nx.disabled = false;
});

views.quiz.addEventListener("input", function (e) {
  var t = e.target;
  if (t && t.closest && t.closest("#lead-form")) state.leadDraft = readLead();
});

views.quiz.addEventListener("submit", function (e) {
  if (e.target.id !== "lead-form") return;
  e.preventDefault();
  var d = readLead(), errs = validateLead(d);
  state.leadDraft = d;
  showLeadErrors(errs);
  var first = ["nome", "email", "whats", "cargo", "porte", "consent"].filter(function (k) { return errs[k]; })[0];
  if (first) { document.getElementById("f-" + first).focus(); return; }
  state.lead = d; state.mode = "q"; state.i = CONFIG.gateBefore;
  saveState();
  sendLead("cadastro");
  renderQuiz();
  window.scrollTo(0, 0);
});

views.resultado.addEventListener("change", function (e) {
  var k = e.target.getAttribute && e.target.getAttribute("data-check");
  if (!k) return;
  state.checks[k] = e.target.checked;
  saveState();
  var lab = e.target.closest(".pb-check");
  if (lab) lab.classList.toggle("on", e.target.checked);
  var ct = checksTotals();
  $("pbDone").textContent = ct.done;
  $("pbBar").style.width = (ct.total ? ct.done / ct.total * 100 : 0) + "%";
});

window.addEventListener("hashchange", route);
loadState();
route();
