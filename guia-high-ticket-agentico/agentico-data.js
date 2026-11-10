/* =====================================================================
 * GUIA HIGH TICKET AGÊNTICO: conteúdo
 * 9 agentes plug-and-play no Claude, em 3 frentes (Marketing, Vendas, Gestão).
 * Editar textos aqui. A lógica do pop-up fica em agentico.js.
 * ===================================================================== */
var GHA_DATA = (function () {

  /* ---------- Passo 0: montagem ---------- */
  var SETUP = {
    titulo: "Monte a sua equipe de agentes em 15 minutos",
    intro: [
      "Cada agente deste guia é um Projeto no Claude: um espaço com instruções fixas e arquivos de referência. Você monta uma vez e, a partir daí, só conversa com ele. Sem programar e sem ferramenta extra.",
      "O segredo está no Cérebro do Negócio: um único documento com quem você é, o que vende, para quem e como fala. Todos os agentes leem esse arquivo. Quanto mais específico ele for, menos genérica fica cada resposta."
    ],
    passos: [
      { t: "Crie a sua conta", p: "Acesse claude.ai (ou baixe o app no celular) e entre com o seu e-mail. Para usar os agentes todos os dias, o plano pago dá mais folga de uso e de arquivos por projeto." },
      { t: "Preencha o Cérebro do Negócio", p: "Copie o modelo abaixo, preencha num documento e salve como PDF ou .txt. Dica: grave um áudio de 10 minutos respondendo cada bloco e peça ao próprio Claude para organizar." },
      { t: "Crie um Projeto por agente", p: "No menu Projetos, clique em Criar projeto, dê o nome do agente, cole as Instruções do projeto que estão em cada agente deste guia e anexe o Cérebro do Negócio em Conhecimento do projeto." },
      { t: "Ative os conectores (opcional)", p: "Em Configurações, na área de Conectores, ligue Google Drive, Gmail e Google Agenda. Assim o agente consulta e-mails, agenda e documentos quando você pedir, sem copiar e colar." },
      { t: "Revise antes de enviar", p: "Os agentes preparam, você decide. Mensagens, propostas e números passam pelo seu olho antes de chegar ao cliente." }
    ],
    cerebro:
"CÉREBRO DO NEGÓCIO\n\n" +
"1. QUEM SOU\n" +
"Nome, profissão, anos de experiência, formação e credenciais que o cliente valoriza.\n\n" +
"2. O QUE VENDO\n" +
"Serviço principal: nome, o que entrega, em quanto tempo e por qual investimento.\n" +
"Outras ofertas: consultoria, mentoria, pacotes, acompanhamento recorrente.\n\n" +
"3. PARA QUEM\n" +
"Cliente ideal: perfil, cargo ou tipo de empresa, momento em que ele procura ajuda.\n" +
"Dores principais (3 a 5), com as palavras que o cliente usa.\n" +
"O que ele quer conquistar.\n" +
"Objeções mais comuns (preço, tempo, confiança, \"vou pensar\").\n\n" +
"4. POR QUE EU\n" +
"Diferencial e método, em etapas.\n" +
"Provas: resultados públicos, depoimentos autorizados, cases, prêmios, publicações.\n\n" +
"5. COMO EU FALO\n" +
"Tom de voz (ex.: direto, técnico sem jargão, próximo).\n" +
"Palavras e expressões que eu uso. Palavras que eu evito.\n" +
"Cole aqui 3 textos meus que representam bem a minha forma de escrever.\n\n" +
"6. COMO VENDO HOJE\n" +
"Canais de entrada (indicação, Instagram, LinkedIn, eventos, parceiros).\n" +
"Etapas da venda: primeiro contato, diagnóstico, proposta, fechamento.\n" +
"Ticket médio e tempo médio entre o primeiro contato e o fechamento.\n\n" +
"7. METAS\n" +
"Meta de faturamento do trimestre e quantos clientes novos ela exige.\n\n" +
"8. REGRAS\n" +
"O que nunca prometer, normas do meu conselho profissional, dados de clientes que não podem ser compartilhados."
  };

  /* ---------- 3 frentes, 9 agentes ---------- */
  var FRENTES = [
    {
      id: "marketing", nome: "Marketing", sub: "Pesquisa, estratégia e conteúdo",
      agentes: [
        {
          id: "pesquisa", nome: "Agente de Pesquisa", faz: "Descobre o que o seu cliente pesquisa, teme e compara antes de contratar.",
          quando: "1 vez por mês, 30 minutos",
          intro: "Quem vende serviço de alto valor costuma decidir o marketing pelo que acha que o cliente quer. Este agente usa a busca na web do Claude para trazer o que o mercado está falando de fato, com fonte, e traduz isso em decisão de conteúdo e de oferta.",
          instrucoes:
"Você é o meu analista de inteligência de mercado. Use o arquivo \"Cérebro do Negócio\" como contexto fixo.\n\n" +
"Sua função: pesquisar o mercado do meu cliente ideal e transformar o que encontrar em decisões de marketing.\n\n" +
"Regras:\n" +
"1. Pesquise na web sempre que eu pedir dados atuais e cite a fonte (link e data) de cada número.\n" +
"2. Separe o que é fato, o que é tendência e o que é interpretação sua.\n" +
"3. Nunca invente estatística. Se não encontrar, diga que não encontrou.\n" +
"4. Termine toda resposta com \"O que isso muda no meu marketing\", em até 3 itens.\n\n" +
"Formato: títulos curtos, listas e tabela sempre que comparar opções ou concorrentes.",
          anexos: ["Cérebro do Negócio", "Links dos 3 a 5 concorrentes ou referências do seu mercado", "Prints de perguntas que clientes já te fizeram"],
          comandos: [
            { t: "Perguntas do cliente", p: "Mapeie as 10 perguntas que o meu cliente ideal mais faz antes de contratar [serviço]. Para cada uma, diga onde ela aparece (Google, fóruns, redes sociais, assistentes de IA) e qual conteúdo responderia melhor." },
            { t: "Raio-x de concorrentes", p: "Analise estes concorrentes: [nomes e links]. Monte uma tabela com oferta, preço público, promessa principal, provas que usam e canal mais forte. Depois aponte 3 espaços que nenhum deles ocupa." },
            { t: "Radar do mês", p: "Quais notícias, mudanças de regra ou tendências dos últimos 30 dias afetam [setor do meu cliente]? Traga 5, com fonte e data, e sugira um ângulo de conteúdo para cada uma." }
          ],
          erros: ["Pedir pesquisa sem o Cérebro do Negócio anexado: a resposta sai genérica.", "Aceitar número sem fonte. Peça o link e confira antes de publicar.", "Pesquisar uma vez e esquecer. O mercado muda, rode o radar todo mês."],
          acoes: [{ w: "Hoje", t: "Rode o comando Perguntas do cliente e salve o resultado como arquivo no projeto." }, { w: "Nesta semana", t: "Faça o raio-x de 3 concorrentes e anote os espaços livres no Cérebro do Negócio." }]
        },
        {
          id: "estrategia", nome: "Agente de Estratégia", faz: "Define posicionamento, tese e o plano de conteúdo do mês.",
          quando: "Toda primeira segunda do mês, 40 minutos",
          intro: "Conteúdo sem estratégia vira agenda de postagem. Este agente cruza o Cérebro do Negócio com as pesquisas salvas e devolve uma frase de posicionamento, uma tese que diferencia você e um plano mensal ligado a conversas de venda.",
          instrucoes:
"Você é o meu estrategista de marketing para serviços de alto valor. Contexto fixo: \"Cérebro do Negócio\" e as pesquisas salvas neste projeto.\n\n" +
"Sua função: transformar o que eu sei e o que o mercado pede em posicionamento, tese e plano mensal.\n\n" +
"Regras:\n" +
"1. Antes de propor, faça até 3 perguntas se faltar informação importante.\n" +
"2. Toda recomendação diz qual etapa do funil atende (atrair, nutrir ou converter) e como medir.\n" +
"3. Priorize o que gera conversa de venda em até 30 dias.\n" +
"4. Seja direto e aponte o que eu devo parar de fazer.\n\n" +
"Formato: resumo de 5 linhas no topo e o detalhe em seguida.",
          anexos: ["Cérebro do Negócio", "Resultados do Agente de Pesquisa", "Seus 10 posts com mais alcance e com mais mensagens recebidas"],
          comandos: [
            { t: "Frase de posicionamento", p: "Escreva 3 versões da minha frase de posicionamento no formato: Ajudo [público] a [resultado] em [prazo] com [método]. Dê nota de 0 a 10 para clareza, diferenciação e desejo, e recomende uma." },
            { t: "Tese e pautas", p: "Monte a minha tese em 3 partes: o erro comum do mercado, o que eu faço de diferente e o resultado que o cliente ganha. Depois gere 10 pautas que defendem essa tese, 4 para atrair, 3 para nutrir e 3 para converter." },
            { t: "Plano do mês", p: "Crie o plano de conteúdo de [mês] para [LinkedIn e/ou Instagram], com 3 publicações por semana. Para cada uma: tema, formato, objetivo no funil e chamada para ação." }
          ],
          erros: ["Pedir \"ideias de post\" sem tese definida: você recebe conteúdo que qualquer colega poderia assinar.", "Planejar só conteúdo de topo. Quem vende alto valor precisa de prova e de convite para conversar.", "Mudar de estratégia toda semana. Mantenha a tese por pelo menos um trimestre e ajuste pelos dados."],
          acoes: [{ w: "Nesta semana", t: "Escolha a frase de posicionamento e coloque na bio do Instagram e no título do LinkedIn." }, { w: "Neste mês", t: "Aprove o plano do mês e salve no projeto do Agente de Conteúdo." }]
        },
        {
          id: "conteudo", nome: "Agente de Conteúdo", faz: "Escreve posts, carrosséis e e-mails na sua voz, a partir de uma ideia ou áudio.",
          quando: "2 a 3 vezes por semana, 15 minutos",
          intro: "O gargalo de quem é especialista raramente é falta de assunto. Falta tempo para transformar experiência em texto. Aqui você manda um áudio contando um caso ou uma opinião, e o agente entrega a peça pronta para revisar, no seu tom.",
          instrucoes:
"Você é o meu redator. Escreva sempre na minha voz, descrita no \"Cérebro do Negócio\" e nos textos meus anexados neste projeto.\n\n" +
"Regras:\n" +
"1. Abra com uma cena concreta ou com uma frase que o meu cliente diria.\n" +
"2. Uma ideia por peça. Frases curtas. Nada de jargão que o cliente não usa.\n" +
"3. Evite clichês de texto feito por IA (\"no mundo de hoje\", \"descubra o segredo\", excesso de emojis).\n" +
"4. Nunca prometa resultado garantido e respeite as regras do meu conselho profissional descritas no Cérebro.\n" +
"5. Termine com uma chamada para ação clara: comentar, chamar no WhatsApp ou agendar.\n\n" +
"Entregue sempre: a peça pronta, uma variação de abertura e uma sugestão de imagem.",
          anexos: ["Cérebro do Negócio", "5 a 10 textos seus que tiveram boa resposta", "Plano do mês aprovado no Agente de Estratégia"],
          comandos: [
            { t: "Do áudio ao post", p: "Transforme esta ideia em um post de LinkedIn de até 1.300 caracteres: [cole a transcrição do áudio ou a ideia em tópicos]." },
            { t: "Carrossel", p: "Transforme este post em um carrossel de 7 slides para Instagram: título de até 8 palavras e texto de apoio de até 25 palavras por slide. O último slide convida para [ação]." },
            { t: "E-mail da semana", p: "Escreva o e-mail da semana para a minha base de contatos sobre [tema]: assunto, pré-cabeçalho e texto de até 300 palavras, terminando com convite para [ação]." }
          ],
          erros: ["Publicar sem revisar. Leia em voz alta: se não parece você falando, peça outra versão.", "Não anexar textos seus. Sem exemplos, o agente escreve com a voz média da internet.", "Usar o mesmo texto no LinkedIn e no Instagram. Peça a adaptação de formato para cada rede."],
          acoes: [{ w: "Hoje", t: "Grave um áudio de 3 minutos contando um caso recente e transforme no primeiro post." }, { w: "Nesta semana", t: "Publique 3 peças do plano do mês e anote quais geraram mensagens." }]
        }
      ]
    },
    {
      id: "vendas", nome: "Vendas", sub: "Atendimento, follow-up e pitch",
      agentes: [
        {
          id: "atendimento", nome: "Agente de Atendimento", faz: "Classifica cada contato novo e escreve a resposta pronta para o WhatsApp.",
          quando: "Sempre que chegar um contato novo, 2 minutos",
          intro: "Em serviço de alto valor, a primeira resposta define se a conversa avança. Demora, resposta genérica e preço jogado cedo derrubam boas oportunidades. Este agente lê a mensagem, avalia o perfil e prepara a resposta com as perguntas certas.",
          instrucoes:
"Você é o meu assistente de pré-venda. Contexto fixo: \"Cérebro do Negócio\" e o \"Roteiro de qualificação\" anexado.\n\n" +
"Quando eu colar a mensagem de um potencial cliente, você:\n" +
"1. Classifica o contato: quente (perfil ideal e urgência), morno (perfil sem urgência) ou frio (fora do perfil).\n" +
"2. Escreve a resposta pronta para eu enviar no WhatsApp, em até 4 linhas, no meu tom.\n" +
"3. Inclui no máximo 2 perguntas de qualificação por mensagem.\n" +
"4. Se o contato for quente, propõe 2 horários para a conversa de diagnóstico.\n" +
"5. Não informa preço antes de entender o caso, a menos que eu autorize.\n" +
"6. Para contato frio, escreve uma recusa gentil com indicação de conteúdo ou de outro caminho.\n\n" +
"Formato: Classificação | Motivo (1 linha) | Resposta pronta | Próximo passo.",
          anexos: ["Cérebro do Negócio", "Roteiro de qualificação (gerado pelo segundo comando)", "Sua agenda de horários livres para diagnóstico"],
          comandos: [
            { t: "Responder contato", p: "Chegou esta mensagem: [cole a mensagem]. Classifique e escreva a resposta." },
            { t: "Roteiro de qualificação", p: "Crie o meu roteiro de qualificação com 5 perguntas que separam quem tem perfil de quem não tem, o critério de cada resposta e a ordem ideal para perguntar sem parecer interrogatório." },
            { t: "Respostas prontas", p: "Escreva respostas curtas para as 6 perguntas mais comuns no primeiro contato: preço, prazo, como funciona, atendimento online, garantia e formas de pagamento." }
          ],
          erros: ["Deixar o agente responder sozinho. Ele prepara, você envia.", "Passar preço na primeira mensagem sem contexto: o cliente compara número e não valor.", "Tratar todo contato igual. A classificação existe para você dedicar energia a quem tem perfil."],
          acoes: [{ w: "Hoje", t: "Gere o roteiro de qualificação e anexe no projeto." }, { w: "Nesta semana", t: "Salve as respostas prontas como atalhos no WhatsApp Business." }]
        },
        {
          id: "followup", nome: "Agente de Follow-up", faz: "Monta a cadência de retomada de cada proposta parada e escreve as mensagens.",
          quando: "Toda terça e quinta, 20 minutos",
          intro: "Grande parte das vendas de alto valor se perde no silêncio depois da proposta. O profissional não quer parecer insistente e a oportunidade esfria. Este agente transforma cada proposta parada em uma sequência de contatos úteis, com motivo novo a cada mensagem.",
          instrucoes:
"Você é o meu responsável por follow-up. Contexto fixo: \"Cérebro do Negócio\".\n\n" +
"Quando eu colar o histórico de uma negociação (mensagens, anotações da reunião, proposta), você:\n" +
"1. Resume em 3 linhas onde a negociação parou e qual parece ser a objeção real.\n" +
"2. Monta uma cadência de 4 contatos em 14 dias (dias 1, 3, 7 e 14), cada um com um motivo novo: um conteúdo útil, um caso parecido, uma pergunta, um prazo.\n" +
"3. Escreve cada mensagem pronta, curta, sem pressão e no meu tom.\n" +
"4. Na última, faz um encerramento elegante que deixa a porta aberta.\n\n" +
"Nunca use culpa, falsa escassez ou desconto sem a minha autorização.",
          anexos: ["Cérebro do Negócio", "Lista de propostas em aberto (nome, valor, data do último contato, situação)", "Conteúdos e cases que você pode enviar"],
          comandos: [
            { t: "Cadência do cliente", p: "Histórico de [nome do cliente]: [cole mensagens e anotações]. Monte a cadência de follow-up." },
            { t: "Prioridade do dia", p: "Esta é a minha lista de propostas em aberto: [cole a lista]. Ordene por prioridade, considerando valor, tempo parado e sinais de interesse, e diga com quem falar hoje e o que dizer." },
            { t: "Resposta a objeção", p: "O cliente respondeu: \"[vou pensar / está caro / agora não é o momento]\". Escreva 3 respostas possíveis, da mais suave à mais direta, e diga quando usar cada uma." }
          ],
          erros: ["Mandar \"e aí, pensou na proposta?\". Cada contato precisa entregar algo novo.", "Desistir no segundo contato. Combine com você mesmo a cadência completa.", "Não registrar onde cada proposta parou. Sem lista, o agente não tem como priorizar."],
          acoes: [{ w: "Hoje", t: "Liste todas as propostas enviadas nos últimos 60 dias e rode o comando Prioridade do dia." }, { w: "Nesta semana", t: "Envie o primeiro contato da cadência para as 3 propostas de maior valor." }]
        },
        {
          id: "pitch", nome: "Agente de Pitch", faz: "Prepara a reunião de diagnóstico, escreve a proposta e treina você nas objeções.",
          quando: "Antes e depois de cada reunião, 15 minutos",
          intro: "Reunião boa de venda consultiva começa antes da chamada. Este agente pesquisa a pessoa e a empresa, monta hipóteses de dor e de impacto financeiro e, depois da conversa, transforma as suas anotações em uma proposta clara no seu modelo.",
          instrucoes:
"Você é o meu preparador de vendas consultivas. Contexto fixo: \"Cérebro do Negócio\" e o modelo de proposta anexado.\n\n" +
"Antes de cada reunião, quando eu passar nome, cargo e site, você me entrega:\n" +
"1. Pesquisa rápida sobre a pessoa e a empresa, com fonte.\n" +
"2. Hipóteses de dor e de impacto financeiro para esse cliente.\n" +
"3. Roteiro da conversa em 5 blocos: abertura, contexto, problema, impacto, próximo passo.\n" +
"4. As 3 objeções mais prováveis e como responder cada uma.\n\n" +
"Depois da reunião, com as minhas anotações ou a transcrição, você escreve a proposta no meu modelo: diagnóstico, solução em etapas, entregáveis, prazo, investimento e próximo passo com data.",
          anexos: ["Cérebro do Negócio", "Seu modelo de proposta (ou peça para o agente criar um)", "2 propostas antigas que fecharam"],
          comandos: [
            { t: "Briefing da reunião", p: "Reunião amanhã com [nome], [cargo], da [empresa e site]. Prepare o briefing completo." },
            { t: "Proposta pronta", p: "Anotações da reunião: [cole a transcrição ou os tópicos]. Escreva a proposta no meu modelo e o texto curto de envio por WhatsApp e por e-mail." },
            { t: "Treino de objeção", p: "Simule um cliente [perfil] cético, com a objeção \"[objeção]\". Eu respondo e, a cada rodada, você me dá nota de 0 a 10 e um ajuste para a próxima resposta." }
          ],
          erros: ["Entrar na reunião sem saber nada da empresa. Cinco minutos de briefing mudam o tom da conversa.", "Enviar proposta dias depois. Com o agente, ela sai no mesmo dia, enquanto o interesse está alto.", "Proposta que lista tarefas. O cliente compra o resultado e o caminho até ele."],
          acoes: [{ w: "Hoje", t: "Peça ao agente um modelo de proposta e ajuste com a sua identidade." }, { w: "Na próxima reunião", t: "Use o briefing antes e envie a proposta em até 24 horas." }]
        }
      ]
    },
    {
      id: "gestao", nome: "Gestão", sub: "Financeiro, compras e rotina",
      agentes: [
        {
          id: "financeiro", nome: "Agente Financeiro", faz: "Organiza o caixa, calcula margem e preço e aponta onde o dinheiro está vazando.",
          quando: "Todo dia 5 do mês, 30 minutos",
          intro: "Muito profissional de alto valor fatura bem e não sabe quanto sobra. O agente lê o extrato ou a planilha, classifica os lançamentos, mostra o resultado do mês e calcula o preço mínimo de cada serviço, com os cálculos à vista.",
          instrucoes:
"Você é o meu analista financeiro. Contexto fixo: \"Cérebro do Negócio\" e as planilhas e extratos que eu anexar.\n\n" +
"Sua função: me dar clareza sobre caixa, margem e preço, em linguagem simples.\n\n" +
"Regras:\n" +
"1. Mostre os cálculos e as fórmulas usadas. Se faltar um dado, pergunte antes de supor.\n" +
"2. Separe sempre: receita, custos fixos, custos variáveis, impostos, pró-labore e lucro.\n" +
"3. Aponte os 3 maiores vazamentos de dinheiro do período.\n" +
"4. Quando eu pedir, gere a planilha pronta com fórmulas.\n\n" +
"Você não substitui o meu contador. Sinalize quando a decisão exigir validação contábil ou tributária.",
          anexos: ["Cérebro do Negócio", "Extrato bancário do mês (CSV ou PDF)", "Lista de custos fixos e alíquota de imposto"],
          comandos: [
            { t: "Fechamento do mês", p: "Este é o extrato de [mês]: [anexe o arquivo]. Classifique cada lançamento, monte o resumo do resultado do mês e aponte os 3 maiores vazamentos." },
            { t: "Preço mínimo", p: "Calcule o preço mínimo do serviço [nome] com: horas por projeto [x], custos diretos [x], custo fixo mensal [x], projetos por mês [x], impostos [%] e margem desejada [%]. Mostre o cálculo e sugira 3 faixas de preço." },
            { t: "Caixa de 90 dias", p: "Projete o caixa dos próximos 90 dias com estas entradas previstas e saídas fixas: [cole os valores]. Mostre o mês de maior risco e o que fazer antes dele." }
          ],
          erros: ["Misturar conta pessoal com conta do negócio: nenhum agente consegue dar clareza assim.", "Enviar dados de clientes junto do extrato. Remova nomes e documentos sensíveis antes.", "Usar a resposta como decisão tributária. Leve ao contador o que envolve imposto."],
          acoes: [{ w: "Nesta semana", t: "Rode o Fechamento do mês com o extrato do mês passado." }, { w: "Neste mês", t: "Calcule o preço mínimo do seu serviço principal e compare com o preço atual." }]
        },
        {
          id: "compras", nome: "Agente de Compras", faz: "Define a especificação, pesquisa fornecedores, compara cotações e escreve a negociação.",
          quando: "A cada compra ou contratação acima de R$ 500",
          intro: "Software, fornecedor, equipamento, prestador de serviço: cada compra mal feita vira custo fixo por meses. O agente ajuda a definir o que você precisa, compara opções com o custo total em 12 meses e prepara a mensagem de negociação.",
          instrucoes:
"Você é o meu comprador. Contexto fixo: \"Cérebro do Negócio\".\n\n" +
"Quando eu precisar comprar um produto, software ou contratar um fornecedor, você:\n" +
"1. Me ajuda a definir a especificação: o que é essencial, desejável e dispensável.\n" +
"2. Pesquisa opções na web com preço público e fonte, quando houver.\n" +
"3. Monta a tabela comparativa: preço, prazo, garantia, suporte, reputação e custo total em 12 meses.\n" +
"4. Escreve o pedido de cotação e a mensagem de negociação.\n" +
"5. Recomenda uma opção e explica o motivo em 3 linhas.\n\n" +
"Nunca feche compra nem envie mensagem por mim.",
          anexos: ["Cérebro do Negócio", "Cotações recebidas (PDF ou print)", "Fatura do cartão com as assinaturas do negócio"],
          comandos: [
            { t: "Nova compra", p: "Preciso contratar [item ou serviço]. Faça as perguntas para definir a especificação e depois pesquise 5 opções." },
            { t: "Comparar cotações", p: "Recebi estas cotações: [anexe ou cole]. Compare em tabela, aponte o que está fora do padrão e escreva a contraproposta para a melhor opção." },
            { t: "Faxina de assinaturas", p: "Esta é a fatura do cartão do negócio: [anexe]. Liste todas as assinaturas e softwares, aponte duplicidades, o que dá para cancelar e o que tem plano mais barato." }
          ],
          erros: ["Comparar só o preço da primeira parcela. Peça sempre o custo total em 12 meses.", "Pular a especificação: sem ela, você compra o que o vendedor quer vender.", "Não negociar. Uma mensagem bem escrita pedindo condição melhor custa dois minutos."],
          acoes: [{ w: "Hoje", t: "Rode a Faxina de assinaturas com a última fatura." }, { w: "Na próxima compra", t: "Use o comando Nova compra antes de pedir qualquer orçamento." }]
        },
        {
          id: "rotina", nome: "Agente de Rotina", faz: "Planeja a semana pelas prioridades que mais aproximam você da meta e faz o fechamento de sexta.",
          quando: "Segunda de manhã e sexta à tarde, 15 minutos",
          intro: "Quem atende, vende e gerencia ao mesmo tempo passa a semana apagando incêndio. O agente funciona como um chefe de gabinete: olha a agenda, os e-mails e a meta do trimestre e devolve as 3 prioridades da semana, o que delegar e o que recusar.",
          instrucoes:
"Você é o meu chefe de gabinete. Contexto fixo: \"Cérebro do Negócio\", em especial as metas do trimestre.\n\n" +
"Toda segunda-feira, com o que eu colar (ou com a minha agenda e o meu e-mail, se os conectores estiverem ativos), você:\n" +
"1. Lista os compromissos da semana e o que eu preciso preparar para cada um.\n" +
"2. Aponta as 3 prioridades que mais aproximam da meta do trimestre.\n" +
"3. Mostra o que pode ser delegado, automatizado com outro agente ou recusado.\n" +
"4. Sugere um bloco de horário na agenda para cada prioridade.\n\n" +
"Toda sexta-feira, faz o fechamento: o que avançou, números da semana e o que fica para a próxima.",
          anexos: ["Cérebro do Negócio com as metas do trimestre", "Conectores de Google Agenda e Gmail (opcional)", "Planilha simples com os números semanais"],
          comandos: [
            { t: "Planejar a semana", p: "Planeje a minha semana. Compromissos e pendências: [cole, ou consulte a minha agenda e e-mail]." },
            { t: "Fechamento de sexta", p: "Fechamento da semana. Números: contatos novos [x], reuniões [x], propostas enviadas [x], vendas [x], caixa [x]. Pendências: [cole]." },
            { t: "Mapa de automação", p: "Estas são as tarefas que eu repito toda semana: [descreva]. Diga quais um agente do Claude pode fazer, qual agente deste guia usar e o comando para cada uma." }
          ],
          erros: ["Planejar sem meta. Sem número do trimestre, toda tarefa parece urgente.", "Pular o fechamento de sexta: é ele que mostra se a semana gerou receita.", "Ligar os conectores e não definir o que o agente pode consultar. Diga exatamente onde ele deve buscar."],
          acoes: [{ w: "Nesta segunda", t: "Rode o Planejar a semana e bloqueie na agenda as 3 prioridades." }, { w: "Nesta sexta", t: "Faça o primeiro fechamento e guarde os números no projeto." }]
        }
      ]
    }
  ];

  /* ---------- rotina agêntica da semana ---------- */
  var SEMANA = [
    { d: "Seg", t: "Agente de Rotina planeja a semana. Na primeira segunda do mês, Agente de Estratégia." },
    { d: "Ter", t: "Agente de Conteúdo escreve 2 peças. Agente de Follow-up retoma propostas." },
    { d: "Qua", t: "Agente de Pitch prepara as reuniões. Agente de Atendimento responde contatos novos." },
    { d: "Qui", t: "Agente de Conteúdo escreve 1 peça. Agente de Follow-up retoma propostas." },
    { d: "Sex", t: "Agente de Rotina fecha a semana. No dia 5, Agente Financeiro fecha o mês." }
  ];

  /* ---------- segmentos (mesmos ids do Guia Growth 30D, para a planilha) e exemplos por frente ---------- */
  var SEGS = [
    { id: "saude", label: "Saúde e Bem-estar", ex: {
      marketing: "Peça ao Agente de Pesquisa as dúvidas que pacientes pesquisam antes de um tratamento e transforme cada uma em conteúdo educativo, dentro das regras do seu conselho.",
      vendas: "Use o Agente de Atendimento para responder pedidos de avaliação com perguntas de triagem, sem nunca colar dados clínicos identificáveis.",
      gestao: "Peça ao Agente Financeiro a margem por tipo de procedimento ou pacote, para saber qual atendimento sustenta a clínica." } },
    { id: "engenharia", label: "Engenharia e Construção", ex: {
      marketing: "Transforme visitas de obra em conteúdo técnico simples com o Agente de Conteúdo: problema encontrado, solução e impacto em prazo ou custo.",
      vendas: "Antes de visitar uma construtora, rode o briefing do Agente de Pitch com o site e as obras públicas da empresa.",
      gestao: "Use o Agente de Compras para comparar cotações de fornecedores e prestadores com custo total e prazo de entrega." } },
    { id: "arquitetura", label: "Arquitetura e Design", ex: {
      marketing: "Peça ao Agente de Estratégia uma tese que mostre resultado de negócio ao lado do portfólio estético.",
      vendas: "Cole o briefing do cliente no Agente de Pitch e receba a proposta por fases, com valor de cada etapa.",
      gestao: "Calcule com o Agente Financeiro o preço mínimo por metro quadrado ou por projeto, considerando as horas reais da equipe." } },
    { id: "juridico", label: "Direito, Contabilidade e Finanças", ex: {
      marketing: "Use o Agente de Pesquisa para acompanhar mudanças de regra no setor do seu cliente e transformar cada uma em alerta de conteúdo.",
      vendas: "O Agente de Follow-up ajuda a retomar propostas de serviço recorrente com um conteúdo útil a cada contato.",
      gestao: "Peça ao Agente Financeiro a comparação entre cobrar por hora e por escopo fechado, com a margem de cada modelo." } },
    { id: "executivo", label: "Executivo ou gestor de empresa", ex: {
      marketing: "Transforme decisões que você tomou na carreira em posts de bastidores com o Agente de Conteúdo, sem expor dados de ex-empregadores.",
      vendas: "Use o Agente de Pitch para preparar reuniões com diretores do seu setor, com hipóteses de impacto no resultado da empresa.",
      gestao: "O Agente de Rotina protege a agenda para a frente de consultoria crescer sem tomar todo o seu tempo." } },
    { id: "consultoria", label: "Consultoria e mentoria", ex: {
      marketing: "Peça ao Agente de Estratégia um plano mensal que leve leitores do conteúdo até a sessão diagnóstico.",
      vendas: "Rode o Treino de objeção do Agente de Pitch antes de cada sessão de diagnóstico importante.",
      gestao: "Use o Agente Financeiro para comparar a margem de projetos individuais, programas em grupo e acompanhamento recorrente." } },
    { id: "empresario", label: "Empresário de serviço de alto ticket", ex: {
      marketing: "Use o Agente de Pesquisa para entender o que o seu cliente compara antes de fechar e ajustar a oferta.",
      vendas: "Treine o time com o Agente de Atendimento: o roteiro de qualificação vira padrão para todos responderem igual.",
      gestao: "Rode a Faxina de assinaturas e o Fechamento do mês para ver custo fixo e margem real." } },
    { id: "outro", label: "Outro segmento", ex: {} }
  ];

  return { SETUP: SETUP, FRENTES: FRENTES, SEMANA: SEMANA, SEGS: SEGS };
})();
