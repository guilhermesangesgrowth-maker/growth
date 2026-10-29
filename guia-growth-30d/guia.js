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


/* Roadmap de 4 semanas: 7 seções do guia (4 na semana 1, uma em cada semana seguinte) */
var AREAS = [
  { id: "negocio", short: "Negócio", name: "Negócio e monetização", sub: "Modelo, margem, caixa e ciclo comercial",
    tip: "Desenhe o modelo de negócio de cada frente, calcule a margem e projete o caixa dos próximos 90 dias." },
  { id: "mercado", short: "Mercado", name: "Posicionamento e mercado", sub: "Problema, diferença, público, concorrência e marca",
    tip: "Escreva a frase de posicionamento, mapeie cinco concorrentes e atualize bio, proposta e apresentação." },
  { id: "canais", short: "Canais", name: "Canais de aquisição", sub: "Funis, ferramentas e conteúdo",
    tip: "Escolha dois canais, defina uma rotina semanal para cada um e conecte as ferramentas para registrar a origem de cada contato." },
  { id: "vendas", short: "Vendas", name: "Vendas", sub: "Processos, time e ferramentas",
    tip: "Padronize a sessão diagnóstico com roteiro, termine sempre com proposta e próximo passo agendado e registre tudo no CRM." },
  { id: "implementacao", short: "Implementação", name: "Implementação", sub: "Plano estratégico, indicadores e hipóteses",
    tip: "Transforme o diagnóstico em um plano com poucas ações, cada uma com dono, prazo, indicador e hipótese." },
  { id: "analises", short: "Análises", name: "Análises e otimizações", sub: "Mensuração e ajustes",
    tip: "Compare os números com as hipóteses, ache a etapa com maior perda e teste uma mudança por vez." },
  { id: "resultados", short: "Resultados", name: "Resultados e sequência", sub: "Análises finais, ampliação e finalização",
    tip: "Compare o início com o fim, amplie o que deu certo e escreva o plano dos próximos 30 dias." }
];

/* Notas por segmento: cada seção reaproveita a nota do tema mais próximo (as novas seções de análise e implementação não têm nota) */
var NOTE_MAP = { negocio: "produto", mercado: "posicionamento", canais: "canais", vendas: "vendas", resultados: "expansao" };

/* ---------- Playbook: uma seção para cada área do roadmap ---------- */
var PLAYBOOK = {
  negocio: {
    title: "Entenda como o seu negócio ganha dinheiro antes de vender mais",
    intro: [
      "Vender mais só ajuda quando cada venda deixa margem e o caixa aguenta o ritmo. Esta é a base do guia: enxergar o modelo de negócio, a margem de cada serviço, o caixa e o tempo entre o primeiro contato e o pagamento.",
      "Isso vale para o serviço principal e para a frente de consultoria ou mentoria. Cada uma tem custos, preço e ciclo comercial próprios. Crescer sem esses números claros aumenta o trabalho e não aumenta o lucro."
    ],
    cardsTitle: "Os quatro pontos do negócio",
    cards: [
      { t: "Modelo de negócio", p: "Quem paga, por qual motivo e de que forma: projeto, recorrência, honorário por êxito ou mentoria." },
      { t: "Margem", p: "O que sobra de cada serviço depois do seu tempo, da equipe e dos custos diretos. É a base do preço." },
      { t: "Caixa", p: "Quando o dinheiro entra e quando sai, para saber quanto você pode investir em crescimento sem aperto." },
      { t: "Ciclo comercial", p: "Quantos dias passam entre o primeiro contato e o pagamento, etapa por etapa, para achar onde a venda trava." }
    ],
    actions: [
      { w: "Semana 1", t: "Desenhe o modelo de negócio de cada frente (serviço principal e consultoria ou mentoria) em uma página: cliente, oferta, preço e forma de pagamento." },
      { w: "Semana 1", t: "Calcule a margem de cada serviço considerando o seu tempo e os custos diretos." },
      { w: "Semana 1", t: "Monte uma projeção simples de caixa para os próximos 90 dias." },
      { w: "Semana 1", t: "Registre o ciclo comercial das últimas vendas, do primeiro contato ao pagamento." }
    ],
    errors: ["Definir o preço pelas horas e ignorar o valor do resultado.", "Investir em marketing sem conhecer a margem de cada serviço.", "Ignorar o caixa e depender de um único grande cliente."]
  },
  mercado: {
    title: "Mostre ao cliente por que escolher você",
    intro: [
      "Quem contrata um serviço de alto valor compara alternativas antes de decidir. Posicionamento é a resposta clara para \"por que contratar você?\", apoiada no problema que você resolve, no público que atende e no que você faz de diferente.",
      "Olhar para o mercado ajuda a escolher onde competir: quem são os concorrentes, o que eles prometem e quais inovações mudam a decisão de compra. A marca reúne tudo isso e precisa soar igual no serviço principal e na consultoria ou mentoria."
    ],
    formula: "Ajudo [público] a [resultado] em [prazo], com [método].",
    cardsTitle: "O que sustenta o posicionamento",
    cards: [
      { t: "Problem-solving", p: "O problema que o cliente reconhece, nas palavras dele, e o custo de continuar com ele." },
      { t: "Diferenciação", p: "A prática ou o método que só você faz desse jeito e por que isso gera melhor resultado." },
      { t: "Público-alvo", p: "Quem é o cliente ideal, em que momento está e qual gatilho o faz procurar ajuda." },
      { t: "Inovações", p: "Tecnologias, formatos e práticas novas do seu mercado que mudam o que o cliente espera." },
      { t: "Concorrência", p: "Quem disputa a mesma decisão, como se posiciona e onde existe espaço para você." },
      { t: "Marca", p: "Nome, discurso e provas repetidos do mesmo jeito no perfil, na proposta e na conversa de venda." }
    ],
    actions: [
      { w: "Semana 1", t: "Escreva a frase de posicionamento com a fórmula e peça a três pessoas para repeti-la com as palavras delas." },
      { w: "Semana 1", t: "Liste cinco concorrentes ou alternativas e anote como cada um se posiciona." },
      { w: "Semana 1", t: "Converse com cinco clientes para entender por que escolheram você e quais alternativas consideraram." },
      { w: "Semana 1", t: "Atualize bio, LinkedIn, proposta e apresentação com a frase e três provas." }
    ],
    errors: ["Descrever-se pelo cargo e pela lista de serviços.", "Copiar o posicionamento de um concorrente.", "Mudar a frase toda semana e confundir o mercado."]
  },
  canais: {
    title: "Gerar, converter e monetizar demanda",
    intro: [
      "O método Máquina de Receita organiza a aquisição em três funis. Cada funil tem ações próprias, e você não precisa de todas ao mesmo tempo. Dois canais bem executados valem mais que seis abandonados.",
      "As ferramentas (página, CRM, e-mail e WhatsApp) sustentam os funis, e o conteúdo é o combustível: cada peça fala de um problema do cliente e termina em uma chamada para ação. Os mesmos canais podem alimentar o serviço principal e a frente de consultoria ou mentoria."
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
      { w: "Semana 1", t: "Liste as ferramentas de cada funil e conecte-as para registrar a origem de cada contato." },
      { w: "Semana 1", t: "Defina três temas de conteúdo baseados nos problemas que o seu cliente ideal reconhece." }
    ],
    errors: ["Abrir muitos canais ao mesmo tempo.", "Publicar sem uma chamada para ação.", "Medir curtida em vez de conversa qualificada."]
  },
  vendas: {
    title: "Uma sessão diagnóstico que termina em decisão",
    intro: [
      "Alta performance em vendas vem de processo, e não de talento natural. Em serviços de ticket alto, vence quem conduz a conversa com perguntas, mostra o custo do problema e fecha o próximo passo na hora.",
      "A sessão diagnóstico é o coração da venda, seja ela de um procedimento, de um projeto ou de uma consultoria. Quando existe time comercial, todos seguem o mesmo roteiro. As ferramentas (CRM, modelo de proposta e agenda) tiram o trabalho manual e evitam que uma oportunidade fique parada."
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
      { w: "Semana 1", t: "Escreva o roteiro da sessão com as perguntas de cada etapa." },
      { w: "Semana 1", t: "Crie um modelo de proposta de uma página que você consiga enviar em até 24 horas." },
      { w: "Semana 1", t: "Defina quem faz o quê no processo comercial e registre cada oportunidade no CRM, com etapa e próxima ação." },
      { w: "Semana 1", t: "Monte a cadência de follow-up: mensagem em 1 dia, 3 dias e 7 dias, com prova, resposta às objeções e data de decisão." }
    ],
    errors: ["Apresentar o método antes de entender o problema.", "Mandar a proposta dias depois da conversa.", "Esperar o cliente voltar sem data combinada."]
  },
  implementacao: {
    title: "Coloque o plano no ar com metas e hipóteses claras",
    intro: [
      "Na semana 2 o plano sai do papel. O plano estratégico reúne as ações das quatro frentes da semana 1, com responsável, prazo e o resultado esperado de cada uma.",
      "Cada ação nasce de uma hipótese (\"se eu fizer isso, espero aquele resultado\") e de um indicador que mostra se ela funcionou. Assim, o que der certo é ampliado e o que não der certo é ajustado com rapidez."
    ],
    cardsTitle: "Os três elementos da implementação",
    cards: [
      { t: "Plano estratégico", p: "Ações priorizadas por impacto e esforço, cada uma com dono, prazo e entrega." },
      { t: "Indicadores", p: "Poucos números na mesma tela: conversas, sessões diagnóstico, propostas, fechamentos e receita." },
      { t: "Hipóteses", p: "Cada ação com uma aposta escrita: o que você espera que aconteça e quando vai medir." }
    ],
    actions: [
      { w: "Semana 2", t: "Transforme o diagnóstico da semana 1 em um plano com poucas ações, cada uma com dono e prazo." },
      { w: "Semana 2", t: "Escolha cinco indicadores e crie o painel que você abre toda segunda-feira." },
      { w: "Semana 2", t: "Escreva uma hipótese para cada ação e a data em que vai avaliá-la." },
      { w: "Semana 2", t: "Coloque as ações no ar e registre o que foi feito em cada dia." }
    ],
    errors: ["Plano com ações demais e nenhuma terminada.", "Indicadores sem dono e sem rotina de leitura.", "Executar sem escrever a hipótese e depois não saber o que aprendeu."]
  },
  analises: {
    title: "Leia os números e ajuste o que importa",
    intro: [
      "A semana 3 serve para aprender com os primeiros resultados. Mensurar é comparar o que aconteceu com a hipótese e entender o motivo, olhando cada etapa do caminho do contato até a venda.",
      "A otimização acontece onde o número mostra a perda: um canal que gera conversa e nenhuma sessão, uma proposta que não vira decisão, um follow-up que não acontece. Ajuste uma coisa por vez para saber o que funcionou."
    ],
    cardsTitle: "O ciclo de otimização",
    cards: [
      { t: "1. Mensurar", p: "Reúna os números de cada etapa: contatos, conversas, sessões, propostas e fechamentos." },
      { t: "2. Diagnosticar", p: "Compare com as hipóteses e encontre a etapa em que a maior parte das pessoas se perde." },
      { t: "3. Otimizar", p: "Mude uma variável por vez (mensagem, oferta, página ou roteiro) e acompanhe o efeito." },
      { t: "4. Decidir", p: "Amplie o que funcionou, ajuste o que ficou no meio do caminho e pause o que não gerou resultado." }
    ],
    actions: [
      { w: "Semana 3", t: "Reúna os números da semana 2 no painel e compare com as hipóteses." },
      { w: "Semana 3", t: "Identifique a etapa do funil com maior perda e escolha uma mudança para testar." },
      { w: "Semana 3", t: "Aumente o volume no canal que mais gerou sessões e pause o que não gerou conversas." },
      { w: "Semana 3", t: "Revise as propostas abertas e registre o motivo de cada perda." }
    ],
    errors: ["Mudar várias coisas ao mesmo tempo e não saber o que funcionou.", "Medir curtida e alcance em vez de conversas e vendas.", "Decidir pela sensação do momento e não pelos números."]
  },
  resultados: {
    title: "Feche o ciclo e planeje o que vem depois",
    intro: [
      "Na semana 4 você consolida o que aprendeu. As análises finais comparam o ponto de partida com o resultado em receita, margem, conversas e fechamentos, e mostram o que gerou retorno.",
      "O que deu certo é ampliado com mais volume, mais canais ou uma oferta de continuidade. A finalização registra o processo em um documento simples e define o plano dos próximos 30 dias, para o serviço principal e para a frente de consultoria ou mentoria."
    ],
    cardsTitle: "As etapas de fechamento",
    cards: [
      { t: "Análises finais", p: "Compare o início e o fim com os mesmos indicadores definidos na semana 2." },
      { t: "Ampliar o que deu certo", p: "Dê mais volume e rotina aos canais e às ofertas de melhor retorno e peça indicação aos clientes satisfeitos." },
      { t: "Finalização", p: "Documente o processo, os aprendizados e os modelos usados (roteiros, propostas e cadência)." },
      { t: "Sequência", p: "Defina metas e ações dos próximos 30 dias e a oferta de continuidade para os clientes." }
    ],
    actions: [
      { w: "Semana 4", t: "Monte o comparativo do início e do fim com os indicadores definidos." },
      { w: "Semana 4", t: "Escolha os dois ganhos mais claros e planeje como ampliá-los." },
      { w: "Semana 4", t: "Peça indicação aos clientes que viram resultado e apresente a oferta de continuidade." },
      { w: "Semana 4", t: "Documente o processo e escreva o plano dos próximos 30 dias." }
    ],
    errors: ["Encerrar o ciclo sem registrar o que foi aprendido.", "Ampliar tudo ao mesmo tempo em vez de focar no que deu retorno.", "Pedir indicação antes de o cliente ver resultado."]
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
  // Google Forms (respostas gravadas na planilha "[GS GROWTH] leads-guia-growth-30D"). Vazio = não envia
  gtmId: "",               // ID do contêiner do Google Tag Manager (ex.: "GTM-XXXXXXX"). Vazio = não carrega
  leadEndpoint: "https://docs.google.com/forms/d/e/1FAIpQLSf7K-fnfHxo8OGYD715wdvWaF0r1p61pyV3kAbxDS8_Pd_n6w/formResponse",
  formFields: { etapa: "entry.176202070", origem: "entry.1587842509", nome: "entry.598034783", email: "entry.362575635", whatsapp: "entry.745510118", pagina: "entry.722341163", segmento: "entry.1739758473", porte: "entry.1257151820", estagio: "entry.1229289482", jornada: "entry.1355015536", consentimento: "entry.748315144", investe: "entry.1475592940" },
  origem: "guia-growth-30d",
  storageKey: "g30d-v3",
  scrollToAsk: 260         // quantos pixels de rolagem depois de abrir uma área até pedir o cadastro
};

/* Tipo de infográfico de cada área */
var INFO = { negocio: "flow", mercado: "formula", canais: "funnels", vendas: "flow", implementacao: "flow", analises: "flow", resultados: "flow" };

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
  var segNote = (sg && sg.notes[NOTE_MAP[a.id]]) ? '<p class="ar__seg"><b>No seu segmento (' + esc(sg.label) + ')</b>' + esc(sg.notes[NOTE_MAP[a.id]]) + '</p>' : "";
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
  { w: "Semana 1", t: "Diagnóstico e estratégia", areas: ["negocio", "mercado", "canais", "vendas"] },
  { w: "Semana 2", t: "Colocar o plano no ar", areas: ["implementacao"] },
  { w: "Semana 3", t: "Aprender e ajustar", areas: ["analises"] },
  { w: "Semana 4", t: "Fechar e ampliar", areas: ["resultados"] }
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

/* ---------- mockup 3D de iPad (fica visível da tela 1 até a última pergunta) ---------- */
function ipadHtml() {
  var rows = WEEKS.map(function (W, i) {
    var chips = W.areas.map(function (id) { return '<i>' + esc(area(id).name) + '</i>'; }).join("");
    return '<li class="ip-w' + (i + 1) + '"><b>' + esc(W.w) + '</b><span>' + chips + '</span></li>';
  }).join("");
  return '<div class="ipad-stage" id="gmMock" aria-hidden="true"><div class="ipad"><div class="ipad__body">' +
    '<span class="ipad__cam"></span><div class="ipad__screen">' +
    '<div class="ip-top"><span>Guia Growth 30D</span><em>PDF</em></div>' +
    '<p class="ip-k">Material gratuito</p><p class="ip-h">Seu roadmap de 4 semanas</p>' +
    '<ol class="ip-list">' + rows + '</ol>' +
    '<div class="ip-cta">Agendar Sessão Diagnóstico</div></div>' +
    '<span class="ipad__shine"></span></div></div><span class="ipad-glow"></span></div>';
}

/* ---------- tela 1: abertura (H1 e H2), avança com clique ou em 3 segundos ---------- */
function previewHtml() {
  return '<div class="gm-screen gm-screen--intro"><p class="eyebrow">Guia Growth 30D</p>' +
    '<h2 class="gm-h1" tabindex="-1">Posts e leads não pagam a sua conta. <span class="text-orange">Venda mais serviços high-ticket em 30 dias</span> com o Guia&nbsp;Growth&nbsp;30D.</h2>' +
    '<p class="gm-h2">Confira erros comuns para evitar e ações de growth para escalar vendas do seu serviço high-ticket e/ou consultoria em 4 semanas!</p>' +
    '<button type="button" class="btn btn--primary pv-go" data-pv-next>Acessar guia gratuito</button>' +
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
  if (k === "whatsapp") { return phoneOk(v) ? "" : "Informe um WhatsApp com DDD (aceita +55)."; }
  if (k === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Informe um e-mail válido.";
  return "";
}
function maskBr(d) {
  d = d.slice(0, 11);
  if (d.length > 6) return "(" + d.slice(0, 2) + ") " + d.slice(2, d.length > 10 ? 7 : 6) + "-" + d.slice(d.length > 10 ? 7 : 6);
  if (d.length > 2) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length > 0) return "(" + d;
  return "";
}
/* Aceita número nacional ("(19) 99887-8022") e com código do país ("+55 (19) 99887-8022") */
function maskPhone(v) {
  v = String(v);
  var d = v.replace(/[^0-9]/g, "");
  if (v.trim().charAt(0) === "+") {
    if (d.slice(0, 2) === "55") return "+55" + (d.length > 2 ? " " + maskBr(d.slice(2)) : "");
    return "+" + d.slice(0, 15);   // outros países: só dígitos
  }
  return maskBr(d);
}
function phoneOk(v) {
  var d = String(v).replace(/[^0-9]/g, "");
  if (String(v).trim().charAt(0) === "+") return d.slice(0, 2) === "55" ? (d.length === 12 || d.length === 13) : (d.length >= 8 && d.length <= 15);
  return d.length === 10 || d.length === 11;
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
  var main = $("gmMain");
  if (!pb && main && $("gmMock")) {   // o mockup se mantém: só o conteúdo ao lado dele muda
    main.innerHTML = screenHtml();
    views.guia.querySelector(".gm-steps").innerHTML = stepsHtml();
    $("gmScroll").scrollTop = 0;
    afterShell();
    return;
  }
  views.guia.innerHTML =
    '<div class="gm-backdrop" data-gm-close></div>' +
    '<div class="gm" role="dialog" aria-modal="true" aria-label="Guia Growth 30D">' +
    '<div class="gm-bar"><div class="gm-steps" aria-hidden="true">' + stepsHtml() + '</div>' +
    '<div class="gm-actions">' + (state.lead ? '<button type="button" class="gj-reset" data-reset>Recomeçar</button>' : "") +
    '<button type="button" class="gm-x" data-gm-close aria-label="Fechar o guia">×</button></div></div>' +
    '<div class="gm-scroll" id="gmScroll">' + (pb ? screenHtml() : '<div class="gm-split">' + ipadHtml() + '<div class="gm-main" id="gmMain">' + screenHtml() + '</div></div>') + '</div>' +
    (pb ? '<div class="gm-foot"><a class="btn btn--primary" id="ctaWa" href="' + esc(waUrl()) + '" target="_blank" rel="noopener">Agendar Sessão Diagnóstico</a></div>' : "") +
    '</div>';
  afterShell();
}

function afterShell() {
  updateWaLinks();
  var inp = $("q-in");
  if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 60);
  else { var h = views.guia.querySelector(".gj-title"); if (h) h.focus({ preventScroll: true }); }
  if (ui.screen === "preview") ui.timer = setTimeout(function () { if (ui.screen === "preview" && current === "guia") goScreen("lead"); }, 3000);
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

  if (e.target.closest(".gm-screen--intro")) { goScreen("lead"); return; }

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
