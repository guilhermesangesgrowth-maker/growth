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


/* =====================================================================
 * GUIA GROWTH 30D: captura -> guia em formato de site (#playbook)
 * 1) A pessoa se localiza na jornada (diagrama) e abre as áreas do método.
 * 2) Depois de abrir uma área e rolar a página, abre o cadastro.
 * 3) Com o cadastro feito, todo o conteúdo fica liberado.
 * ===================================================================== */
var CONFIG = {
  whatsapp: "5519998878022",
  leadEndpoint: "",        // URL do Web App do Google Apps Script (ver leads-sheets.gs). Vazio = não envia
  origem: "guia-growth-30d",
  storageKey: "g30d-v3",
  scrollToAsk: 260         // quantos pixels de rolagem depois de abrir uma área até pedir o cadastro
};

/* Tipo de infográfico de cada área */
var INFO = { tese: "converge", produto: "flow", posicionamento: "formula", canais: "funnels", ia: "layers", vendas: "flow", expansao: "cycle" };

/* Estágio do negócio: aparece no diagrama da jornada e no cadastro */
var ESTAGIOS = [
  { v: "construir", t: "Quero construir e vender a minha consultoria/mentoria em 30 dias.",
    titulo: "Travado, sem consultoria ou mentoria", curto: "Ainda não tenho consultoria ou mentoria",
    desc: "Você tem experiência e resultado, mas ainda não transformou isso em uma consultoria ou mentoria que vende. O foco é definir o que vender, para quem e como se posicionar.",
    areas: ["tese", "produto", "posicionamento"] },
  { v: "melhorar", t: "Já tenho um produto de conhecimento, mas quero melhorar o marketing e vender mais em 30 dias.",
    titulo: "Com produto, travado em vendas", curto: "Tenho produto de conhecimento, mas as vendas travaram",
    desc: "O produto existe, mas a demanda e a conversão não acompanham. O foco é gerar oportunidades, organizar a operação comercial e fechar mais.",
    areas: ["canais", "vendas", "ia"] },
  { v: "acelerar", t: "Já tenho um produto de conhecimento e quero acelerar o ecossistema (marketing, vendas, IA e expansão de receita).",
    titulo: "Com produto, quer acelerar o ecossistema", curto: "Tenho produto e quero acelerar o ecossistema",
    desc: "O básico funciona. O foco é ganhar escala com IA e martech, aumentar o valor de cada cliente e abrir novas fontes de receita, como indicações e parcerias.",
    areas: ["ia", "expansao", "canais"] }
];
function estagio(v) { return ESTAGIOS.filter(function (e) { return e.v === v; })[0]; }
/* Segmentos e o que muda no playbook para cada um (analogias do ofício de quem vende a consultoria) */
var SEGS = [
  { id: "saude", label: "Saúde e Bem-estar", who: "clínicas, consultórios e profissionais de saúde", notes: {
    tese: "No seu mercado, o inimigo comum costuma ser o marketing de clínica que vende procedimento e promessa. A sua tese mostra a prática que atrapalha a gestão e o resultado de quem você orienta.",
    produto: "Pense como numa consulta: a anamnese é o cliente e o problema, o diagnóstico é o resultado esperado e o protocolo é o método em etapas, cada uma com um entregável.",
    posicionamento: "Na saúde, a confiança vem da especialidade. Escolha um recorte, como gestão de clínicas de uma especialidade, e use a sua formação como prova do método.",
    canais: "Indicação entre colegas e sociedades de especialidade seguem fortes. Some a isso conteúdo com casos de gestão e uma lista de contatos qualificada.",
    ia: "Use IA para resumir reuniões, rascunhar propostas e responder primeiros contatos. Trate os dados com o mesmo rigor do sigilo profissional, respeitando a LGPD.",
    vendas: "Conduza a sessão diagnóstico como uma consulta: escute, mapeie o problema, explique o plano e combine o retorno antes de encerrar.",
    expansao: "Acompanhe o cliente como num tratamento contínuo: revisões periódicas, marcos de resultado e indicação de colegas no momento certo." } },
  { id: "engenharia", label: "Engenharia e Construção", who: "construtoras, incorporadoras e escritórios de engenharia", notes: {
    tese: "O inimigo comum é a obra gerida por planilha solta e prazos que escorregam. A tese mostra o gargalo que o mercado ignora e o método que você usa para resolvê-lo.",
    produto: "Defina o produto como um projeto: escopo, cronograma, entregáveis por fase e critério de aceite.",
    posicionamento: "Posicione-se por tipo de obra ou de problema (custo, prazo ou qualidade) e use projetos entregues como prova.",
    canais: "Eventos setoriais, associações e relacionamento com incorporadoras rendem bem. Registre cada contato e combine com conteúdo técnico no LinkedIn.",
    ia: "Automatize relatórios de acompanhamento, orçamentos preliminares e resumos de reunião, com revisão técnica antes de enviar.",
    vendas: "Trate cada conversa como um levantamento de campo: meça o problema, estime o impacto em custo e prazo e proponha a solução por fases.",
    expansao: "Entregue por fases e use o fim de cada fase como porta para a próxima. Indicações entre incorporadoras e fornecedores completam o ciclo." } },
  { id: "arquitetura", label: "Arquitetura e Design", who: "escritórios de arquitetura e design", notes: {
    tese: "O inimigo comum é o escritório que vive de projeto por projeto e de orçamento negociado a desconto. A tese mostra um modelo de negócio mais previsível.",
    produto: "Use o raciocínio do briefing: as perguntas certas no começo definem o projeto. Estruture o método com entregáveis visíveis, como diagnóstico, estudo e plano.",
    posicionamento: "Posicione-se por um estilo de gestão ou por um tipo de escritório e mostre resultados de negócio ao lado do portfólio estético.",
    canais: "Indicações de clientes e de parceiros, como engenheiros e fornecedores, funcionam. Some uma rotina de conteúdo com bastidores da gestão do escritório.",
    ia: "Use IA para pesquisa de referências, textos de proposta e organização de briefings, mantendo a autoria e a revisão final com você.",
    vendas: "Faça da sessão diagnóstico um briefing: entenda o contexto, feche o escopo e entregue uma proposta clara com valor por fase.",
    expansao: "Projeto entregue é o melhor momento para pedir indicação e propor a etapa seguinte, como acompanhamento ou um novo projeto." } },
  { id: "juridico", label: "Direito, Contabilidade e Finanças", who: "escritórios jurídicos, contábeis e financeiros", notes: {
    tese: "O inimigo comum é a venda por hora e a captação por indicação sem processo. A tese mostra por que um serviço recorrente e com escopo definido protege a margem.",
    produto: "Transforme o conhecimento em um serviço com escopo fechado: diagnóstico, plano e acompanhamento mensal.",
    posicionamento: "Escolha uma especialidade e um tipo de cliente. A reputação técnica funciona como prova, desde que a frase fale do resultado para o cliente.",
    canais: "Parcerias com outros profissionais, eventos e LinkedIn funcionam bem. Combine com conteúdo que explique riscos e oportunidades em linguagem simples.",
    ia: "IA ajuda em pesquisa, resumos e rascunhos. Defina regras claras de sigilo e de dados do cliente e revise tudo antes de usar.",
    vendas: "Conduza a conversa inicial como um diagnóstico, mostre o risco de não agir e envie a proposta com escopo e valor no mesmo dia.",
    expansao: "Acompanhamento recorrente e revisões periódicas aumentam o valor do cliente. Peça indicação depois de um resultado concreto." } },
  { id: "executivo", label: "Executivo ou gestor de empresa", who: "empresas do setor em que você atuou", notes: {
    tese: "O inimigo comum é a consultoria genérica, que entrega slides e não mergulha na operação. A sua tese nasce da vivência de quem já comandou resultado.",
    produto: "Transforme a sua experiência em um método com nome, etapas e entregáveis, aplicado a um problema que você já resolveu dentro de empresas.",
    posicionamento: "Use a trajetória como prova. A frase de posicionamento fala do resultado que você gera para empresas do seu setor, com nomes e números públicos.",
    canais: "A sua rede de contatos é o canal mais forte. Estruture uma lista, uma abordagem e um conteúdo de LinkedIn com bastidores de gestão.",
    ia: "Use IA para pesquisa de mercado, preparação de reuniões e propostas, e mantenha o acompanhamento de cada conversa em um CRM simples.",
    vendas: "Venda como numa reunião de diretoria: diagnóstico, impacto no resultado e plano de ação em etapas, com data de decisão combinada.",
    expansao: "Programas de continuidade, treinamento do time do cliente e indicações dentro da rede de executivos ampliam a receita." } },
  { id: "empresario", label: "Empresário de serviço de alto ticket", who: "empresários do seu mercado", notes: {
    tese: "O inimigo comum é o crescimento que vira agenda lotada e lucro menor. A tese mostra como vender mais sem aumentar o desgaste operacional.",
    produto: "Empacote o que você já faz bem no seu negócio em um programa para outros empresários do mesmo mercado, com método, etapas e entregáveis.",
    posicionamento: "Posicione-se como quem já construiu o resultado que o cliente quer. Os números e a história do seu negócio são a prova.",
    canais: "Associações, eventos e a base de clientes e fornecedores são ótimos canais. Registre cada contato e crie uma oferta de entrada.",
    ia: "Passe para as ferramentas o que consome a sua agenda: primeiro atendimento, lembretes, propostas e relatórios.",
    vendas: "Leve para a conversa a mesma disciplina de vendas do seu negócio: diagnóstico, proposta clara e acompanhamento até o fechamento.",
    expansao: "Cuide do pós-venda como parte do produto: marcos de resultado, depoimentos e indicações entre empresários do mesmo mercado." } },
  { id: "outro", label: "Outro segmento", who: "empresas e profissionais do seu mercado", notes: {} }
];
function seg(id) { return SEGS.filter(function (s) { return s.id === id; })[0]; }
function segLabel() { var s = state.segmento ? seg(state.segmento) : null; return s ? s.label : ""; }
var PORTES = ["Só eu", "2 a 10 pessoas", "11 a 50 pessoas", "Mais de 50 pessoas"];

/* ---------- estado ---------- */
var state = { lead: null, segmento: null, jornada: null, open: {}, checks: {} };
function loadState() {
  try {
    var s = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
    state.lead = s.lead || null; state.segmento = s.segmento || null; state.jornada = s.jornada || null; state.checks = s.checks || {};
  } catch (e) {}
}
function saveState() {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify({ lead: state.lead, segmento: state.segmento, jornada: state.jornada, checks: state.checks })); } catch (e) {}
}

function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function pad(n) { return (n < 10 ? "0" : "") + n; }
function area(id) { return AREAS.filter(function (a) { return a.id === id; })[0]; }

var views = { captura: $("view-captura"), guia: $("view-guia") };
var shared = $("shared-bottom");
var navCta = $("navCta");
var navLinks = $("navLinksCaptura");
var current = "";

function estagioLabel() {
  var e = state.jornada ? estagio(state.jornada) : null;
  return e ? e.t : "";
}

function waUrl() {
  var msg = "Olá, vim do hub de growth e quero agendar uma Sessão Diagnóstico!";
  if (state.lead) {
    msg = "Olá, sou " + state.lead.nome + " (" + (segLabel() || "profissional") + ", " + state.lead.porte + "). ";
    var es = state.jornada ? estagio(state.jornada) : null;
    if (es) msg += es.curto + ". ";
    msg += "Li o Guia Growth 30D e quero agendar uma Sessão Diagnóstico!";
  }
  return "https://api.whatsapp.com/send/?phone=" + CONFIG.whatsapp + "&text=" + encodeURIComponent(msg);
}

/* Envia ao Google Sheets (Apps Script). Cada etapa atualiza a mesma linha da pessoa. */
function sendLead(stage) {
  if (!CONFIG.leadEndpoint || !state.lead) return;
  var payload = {
    stage: stage, origem: CONFIG.origem,
    nome: state.lead.nome, email: state.lead.email, whatsapp: state.lead.whatsapp,
    segmento: segLabel(), porte: state.lead.porte, estagio: estagioLabel(),
    jornada: state.jornada || "", consent: state.lead.consent ? "sim" : "nao",
    pagina: location.href.split("#")[0]
  };
  try {
    fetch(CONFIG.leadEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(payload), keepalive: true }).catch(function () {});
  } catch (err) {}
}

/* ---------- roteamento: (vazio) captura | #playbook ---------- */
function showView(name) {
  current = name;
  views.captura.hidden = name !== "captura";
  views.guia.hidden = name !== "guia";
  document.body.setAttribute("data-view", name);
  navLinks.hidden = name !== "captura";
  if (name === "guia") { navCta.textContent = "Agendar Sessão Diagnóstico"; navCta.setAttribute("data-mode", "wa"); }
  else { navCta.textContent = "Acessar guia"; navCta.removeAttribute("data-mode"); }
}
function goTo(hash) { if (location.hash === hash) route(); else location.hash = hash; }

/* Limpa segmento, estágio, cadastro e checklist deste navegador e volta ao passo 1 */
function resetAll() {
  state.lead = null; state.segmento = null; state.jornada = null; state.checks = {};
  try { localStorage.removeItem(CONFIG.storageKey); } catch (e) {}
  arm.on = false; arm.asked = false;
  closeModal(true);
  if (modal) buildModal();
  if (current === "guia" || location.hash === "#playbook") { renderGuia(); window.scrollTo(0, 0); }
}

function route() {
  var h = location.hash;
  if (h === "#recomecar") { resetAll(); history.replaceState(null, "", location.pathname + location.search + "#playbook"); route(); return; }
  if (h === "#playbook") {
    renderGuia(); showView("guia"); window.scrollTo(0, 0); return;
  }
  closeModal(true);
  showView("captura");
  if (h && h.length > 1) { var el = document.getElementById(h.slice(1)); if (el) el.scrollIntoView(); }
}

/* ---------- infográficos de cada área ---------- */
function igConverge(d) {
  var enemies = d.cards.map(function (c) { return '<li>' + esc(c.t) + '</li>'; }).join("");
  return '<div class="ig ig-conv"><div class="ig-conv__l"><p class="ig-k">Inimigos comuns</p><ul>' + enemies + '</ul></div>' +
    '<div class="ig-conv__arrow" aria-hidden="true">→</div>' +
    '<div class="ig-conv__r"><p class="ig-k">A sua tese</p><b>O que o mercado faz de errado, o que você faz e o resultado do cliente</b></div></div>';
}
function igFlow(d) {
  var steps = d.cards.map(function (c, i) { return '<li><i>' + (i + 1) + '</i><span>' + esc(c.t.replace(/^\d+\.\s*/, "")) + '</span></li>'; }).join("");
  return '<ol class="ig ig-flow">' + steps + '</ol>';
}
function igFormula(d) {
  var chips = ["Ajudo", "[público]", "a", "[resultado]", "em", "[prazo]", "com", "[método]"].map(function (t) { return t.charAt(0) === "[" ? '<em>' + esc(t) + '</em>' : '<span>' + esc(t) + '</span>'; }).join(" ");
  var pillars = d.cards.map(function (c) { return '<li>' + esc(c.t) + '</li>'; }).join("");
  return '<div class="ig ig-form"><p class="ig-form__s">' + chips + '</p><ul class="ig-form__p">' + pillars + '</ul></div>';
}
function igFunnels(d) {
  var cols = d.cards.map(function (c, i) {
    var items = (c.list || []).map(function (x) { return '<li>' + esc(x.split(":")[0]) + '</li>'; }).join("");
    return '<div class="ig-fun' + (i === 2 ? " last" : "") + '"><b>' + esc(c.t.replace(/^Funil \d · /, "")) + '</b><span class="ig-fun__n">Funil ' + (i + 1) + '</span><ul>' + items + '</ul></div>';
  }).join('<div class="ig-fun__arrow" aria-hidden="true">→</div>');
  return '<div class="ig ig-funnels">' + cols + '</div>';
}
function igLayers(d) {
  var order = ["Dados", "Automação", "Inteligência", "Canais"];
  var items = d.cards.slice(0, 4).map(function (c) { return c.t; });
  var layers = ["CRM e pipeline", "Painel de growth", "Automação", "IA aplicada", "Mídia e tracking"].map(function (t, i) {
    return '<li class="l' + (i + 1) + '"><i>' + (i + 1) + '</i><span>' + esc(t) + '</span></li>';
  }).reverse().join("");
  return '<div class="ig ig-layers"><p class="ig-k">Ordem de construção, de baixo para cima</p><ol reversed>' + layers + '</ol></div>';
}
function igCycle(d) {
  var labels = d.cards.map(function (c) { return c.t; });
  var pos = [[160, 24], [296, 120], [160, 216], [24, 120]];
  var nodes = labels.map(function (t, i) {
    var anchor = i === 1 ? "end" : (i === 3 ? "start" : "middle");
    var x = i === 1 ? pos[i][0] - 14 : (i === 3 ? pos[i][0] + 14 : pos[i][0]);
    var y = i === 0 ? pos[i][1] - 14 : (i === 2 ? pos[i][1] + 22 : pos[i][1] + 4);
    return '<circle cx="' + pos[i][0] + '" cy="' + pos[i][1] + '" r="7" class="cy-dot"/><text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" class="cy-lbl">' + esc(t) + '</text>';
  }).join("");
  return '<div class="ig ig-cycle"><svg viewBox="0 0 320 250" role="img" aria-label="Ciclo de satisfação e expansão da receita"><defs><marker id="cyA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#FF6B00"/></marker></defs>' +
    '<ellipse cx="160" cy="120" rx="136" ry="96" class="cy-ring"/>' +
    '<path d="M175 26 A136 96 0 0 1 294 106" class="cy-arc" marker-end="url(#cyA)"/><path d="M294 134 A136 96 0 0 1 175 214" class="cy-arc" marker-end="url(#cyA)"/><path d="M145 214 A136 96 0 0 1 26 134" class="cy-arc" marker-end="url(#cyA)"/><path d="M26 106 A136 96 0 0 1 145 26" class="cy-arc" marker-end="url(#cyA)"/>' +
    '<text x="160" y="116" text-anchor="middle" class="cy-core">Mais receita</text><text x="160" y="134" text-anchor="middle" class="cy-sub">de quem já é cliente</text>' + nodes + '</svg></div>';
}
function infographic(id, d) {
  var t = INFO[id];
  return t === "converge" ? igConverge(d) : t === "flow" ? igFlow(d) : t === "formula" ? igFormula(d) : t === "funnels" ? igFunnels(d) : t === "layers" ? igLayers(d) : igCycle(d);
}

/* ---------- vista do guia ---------- */
function journeyHtml() {
  var cur = state.jornada ? estagio(state.jornada) : null;
  var st = ESTAGIOS.map(function (e, i) {
    var sel = cur && cur.v === e.v;
    return '<button type="button" role="radio" aria-checked="' + !!sel + '" class="gs' + (sel ? " here" : "") + '" data-jornada="' + e.v + '">' +
      '<span class="gs-n">' + (i + 1) + '</span><span class="gs-t">' + esc(e.titulo) + '</span><span class="gs-d">' + esc(e.curto) + '</span></button>';
  }).join('<span class="gs-arrow" aria-hidden="true">→</span>');
  var panel;
  if (!cur) panel = '<p class="gj-hint">Toque no estágio mais próximo da sua realidade. O guia indica por quais áreas da máquina de receita começar.</p>';
  else {
    var chips = cur.areas.map(function (id) { return '<li>' + esc(area(id).name) + '</li>'; }).join("");
    panel = '<div class="gj-here"><span class="gj-tag">Você está aqui</span><h3>' + esc(cur.titulo) + '</h3><p>' + esc(cur.desc) + '</p>' +
      '<p class="gj-start">Por onde começar</p><ol class="gj-chips">' + chips + '</ol>' +
      '<button type="button" class="btn btn--primary" data-open-area="' + cur.areas[0] + '">Abrir a primeira área</button></div>';
  }
  return '<div class="gs-map" role="radiogroup" aria-label="Estágio do seu negócio">' + st + '</div><div class="gj-panel" id="gjPanel" aria-live="polite">' + panel + '</div>';
}

function areaHtml(a, i) {
  var d = PLAYBOOK[a.id];
  var cur = state.jornada ? estagio(state.jornada) : null;
  var here = !!(cur && cur.areas.indexOf(a.id) !== -1);
  var intro = d.intro.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  var formula = (d.formula && INFO[a.id] !== "formula") ?'<p class="pb-formula">' + esc(d.formula) + '</p>' : "";
  var cards = d.cards.map(function (c) {
    var list = c.list ? '<ul>' + c.list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' : "";
    return '<div class="pb-card"><b>' + esc(c.t) + '</b><p>' + esc(c.p) + '</p>' + list + '</div>';
  }).join("");
  var dream = d.dream ? '<p class="pb-dream">' + esc(d.dream) + '</p>' : "";
  var acts = d.actions.map(function (x, k) {
    var key = a.id + "-" + k, on = !!state.checks[key];
    return '<li><label class="pb-check' + (on ? " on" : "") + '"><input type="checkbox" data-check="' + key + '"' + (on ? " checked" : "") + '><span class="pb-box"></span><span class="pb-act"><em>' + esc(x.w) + '</em>' + esc(x.t) + '</span></label></li>';
  }).join("");
  var errs = d.errors.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
  var sg = state.segmento ? seg(state.segmento) : null;
  var segNote = (sg && sg.notes[a.id]) ? '<p class="ar__seg"><b>No seu segmento (' + esc(sg.label) + ')</b>' + esc(sg.notes[a.id]) + '</p>' : "";
  return '<article class="ar' + (here ? " is-here" : "") + '" id="ar-' + a.id + '" data-area="' + a.id + '">' +
    '<h3 class="ar__h"><button type="button" class="ar__head" aria-expanded="false" aria-controls="arb-' + a.id + '" data-toggle="' + a.id + '">' +
    '<span class="ar__num">' + pad(i + 1) + '</span><span class="ar__txt"><span class="ar__name">' + esc(a.name) + '</span><span class="ar__sub">' + esc(a.sub) + '</span></span>' +
    '<span class="ar__here">Recomendado para você</span><span class="ar__chev" aria-hidden="true"></span></button></h3>' +
    '<div class="ar__body" id="arb-' + a.id + '" hidden>' +
    '<h4 class="ar__title">' + esc(d.title) + '</h4><div class="pb-intro">' + intro + '</div>' + segNote + formula +
    infographic(a.id, d) +
    '<div class="ar__gate' + (state.lead ? "" : " is-locked") + '"><div class="ar__gate-in">' +
    '<h5 class="pb-sub">' + esc(d.cardsTitle) + '</h5><div class="pb-cards">' + cards + '</div>' + dream +
    '<h5 class="pb-sub">Faça nos 30 dias</h5><ul class="pb-acts">' + acts + '</ul>' +
    '<div class="pb-errors"><b>Erros comuns</b><ul>' + errs + '</ul></div></div>' +
    '<div class="ar__lock"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><p>Cadastre-se para ler o restante desta etapa e as demais.</p><button type="button" class="btn btn--primary" data-ask>Liberar o guia gratuito</button></div>' +
    '</div></div></article>';
}

function segHtml() {
  var cur = state.segmento;
  return '<div class="sg-map" role="radiogroup" aria-label="Segmento">' + SEGS.map(function (s) {
    var sel = cur === s.id;
    return '<button type="button" role="radio" aria-checked="' + sel + '" class="sg' + (sel ? " here" : "") + '" data-seg="' + s.id + '">' + esc(s.label) + '</button>';
  }).join("") + '</div>';
}

function playbookInner() {
  var s = state.segmento ? seg(state.segmento) : null;
  var sub = s ? "Conteúdo ajustado para quem atende " + s.who + ". " : "";
  return '<div class="deck__header deck__header--wide"><p class="eyebrow">Playbook Growth 30D' + (s ? " · " + esc(s.label) : "") + '</p>' +
    '<h2 class="deck__title">As 7 áreas da máquina de receita' + (s ? " para o seu segmento" : "") + '</h2>' +
    '<p class="deck__subtitle">' + esc(sub) + 'Abra uma área para ver o que fazer, como fazer e os erros mais comuns. ' + (state.lead ? "O seu acesso está liberado." : "Depois de abrir uma área e continuar a leitura, você faz um cadastro rápido e libera todo o conteúdo.") + '</p></div>' +
    '<div class="ar-list">' + AREAS.map(areaHtml).join("") + '</div>' +
    '<div class="pb-cta"><p>Quer fazer isso com acompanhamento? Na Sessão Diagnóstico eu avalio o seu momento e monto o plano para o seu caso.</p>' +
    '<a class="btn btn--primary" id="ctaWa" href="' + esc(waUrl()) + '" target="_blank" rel="noopener">Agendar Sessão Diagnóstico</a></div>';
}

function syncSteps() {
  $("stEst").hidden = !state.segmento;
  $("playbook").hidden = !(state.segmento && state.jornada);
}

function renderGuia() {
  views.guia.innerHTML =
    '<section class="deck deck--light gj" id="jornada"><div class="gj-wrap">' +
    '<div class="gj-top"><a href="#" class="gj-back" data-act="home">← Voltar ao início</a>' +
    '<button type="button" class="gj-reset" data-reset>Recomeçar do zero</button></div>' +
    '<div class="gj-step" id="stSeg">' +
    '<p class="eyebrow">Guia Growth 30D · Passo 1 de 2</p>' +
    '<h1 class="gj-title">Qual é o seu segmento?</h1>' +
    '<p class="gj-lead">O playbook usa exemplos e analogias do seu mercado. Escolha o segmento mais próximo da sua atuação.</p>' +
    '<div id="sgBox">' + segHtml() + '</div></div>' +
    '<div class="gj-step gj-step--2" id="stEst"' + (state.segmento ? "" : " hidden") + '>' +
    '<p class="eyebrow">Passo 2 de 2</p>' +
    '<h2 class="gj-title gj-title--2">Em que estágio do seu negócio você está?</h2>' +
    '<p class="gj-lead">Escolha o estágio mais próximo da sua realidade. O guia indica por quais das 7 áreas da máquina de receita começar.</p>' +
    '<div id="gjDiagram">' + journeyHtml() + '</div></div>' +
    '</div></section>' +
    '<section class="deck deck--tone" id="playbook"' + ((state.segmento && state.jornada) ? "" : " hidden") + '><div class="pb-inner" id="pbInner">' + playbookInner() + '</div></section>';
  updateWaLinks();
}
function renderPlaybook() { var pb = $("pbInner"); if (pb) pb.innerHTML = playbookInner(); updateWaLinks(); }
function updateWaLinks() {
  var wa = waUrl();
  var c = $("ctaWa"); if (c) c.setAttribute("href", wa);
  document.querySelectorAll("#servicos .offer-card__cta").forEach(function (a) { a.setAttribute("href", wa); });
}

/* ---------- abrir áreas e pedir o cadastro depois da rolagem ---------- */
var arm = { on: false, base: 0, asked: false };
function armAsk(delay) {
  if (state.lead) return;
  arm.on = true; arm.asked = false;
  setTimeout(function () { arm.base = window.scrollY; }, delay || 0);
}
function toggleArea(id, force) {
  var art = $("ar-" + id); if (!art) return;
  var head = art.querySelector(".ar__head"), body = $("arb-" + id);
  var open = force === undefined ? head.getAttribute("aria-expanded") !== "true" : force;
  head.setAttribute("aria-expanded", open ? "true" : "false");
  body.hidden = !open;
  art.classList.toggle("is-open", open);
  if (open) armAsk(60);
}
window.addEventListener("scroll", function () {
  if (!arm.on || arm.asked || state.lead || current !== "guia") return;
  if (Math.abs(window.scrollY - arm.base) > CONFIG.scrollToAsk) { arm.asked = true; openModal(); }
}, { passive: true });

/* ---------- cadastro (pop-up) ---------- */
var modal = $("leadModal"), lastFocus = null;
function openModal() {
  if (!modal || state.lead) return;
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("md-open");
  var sm = $("mdSummary");
  if (sm) sm.innerHTML = '<b>Segmento:</b> ' + esc(segLabel() || "-") + '<br><b>Estágio:</b> ' + esc((state.jornada && estagio(state.jornada)) ? estagio(state.jornada).curto : "-");
  var f = $("m-nome"); if (f) setTimeout(function () { f.focus(); }, 30);
}
function refreshJourney() {
  var dg = $("gjDiagram"); if (dg) dg.innerHTML = journeyHtml();
  var cE = state.jornada ? estagio(state.jornada) : null;
  document.querySelectorAll(".ar").forEach(function (a) { a.classList.toggle("is-here", !!cE && cE.areas.indexOf(a.getAttribute("data-area")) !== -1); });
}
function closeModal(silent) {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("md-open");
  if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
}
function maskPhone(v) {
  var d = String(v).replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length > 6) return "(" + d.slice(0, 2) + ") " + d.slice(2, d.length > 10 ? 7 : 6) + "-" + d.slice(d.length > 10 ? 7 : 6);
  if (d.length > 2) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length > 0) return "(" + d;
  return "";
}
function validateLead(d) {
  var e = {};
  if (d.nome.length < 2) e.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = "Informe um e-mail válido.";
  var digits = d.whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) e.whats = "Informe um telefone com DDD.";
  if (!d.porte) e.porte = "Escolha o tamanho da empresa.";
  if (!d.consent) e.consent = "Marque para continuar.";
  return e;
}
function readLead() {
  function v(id) { var el = $(id); return el ? el.value.trim() : ""; }
  return { nome: v("m-nome"), email: v("m-email"), whatsapp: v("m-whats"), porte: v("m-porte"), consent: !!$("m-consent").checked };
}
function unlockAll() {
  document.querySelectorAll(".ar__gate.is-locked").forEach(function (g) { g.classList.remove("is-locked"); });
  var sub = document.querySelector("#playbook .deck__subtitle");
  if (sub) sub.textContent = "Abra uma área para ver o que fazer, como fazer e os erros mais comuns. O seu acesso está liberado.";
  updateWaLinks();
}
function buildModal() {
  function opts(list) { return '<option value="">Selecione</option>' + list.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join(""); }
  function fld(id, label, control) { return '<div class="fld" id="mf-' + id + '"><label for="m-' + id + '">' + label + '</label>' + control + '<span class="err" id="me-' + id + '" role="alert"></span></div>'; }
  modal.innerHTML = '<div class="md-card" role="dialog" aria-modal="true" aria-labelledby="mdTitle">' +
    '<button type="button" class="md-x" data-md-close aria-label="Fechar">×</button>' +
    '<p class="eyebrow">Acesso gratuito</p><h2 id="mdTitle">Libere o Guia Growth 30D</h2>' +
    '<p class="md-lead">Cadastre-se para ler todas as áreas do playbook e acompanhar as ações dos 30 dias.</p>' +
    '<form class="md-form" id="mdForm" novalidate>' +
    fld("nome", "Nome", '<input id="m-nome" type="text" autocomplete="name">') +
    '<div class="md-two">' + fld("email", "E-mail", '<input id="m-email" type="email" autocomplete="email" inputmode="email">') +
    fld("whats", "Telefone", '<input id="m-whats" type="tel" autocomplete="tel" inputmode="tel" placeholder="(00) 00000-0000">') + '</div>' +
    fld("porte", "Tamanho da empresa", '<select id="m-porte">' + opts(PORTES) + '</select>') +
    '<p class="md-sum" id="mdSummary"></p>' +
    '<div class="fld" id="mf-consent"><label class="md-consent" for="m-consent"><input id="m-consent" type="checkbox"><span>Concordo em receber o guia e contatos sobre growth, conforme a LGPD.</span></label><span class="err" id="me-consent" role="alert"></span></div>' +
    '<button type="submit" class="btn btn--primary md-submit">Liberar o guia</button>' +
    '<p class="md-priv">Sem spam. Você pode pedir a remoção dos seus dados quando quiser.</p></form></div>';
}
if (modal) buildModal();

/* ---------- eventos ---------- */
function startFlow() { goTo("#playbook"); }

document.addEventListener("click", function (e) {
  var cta = e.target.closest("#navCta");
  if (cta) {
    if (cta.getAttribute("data-mode") === "wa") { sendLead("cta-whatsapp"); window.open(waUrl(), "_blank", "noopener"); }
    else startFlow();
    return;
  }
  var start = e.target.closest("[data-start]");
  if (start) { e.preventDefault(); startFlow(); return; }

  var anc = e.target.closest('a[href^="#"]');
  if (anc && current === "guia") {
    var href = anc.getAttribute("href");
    if (href === "#" || anc.getAttribute("data-act") === "home") { e.preventDefault(); history.pushState(null, "", location.pathname + location.search); route(); return; }
    var aid = href.slice(1);
    if (aid === "servicos" || aid === "redes") {
      e.preventDefault();
      var tg = document.getElementById(aid);
      if (tg) window.scrollTo({ top: tg.getBoundingClientRect().top + window.scrollY - 76, behavior: "smooth" });
      return;
    }
  }

  var wa = e.target.closest("#ctaWa, #servicos .offer-card__cta");
  if (wa) sendLead("cta-whatsapp");

  if (e.target.closest("[data-reset]")) { resetAll(); return; }
  var sgb = e.target.closest("[data-seg]");
  if (sgb) {
    state.segmento = sgb.getAttribute("data-seg"); saveState();
    $("sgBox").innerHTML = segHtml();
    syncSteps(); renderPlaybook();
    if (state.lead) sendLead("segmento");
    var st2 = $("stEst");
    if (st2) window.scrollTo({ top: st2.getBoundingClientRect().top + window.scrollY - 84, behavior: "smooth" });
    return;
  }
  var jr = e.target.closest("[data-jornada]");
  if (jr) {
    state.jornada = jr.getAttribute("data-jornada"); saveState();
    refreshJourney(); syncSteps(); renderPlaybook();
    if (state.lead) sendLead("jornada");
    var pbs = $("gjPanel"); if (pbs && window.innerWidth < 800) pbs.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }
  if (e.target.closest("[data-see-playbook]")) {
    var pbk = $("playbook");
    if (pbk) window.scrollTo({ top: pbk.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
    return;
  }
  var oa = e.target.closest("[data-open-area]");
  if (oa) {
    var id = oa.getAttribute("data-open-area");
    toggleArea(id, true);
    var art = $("ar-" + id);
    window.scrollTo({ top: art.getBoundingClientRect().top + window.scrollY - 76, behavior: "smooth" });
    armAsk(900);
    return;
  }
  var tg2 = e.target.closest("[data-toggle]");
  if (tg2) { toggleArea(tg2.getAttribute("data-toggle")); return; }
  if (e.target.closest("[data-ask]")) { openModal(); return; }
  if (e.target.closest("[data-md-close]") || e.target === modal) { closeModal(); return; }
});

document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

modal.addEventListener("input", function (e) {
  if (e.target && e.target.id === "m-whats") e.target.value = maskPhone(e.target.value);
});
modal.addEventListener("submit", function (e) {
  e.preventDefault();
  var d = readLead(), errs = validateLead(d);
  ["nome", "email", "whats", "porte", "consent"].forEach(function (k) {
    var f = $("mf-" + k), m = $("me-" + k);
    if (f) f.classList.toggle("bad", !!errs[k]);
    if (m) m.textContent = errs[k] || "";
  });
  var first = ["nome", "email", "whats", "porte", "consent"].filter(function (k) { return errs[k]; })[0];
  if (first) { var el = $("m-" + first); if (el) el.focus(); return; }
  state.lead = d; saveState();
  sendLead("cadastro");
  closeModal(true);
  unlockAll();
});

views.guia.addEventListener("change", function (e) {
  var k = e.target.getAttribute && e.target.getAttribute("data-check");
  if (!k) return;
  state.checks[k] = e.target.checked; saveState();
  var lab = e.target.closest(".pb-check"); if (lab) lab.classList.toggle("on", e.target.checked);
});

window.addEventListener("hashchange", route);
loadState();
route();
