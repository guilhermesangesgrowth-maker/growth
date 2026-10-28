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
    title: "Autoridade sozinha deixou de vender serviço high-ticket",
    intro: [
      "Quem compra um serviço de alto valor recebe ofertas de concorrentes, agências e gurus todos os dias. Ter um currículo forte abre portas, mas a decisão de compra pede uma tese: o que o mercado faz de errado, o que você faz diferente e qual resultado o cliente leva.",
      "A tese organiza tudo o que vem depois, tanto para o serviço principal (a clínica, o escritório, a consultoria) quanto para a frente de consultoria ou mentoria. Ela define o que você publica, o que você promete e como conduz a venda."
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
    title: "Defina quem você atende e o que cada serviço entrega",
    intro: [
      "Serviço high-ticket que atende qualquer pessoa vira serviço difícil de vender. O produto começa por um cliente ideal (ICP) e por um problema que ele reconhece e paga para resolver.",
      "Isso vale para o serviço principal e para a frente de consultoria ou mentoria. Cada um precisa de método, etapas e entregáveis que o cliente enxerga, compara e compra. Quando os dois conversam, o cliente do serviço principal vira o primeiro cliente da consultoria."
    ],
    cardsTitle: "Os quatro blocos do produto",
    cards: [
      { t: "Cliente ideal", p: "Quem é, em que setor e porte atua, em que momento está e qual gatilho faz essa pessoa procurar ajuda." },
      { t: "Problema", p: "A dor em uma frase, nas palavras do cliente, e o custo de continuar com ela." },
      { t: "Resultado e prazo", p: "O que muda ao final do projeto e em quanto tempo, com uma forma clara de medir." },
      { t: "Método e entregáveis", p: "Três a cinco etapas com nome, cada uma com um entregável que o cliente recebe." }
    ],
    actions: [
      { w: "Semana 0", t: "Escolha um cliente ideal para o serviço principal e escreva as cinco perguntas que ele faz antes de contratar." },
      { w: "Semana 0", t: "Liste três problemas que você resolve e escolha o de maior urgência e maior valor." },
      { w: "Semana 0", t: "Desenhe o método em 3 a 5 etapas com nome e entregável. Se existir a frente de consultoria ou mentoria, desenhe o método dela também." },
      { w: "Semana 1", t: "Feche escopo, prazo e preço baseado no valor do resultado, e não nas horas." }
    ],
    errors: ["Atender todos os perfis e depois não saber vender para nenhum.", "Vender horas em vez de resultado.", "Método sem nome e sem entregáveis, que o cliente não consegue comparar."]
  },
  posicionamento: {
    title: "Uma frase que faz o cliente certo levantar a mão",
    intro: [
      "Posicionamento é a resposta rápida para \"por que contratar você e não outra pessoa?\". Quem tem carreira sólida costuma se descrever pelo cargo e pela formação. O cliente quer saber o que muda para ele.",
      "A frase de posicionamento junta público, resultado, prazo e método, e precisa aparecer do mesmo jeito no perfil, na proposta e na conversa de venda, para o serviço principal e para a frente de consultoria ou mentoria."
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
      "O critério de escolha é simples: onde o seu cliente ideal já está e onde você consegue manter uma rotina semanal. Os mesmos canais podem alimentar o serviço principal e a frente de consultoria ou mentoria."
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
      "Em serviços high-ticket, cada contato vale muito e a agenda é curta. A meta é economizar tempo nas tarefas repetitivas e nunca perder uma oportunidade por falta de resposta."
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
      "Alta performance em inside sales vem de processo, e não de talento natural. Em serviços de ticket alto, vence quem conduz a conversa com perguntas, mostra o custo do problema e fecha o próximo passo na hora.",
      "A sessão diagnóstico é o coração da venda, seja ela de um procedimento, de um projeto ou de uma consultoria. Ela precisa de roteiro, de uma proposta que sai rápido e de um follow-up com prazo."
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
      "É aqui que o serviço principal e a frente de consultoria ou mentoria se alimentam: o cliente satisfeito indica novos clientes e pode virar aluno ou cliente da consultoria. Isso exige método. Sem um marco de resultado e um momento certo para pedir, a indicação fica ao acaso."
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

/* =====================================================================
 * GUIA GROWTH 30D: captura -> guia em formato de site (#playbook)
 * 1) A pessoa se localiza na jornada (diagrama) e abre as áreas do método.
 * 2) Depois de abrir uma área e rolar a página, abre o cadastro.
 * 3) Com o cadastro feito, todo o conteúdo fica liberado.
 * ===================================================================== */
var CONFIG = {
  whatsapp: "5519998878022",
  // Google Forms (respostas gravadas na planilha "[GS GROWTH] leads-guia-growth-30D"). Vazio = não envia
  gtmId: "",               // ID do contêiner do Google Tag Manager (ex.: "GTM-XXXXXXX"). Vazio = não carrega
  leadEndpoint: "https://docs.google.com/forms/d/e/1FAIpQLSf7K-fnfHxo8OGYD715wdvWaF0r1p61pyV3kAbxDS8_Pd_n6w/formResponse",
  formFields: { etapa: "entry.176202070", origem: "entry.1587842509", nome: "entry.598034783", email: "entry.362575635", whatsapp: "entry.745510118", pagina: "entry.722341163", segmento: "entry.1739758473", porte: "entry.1257151820", estagio: "entry.1229289482", jornada: "entry.1355015536", consentimento: "entry.748315144", investe: "entry.1475592940" },
  origem: "guia-growth-30d",
  storageKey: "g30d-v3",
  scrollToAsk: 260         // quantos pixels de rolagem depois de abrir uma área até pedir o cadastro
};

/* Tipo de infográfico de cada área */
var INFO = { tese: "converge", produto: "flow", posicionamento: "formula", canais: "funnels", ia: "layers", vendas: "flow", expansao: "cycle" };

/* Estágio do negócio: aparece no diagrama da jornada e no cadastro */
var ESTAGIOS = [
  { v: "construir", t: "Quero vender mais o meu serviço high-ticket e abrir a minha frente de consultoria/mentoria em 30 dias.",
    titulo: "Travado, sem demanda previsível nem frente de consultoria",
    curto: "Quero vender mais o serviço principal e abrir a frente de consultoria ou mentoria",
    desc: "Você tem experiência e resultado, mas a demanda do serviço principal ainda depende de indicação e a consultoria ou mentoria ainda não existe. O foco é definir o que vender, para quem e como se posicionar.",
    areas: ["tese", "produto", "posicionamento"] },
  { v: "melhorar", t: "Já tenho serviço high-ticket e/ou produto de conhecimento, mas quero melhorar o marketing e vender mais em 30 dias.",
    titulo: "Com serviço e/ou consultoria, travado em vendas",
    curto: "Tenho serviço e/ou consultoria, mas as vendas travaram",
    desc: "O serviço existe, mas a demanda e a conversão não acompanham. O foco é gerar oportunidades, organizar a operação comercial e fechar mais, no serviço principal e na frente de consultoria ou mentoria.",
    areas: ["canais", "vendas", "ia"] },
  { v: "acelerar", t: "Já tenho serviço high-ticket e consultoria/mentoria e quero acelerar o ecossistema (marketing, vendas, IA e expansão de receita).",
    titulo: "Com serviço e consultoria, quero acelerar o ecossistema",
    curto: "Tenho serviço e consultoria e quero acelerar o ecossistema",
    desc: "O básico funciona nas duas frentes. O foco é ganhar escala com IA e martech, aumentar o valor de cada cliente e abrir novas fontes de receita, como indicações, parcerias e a conversão de clientes do serviço em clientes da consultoria.",
    areas: ["ia", "expansao", "canais"] }
];
function estagio(v) { return ESTAGIOS.filter(function (e) { return e.v === v; })[0]; }
/* Segmentos e o que muda no playbook para cada um (analogias do ofício de quem vende a consultoria) */
var SEGS = [
  { id: "saude", label: "Saúde e Bem-estar", who: "pacientes e profissionais de saúde", notes: {
    tese: "Na saúde, o inimigo comum é o marketing que vende procedimento e promessa. A sua tese mostra a prática que atrapalha a decisão do paciente e o seu jeito de conduzir o tratamento, e vale também para a mentoria de outros profissionais.",
    produto: "Pense como numa consulta: a anamnese é o paciente e o problema, o diagnóstico é o resultado esperado e o protocolo é o método em etapas, cada uma com um entregável. A frente de mentoria segue a mesma lógica, com outro cliente.",
    posicionamento: "Na saúde, a confiança vem da especialidade. Escolha um recorte (por exemplo, um tipo de tratamento ou perfil de paciente) e use a formação como prova do método, tanto na clínica quanto na mentoria.",
    canais: "Indicação entre colegas e pacientes satisfeitos seguem fortes. Some conteúdo com casos e explicações simples e uma lista de contatos qualificada, respeitando as regras do conselho profissional.",
    ia: "Use IA para resumir reuniões, rascunhar propostas e responder primeiros contatos. Trate os dados com o mesmo rigor do sigilo profissional, respeitando a LGPD.",
    vendas: "Conduza a sessão diagnóstico como uma consulta: escute, mapeie o problema, explique o plano e combine o retorno antes de encerrar. A avaliação inicial é a venda.",
    expansao: "Acompanhe o cliente como num tratamento contínuo: revisões periódicas, marcos de resultado e indicação no momento certo. Pacientes e colegas satisfeitos viram a base da mentoria." } },
  { id: "engenharia", label: "Engenharia e Construção", who: "construtoras, incorporadoras e clientes de projeto", notes: {
    tese: "O inimigo comum é a obra gerida por planilha solta e prazos que escorregam. A tese mostra o gargalo que o mercado ignora e o método que você usa para resolvê-lo, nos projetos e na consultoria.",
    produto: "Defina cada serviço como um projeto: escopo, cronograma, entregáveis por fase e critério de aceite. A consultoria técnica ou de gestão segue o mesmo formato.",
    posicionamento: "Posicione-se por tipo de obra ou de problema (custo, prazo ou qualidade) e use projetos entregues como prova.",
    canais: "Eventos setoriais, associações e relacionamento com incorporadoras rendem bem. Registre cada contato e combine com conteúdo técnico no LinkedIn.",
    ia: "Automatize relatórios de acompanhamento, orçamentos preliminares e resumos de reunião, com revisão técnica antes de enviar.",
    vendas: "Trate cada conversa como um levantamento de campo: meça o problema, estime o impacto em custo e prazo e proponha a solução por fases.",
    expansao: "Entregue por fases e use o fim de cada fase como porta para a próxima. Indicações entre incorporadoras e fornecedores, e a consultoria para quem já é cliente, completam o ciclo." } },
  { id: "arquitetura", label: "Arquitetura e Design", who: "clientes de projeto e outros escritórios", notes: {
    tese: "O inimigo comum é o escritório que vive de projeto por projeto e de orçamento negociado a desconto. A tese mostra um modelo de negócio mais previsível, para o seu escritório e para quem você orienta.",
    produto: "Use o raciocínio do briefing: as perguntas certas no começo definem o projeto. Estruture o serviço e a consultoria com entregáveis visíveis, como diagnóstico, estudo e plano.",
    posicionamento: "Posicione-se por um tipo de projeto ou de cliente e mostre resultados de negócio ao lado do portfólio estético.",
    canais: "Indicações de clientes e de parceiros, como engenheiros e fornecedores, funcionam. Some uma rotina de conteúdo com bastidores dos projetos e da gestão do escritório.",
    ia: "Use IA para pesquisa de referências, textos de proposta e organização de briefings, mantendo a autoria e a revisão final com você.",
    vendas: "Faça da sessão diagnóstico um briefing: entenda o contexto, feche o escopo e entregue uma proposta clara com valor por fase.",
    expansao: "Projeto entregue é o melhor momento para pedir indicação e propor a etapa seguinte, como acompanhamento de obra, um novo ambiente ou a consultoria para outros escritórios." } },
  { id: "juridico", label: "Direito, Contabilidade e Finanças", who: "empresas e pessoas que contratam o seu serviço", notes: {
    tese: "O inimigo comum é a venda por hora e a captação por indicação sem processo. A tese mostra por que um serviço recorrente e com escopo definido protege a margem.",
    produto: "Transforme o conhecimento em serviços com escopo fechado: diagnóstico, plano e acompanhamento mensal. A frente de consultoria ou mentoria para outros profissionais segue o mesmo formato.",
    posicionamento: "Escolha uma especialidade e um tipo de cliente. A reputação técnica funciona como prova, desde que a frase fale do resultado para o cliente.",
    canais: "Parcerias com outros profissionais, eventos e LinkedIn funcionam bem. Combine com conteúdo que explique riscos e oportunidades em linguagem simples.",
    ia: "IA ajuda em pesquisa, resumos e rascunhos. Defina regras claras de sigilo e de dados do cliente e revise tudo antes de usar.",
    vendas: "Conduza a conversa inicial como um diagnóstico, mostre o risco de não agir e envie a proposta com escopo e valor no mesmo dia.",
    expansao: "Acompanhamento recorrente e revisões periódicas aumentam o valor do cliente. Peça indicação depois de um resultado concreto." } },
  { id: "executivo", label: "Executivo ou gestor de empresa", who: "empresas do setor em que você atuou", notes: {
    tese: "O inimigo comum é a consultoria genérica, que entrega slides e não mergulha na operação. A sua tese nasce da vivência de quem já comandou resultado.",
    produto: "Transforme a sua experiência em um serviço com nome, etapas e entregáveis, aplicado a um problema que você já resolveu dentro de empresas. Ele pode ser o serviço principal ou a frente de consultoria ou mentoria.",
    posicionamento: "Use a trajetória como prova. A frase de posicionamento fala do resultado que você gera para empresas do seu setor, com nomes e números públicos.",
    canais: "A sua rede de contatos é o canal mais forte. Estruture uma lista, uma abordagem e um conteúdo de LinkedIn com bastidores de gestão.",
    ia: "Use IA para pesquisa de mercado, preparação de reuniões e propostas, e mantenha o acompanhamento de cada conversa em um CRM simples.",
    vendas: "Venda como numa reunião de diretoria: diagnóstico, impacto no resultado e plano de ação em etapas, com data de decisão combinada.",
    expansao: "Programas de continuidade, treinamento do time do cliente e indicações dentro da rede de executivos ampliam a receita." } },
  { id: "consultoria", label: "Consultoria e mentoria", who: "empresas e profissionais do seu mercado", notes: {
    tese: "O inimigo comum é a consultoria genérica e a mentoria em grupo que promete tudo para todos. A tese mostra o que você faz diferente e para quem.",
    produto: "Se a consultoria ou mentoria é o seu serviço principal, trate-a como produto: cliente ideal, problema, método, entregáveis e escopo fechado. Se existir um segundo serviço, desenhe os dois lado a lado.",
    posicionamento: "Escolha um tipo de cliente e um resultado. A frase de posicionamento precisa dizer o que muda para o cliente em prazo definido.",
    canais: "Rede de contatos, conteúdo de fundo de funil e material rico (como este guia) costumam trazer as melhores conversas. Meça quantas viram sessão diagnóstico.",
    ia: "Use IA para pesquisa, resumos de sessão e rascunho de propostas, e automatize o follow-up. Mantenha a revisão final e o cuidado com os dados do cliente.",
    vendas: "A sessão diagnóstico é o ponto central: roteiro, proposta no mesmo dia e data de decisão combinada.",
    expansao: "Depois do resultado, peça indicação e apresente a continuidade: acompanhamento, nível acima ou programa em grupo." } },
  { id: "empresario", label: "Empresário de serviço de alto ticket", who: "empresários do seu mercado", notes: {
    tese: "O inimigo comum é o crescimento que vira agenda lotada e lucro menor. A tese mostra como vender mais sem aumentar o desgaste operacional.",
    produto: "Defina o serviço principal com método, etapas e entregáveis. Se fizer sentido, empacote o que você faz bem no seu negócio em um programa para outros empresários do mesmo mercado.",
    posicionamento: "Posicione-se como quem já construiu o resultado que o cliente quer. Os números e a história do seu negócio são a prova.",
    canais: "Associações, eventos e a base de clientes e fornecedores são ótimos canais. Registre cada contato e crie uma oferta de entrada.",
    ia: "Passe para as ferramentas o que consome a sua agenda: primeiro atendimento, lembretes, propostas e relatórios.",
    vendas: "Leve para a conversa a mesma disciplina de vendas do seu negócio: diagnóstico, proposta clara e acompanhamento até o fechamento.",
    expansao: "Cuide do pós-venda como parte do produto: marcos de resultado, depoimentos e indicações entre empresários do mesmo mercado." } },
  { id: "outro", label: "Outro segmento", who: "clientes do seu mercado", notes: {} }
];
function seg(id) { return SEGS.filter(function (s) { return s.id === id; })[0]; }
function segLabel() { var s = state.segmento ? seg(state.segmento) : null; return s ? s.label : ""; }
var INVEST = ["Não invisto em marketing", "Invisto mas não tenho o resultado que gostaria", "Invisto e estou satisfeito(a) com o resultado"];
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
  var msg = "Olá, vim do Guia Growth 30D e quero agendar uma Sessão Diagnóstico!";
  if (state.lead) {
    msg = "Olá, sou " + state.lead.nome + " (" + (segLabel() || "profissional") + ", " + state.lead.porte + "). ";
    var es = state.jornada ? estagio(state.jornada) : null;
    if (es) msg += es.curto + ". ";
    if (state.lead.investe) msg += "Marketing: " + state.lead.investe + ". ";
    msg += "Li o Guia Growth 30D e quero agendar uma Sessão Diagnóstico!";
  }
  return "https://api.whatsapp.com/send/?phone=" + CONFIG.whatsapp + "&text=" + encodeURIComponent(msg);
}

/* Envia ao Google Sheets (Apps Script). Cada etapa atualiza a mesma linha da pessoa. */
function sendLead(stage) {
  if (!CONFIG.leadEndpoint || !state.lead) return;
  var f = CONFIG.formFields, body = new URLSearchParams();
  body.append(f.etapa, stage); body.append(f.origem, CONFIG.origem);
  body.append(f.nome, state.lead.nome); body.append(f.email, state.lead.email); body.append(f.whatsapp, state.lead.whatsapp);
  body.append(f.segmento, segLabel()); body.append(f.porte, state.lead.porte); body.append(f.estagio, estagioLabel());
  body.append(f.jornada, state.jornada || ""); body.append(f.consentimento, state.lead.consent ? "sim" : "nao");
  body.append(f.investe, state.lead.investe || "");
  body.append(f.pagina, location.href.split("#")[0]);
  try {
    fetch(CONFIG.leadEndpoint, { method: "POST", mode: "no-cors", body: body, keepalive: true }).catch(function () {});
  } catch (err) {}
}

/* ---------- qualificação, URLs de destino e Google Tag Manager ----------
 * Depois do cadastro, a URL do guia muda conforme a resposta sobre investimento em marketing:
 *   #playbook-1  quem investe em marketing (satisfeito ou insatisfeito)  = qualificado
 *   #playbook-2  quem não investe em marketing                            = não qualificado
 * No GTM, use um gatilho "Mudança no histórico" ou "Visualização de página" com a condição
 * "Page URL termina com #playbook-1" para o remarketing só dos qualificados. */
function qualKey() {
  var v = state.lead && state.lead.investe;
  if (v === INVEST[1]) return "qualificado-insatisfeito";
  if (v === INVEST[2]) return "qualificado-satisfeito";
  if (v === INVEST[0]) return "nao-qualificado";
  return "";
}
function guideHash() {
  var k = qualKey();
  if (k === "nao-qualificado") return "#playbook-2";   // não investe em marketing
  return k ? "#playbook-1" : "#playbook";             // investe (satisfeito ou insatisfeito)
}

window.dataLayer = window.dataLayer || [];
function dl(event, extra) {
  var o = { event: event, qualificacao: qualKey() || "sem-cadastro", segmento: segLabel(), estagio: state.jornada || "" };
  for (var k in (extra || {})) o[k] = extra[k];
  window.dataLayer.push(o);
}
function loadGtm() {
  if (!CONFIG.gtmId) return;
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var s = document.createElement("script"); s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CONFIG.gtmId);
  document.head.appendChild(s);
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


/* ---------- guia em pop-up: 1 preview, 2 cadastro (uma pergunta por tela), 3 entrega do roadmap ---------- */
var WEEKS = [
  { w: "Semana 1", t: "Diagnóstico e produto", areas: ["tese", "produto"] },
  { w: "Semana 2", t: "Posicionamento e aquisição", areas: ["posicionamento", "canais"] },
  { w: "Semana 3", t: "Máquina de vendas", areas: ["ia", "vendas"] },
  { w: "Semana 4", t: "Retenção e expansão", areas: ["expansao"] }
];
var QS = [
  { k: "nome", type: "text", q: "Qual é o seu nome?", ph: "Seu nome", ac: "name", im: "text" },
  { k: "whatsapp", type: "tel", q: "Qual é o seu WhatsApp?", ph: "(00) 00000-0000", ac: "tel", im: "tel" },
  { k: "email", type: "email", q: "Qual é o seu melhor e-mail?", ph: "voce@email.com", ac: "email", im: "email" },
  { k: "segmento", type: "opts", q: "Qual é o seu segmento?" },
  { k: "porte", type: "opts", q: "Qual é o tamanho da sua empresa?" },
  { k: "investe", type: "final", q: "Já investe em marketing (agência, audiovisual ou tráfego)?" }
];
var SCREENS = ["preview", "lead", "pb"];
var ui = { screen: "preview", q: 0, draft: {}, timer: null };
current = "captura";

function openOverlay() {
  current = "guia";
  views.guia.hidden = false;
  document.body.classList.add("gm-open");
}
function closeOverlay() {
  current = "captura";
  views.guia.hidden = true;
  document.body.classList.remove("gm-open", "gm-s3");
  clearTimeout(ui.timer);
}
function goTo(hash) { if (location.hash === hash) route(); else location.hash = hash; }
function closeGuide() { history.pushState(null, "", location.pathname + location.search); route(); }

/* Limpa cadastro e checklist deste navegador e volta ao preview */
function resetAll() {
  state.lead = null; state.segmento = null; state.jornada = null; state.checks = {};
  try { localStorage.removeItem(CONFIG.storageKey); } catch (e) {}
  if (current === "guia" || location.hash.indexOf("#playbook") === 0) {
    if (location.hash !== "#playbook") history.replaceState(null, "", location.pathname + location.search + "#playbook");
    renderGuia();
  }
}

function route() {
  var h = location.hash;
  if (h === "#recomecar") { resetAll(); history.replaceState(null, "", location.pathname + location.search + "#playbook"); route(); return; }
  if (h.indexOf("#playbook") === 0) {
    if (current === "guia") return;   // troca entre #playbook e #playbook-... não recarrega o guia
    renderGuia(); openOverlay();
    if (state.lead && h !== guideHash()) location.hash = guideHash();   // visitante que já se cadastrou
    return;
  }
  closeOverlay();
  if (h && h.length > 1) { var el = document.getElementById(h.slice(1)); if (el) el.scrollIntoView(); }
}

function renderGuia() { ui.q = 0; ui.draft = {}; ui.screen = state.lead ? "pb" : "preview"; shell(); }
function goScreen(name) { ui.screen = name; dl("guia_tela", { tela: name }); shell(); }

function stepsHtml() {
  var n = SCREENS.indexOf(ui.screen) + 1;
  return [1, 2, 3].map(function (i) { return '<i class="' + (i <= n ? "on" : "") + '"></i>'; }).join("");
}

/* ---------- tela 1: preview das seções ---------- */
function previewHtml() {
  return '<div class="gm-screen gm-screen--pv"><p class="eyebrow">Material gratuito · 100% online</p>' +
    '<h2 class="gj-title" tabindex="-1">Guia Growth 30D</h2>' +
    '<p class="gj-lead">O roadmap de 4 semanas para vender mais com o seu serviço high-ticket e a sua consultoria/mentoria. Veja o que está dentro:</p>' +
    '<ol class="pv-list">' + AREAS.map(function (a, i) {
      return '<li><span>' + pad(i + 1) + '</span><b>' + esc(a.name) + '</b><small>' + esc(a.sub) + '</small></li>';
    }).join("") + '</ol>' +
    '<button type="button" class="btn btn--primary pv-go" data-pv-next>Quero acessar o guia</button>' +
    '<div class="pv-bar" aria-hidden="true"><i></i></div></div>';
}

/* ---------- tela 2: cadastro, uma pergunta por vez ---------- */
function qHtml() {
  var q = QS[ui.q], d = ui.draft, n = QS.length;
  var head = '<button type="button" class="gm-back" data-qback>← Voltar</button>' +
    '<div class="q-prog" aria-hidden="true"><i style="width:' + Math.round((ui.q + 1) / n * 100) + '%"></i></div>' +
    '<p class="eyebrow">Pergunta ' + (ui.q + 1) + ' de ' + n + '</p>' +
    '<h2 class="gj-title" tabindex="-1">' + esc(q.q) + '</h2>';
  var body;
  if (q.type === "opts") {
    var list = q.k === "segmento" ? SEGS.map(function (s) { return { v: s.id, l: s.label }; }) : PORTES.map(function (p) { return { v: p, l: p }; });
    body = '<div class="q-opts" role="radiogroup">' + list.map(function (o) {
      return '<button type="button" role="radio" aria-checked="' + (d[q.k] === o.v) + '" class="q-opt' + (d[q.k] === o.v ? " here" : "") + '" data-qopt="' + esc(o.v) + '">' + esc(o.l) + '</button>';
    }).join("") + '</div>';
  } else if (q.type === "final") {
    body = '<form id="qForm" novalidate><div class="q-radios">' + INVEST.map(function (t) {
      return '<label class="md-opt"><input type="radio" name="investe" value="' + esc(t) + '"' + (d.investe === t ? " checked" : "") + '><span class="md-dot"></span><span>' + esc(t) + '</span></label>';
    }).join("") + '</div>' +
      '<label class="md-consent q-consent" for="m-consent"><input id="m-consent" type="checkbox"><span>Concordo em receber o guia e contatos sobre growth, conforme a LGPD.</span></label>' +
      '<span class="err" id="q-err" role="alert"></span>' +
      '<button type="submit" class="btn btn--primary q-next">Liberar o guia</button>' +
      '<p class="md-priv">Sem spam. Você pode pedir a remoção dos seus dados quando quiser.</p></form>';
  } else {
    body = '<form id="qForm" novalidate><label class="sr" for="q-in">' + esc(q.q) + '</label>' +
      '<input id="q-in" class="q-in" type="' + q.type + '" autocomplete="' + q.ac + '" inputmode="' + q.im + '" placeholder="' + esc(q.ph) + '" value="' + esc(d[q.k] || "") + '">' +
      '<span class="err" id="q-err" role="alert"></span>' +
      '<button type="submit" class="btn btn--primary q-next">Continuar</button></form>';
  }
  return '<div class="gm-screen gm-screen--q">' + head + body + (q.type === "opts" ? '<span class="err" id="q-err" role="alert"></span>' : "") + '</div>';
}

function validateQ(k, v) {
  if (k === "nome") return v.length < 2 ? "Informe seu nome." : "";
  if (k === "whatsapp") { var dg = v.replace(/[^0-9]/g, ""); return (dg.length < 10 || dg.length > 11) ? "Informe um WhatsApp com DDD." : ""; }
  if (k === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Informe um e-mail válido.";
  return "";
}
function maskPhone(v) {
  var d = String(v).replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length > 6) return "(" + d.slice(0, 2) + ") " + d.slice(2, d.length > 10 ? 7 : 6) + "-" + d.slice(d.length > 10 ? 7 : 6);
  if (d.length > 2) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length > 0) return "(" + d;
  return "";
}
function showErr(msg) { var e = $("q-err"); if (e) e.textContent = msg || ""; }

function finishLead() {
  var d = ui.draft;
  state.lead = { nome: d.nome, email: d.email, whatsapp: d.whatsapp, porte: d.porte, investe: d.investe, consent: true };
  state.segmento = d.segmento; saveState();
  sendLead("cadastro");
  dl("guia_cadastro");
  if (qualKey().indexOf("qualificado") === 0) dl("lead_qualificado");   // investe em marketing (satisfeito ou não)
  goScreen("pb");
  location.hash = guideHash();   // URL de destino diferente para qualificado e não qualificado
}

/* ---------- tela 3: entrega do guia em roadmap de 4 semanas ---------- */
function deliveryHtml() {
  var sg = state.segmento ? seg(state.segmento) : null;
  var sub = (sg ? "Conteúdo ajustado para quem atende " + sg.who + ". " : "") + "Abra uma área para ver o que fazer, como fazer e os erros mais comuns.";
  var wk = WEEKS.map(function (W) {
    var items = W.areas.map(function (id) { var a = area(id); return areaHtml(a, AREAS.indexOf(a)); }).join("");
    return '<section class="wk"><div class="wk__h"><span class="wk__n">' + esc(W.w) + '</span><span class="wk__t">' + esc(W.t) + '</span></div><div class="ar-list">' + items + '</div></section>';
  }).join("");
  return '<div class="gm-screen gm-screen--pb"><p class="eyebrow">Guia Growth 30D' + (sg ? " · " + esc(sg.label) : "") + '</p>' +
    '<h2 class="gj-title" tabindex="-1">Seu roadmap de 4 semanas</h2>' +
    '<p class="gj-lead">' + esc(sub) + '</p>' +
    '<a class="gm-dl" href="guia-growth-30d.pdf" download data-dl>Baixar Guia Growth 30D (PDF)</a>' +
    '<div class="wk-list">' + wk + '</div></div>';
}

function screenHtml() {
  if (ui.screen === "preview") return previewHtml();
  if (ui.screen === "lead") return qHtml();
  return deliveryHtml();
}

function shell() {
  clearTimeout(ui.timer);
  var pb = ui.screen === "pb";
  document.body.classList.toggle("gm-s3", pb && current === "guia");
  views.guia.innerHTML =
    '<div class="gm-backdrop" data-gm-close></div>' +
    '<div class="gm" role="dialog" aria-modal="true" aria-label="Guia Growth 30D">' +
    '<div class="gm-bar"><div class="gm-steps" aria-hidden="true">' + stepsHtml() + '</div>' +
    '<div class="gm-actions">' + (state.lead ? '<button type="button" class="gj-reset" data-reset>Recomeçar</button>' : "") +
    '<button type="button" class="gm-x" data-gm-close aria-label="Fechar o guia">×</button></div></div>' +
    '<div class="gm-scroll" id="gmScroll">' + screenHtml() + '</div>' +
    (pb ? '<div class="gm-foot"><a class="btn btn--primary" id="ctaWa" href="' + esc(waUrl()) + '" target="_blank" rel="noopener">Agendar Sessão Diagnóstico</a></div>' : "") +
    '</div>';
  updateWaLinks();
  var inp = $("q-in");
  if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 60);
  else { var h = views.guia.querySelector(".gj-title"); if (h) h.focus({ preventScroll: true }); }
  if (ui.screen === "preview") ui.timer = setTimeout(function () { if (ui.screen === "preview" && current === "guia") goScreen("lead"); }, 2000);
}

function updateWaLinks() {
  var wa = waUrl();
  var c = $("ctaWa"); if (c) c.setAttribute("href", wa);
  document.querySelectorAll(".wa-float, #servicos .offer-card__cta").forEach(function (a) { a.setAttribute("href", wa); });
}

function toggleArea(id) {
  var art = $("ar-" + id); if (!art) return;
  var head = art.querySelector(".ar__head"), body = $("arb-" + id);
  var open = head.getAttribute("aria-expanded") !== "true";
  head.setAttribute("aria-expanded", open ? "true" : "false");
  body.hidden = !open;
  art.classList.toggle("is-open", open);
}

/* ---------- eventos ---------- */
function startFlow() { goTo("#playbook"); }

document.addEventListener("click", function (e) {
  if (e.target.closest("#navCta") || e.target.closest("[data-start]")) { e.preventDefault(); startFlow(); return; }

  if (e.target.closest(".wa-float, #ctaWa, #servicos .offer-card__cta")) { sendLead("cta-whatsapp"); dl("guia_cta_whatsapp"); }
  if (e.target.closest("[data-dl]")) { dl("guia_download_pdf"); return; }

  if (e.target.closest("[data-gm-close]")) { closeGuide(); return; }
  if (e.target.closest("[data-reset]")) { resetAll(); return; }

  if (e.target.closest(".gm-screen--pv")) { goScreen("lead"); return; }

  if (e.target.closest("[data-qback]")) {
    if (ui.q > 0) { ui.q--; shell(); } else goScreen("preview");
    return;
  }
  var qo = e.target.closest("[data-qopt]");
  if (qo) {
    ui.draft[QS[ui.q].k] = qo.getAttribute("data-qopt");
    ui.q++; shell();
    return;
  }
  var tg = e.target.closest("[data-toggle]");
  if (tg) { toggleArea(tg.getAttribute("data-toggle")); return; }
});

document.addEventListener("keydown", function (e) { if (e.key === "Escape" && current === "guia") closeGuide(); });

views.guia.addEventListener("input", function (e) {
  if (e.target && e.target.id === "q-in") {
    if (e.target.type === "tel") e.target.value = maskPhone(e.target.value);
    showErr("");
  }
});
views.guia.addEventListener("submit", function (e) {
  if (e.target.id !== "qForm") return;
  e.preventDefault();
  var q = QS[ui.q];
  if (q.type === "final") {
    var r = document.querySelector('input[name="investe"]:checked');
    if (!r) { showErr("Escolha uma opção."); return; }
    if (!$("m-consent").checked) { showErr("Marque para continuar."); return; }
    ui.draft.investe = r.value;
    finishLead();
    return;
  }
  var el = $("q-in"), v = el.value.trim(), msg = validateQ(q.k, v);
  if (msg) { showErr(msg); el.focus(); return; }
  ui.draft[q.k] = v;
  ui.q++; shell();
});

views.guia.addEventListener("change", function (e) {
  var k = e.target.getAttribute && e.target.getAttribute("data-check");
  if (!k) return;
  state.checks[k] = e.target.checked; saveState();
  var lab = e.target.closest(".pb-check"); if (lab) lab.classList.toggle("on", e.target.checked);
});

window.addEventListener("hashchange", route);
loadState();
loadGtm();
if (!location.hash) history.replaceState(null, "", location.pathname + location.search + "#playbook");   // a página já abre no pop-up do guia
route();
