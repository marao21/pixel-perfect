export interface DailyDevotional {
  title: string;
  verse: string;
  ref: string;
  body: string[];
  author: string;
  quote: string;
  quoteAuthor: string;
}

const BASE: DailyDevotional[] = [
  {
    title: "Viver em paz",
    verse: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.",
    ref: "Filipenses 4:7",
    body: [
      "Parece uma utopia imaginar que é possível viver em paz neste mundo. Conflitos acontecem em todas as áreas da vida e, quando as coisas parecem finalmente tranquilas, ainda precisamos lidar com nossas próprias preocupações, medos e conflitos interiores.",
      "De fato, viver neste mundo e experimentar a paz de Deus pode parecer uma equação difícil de compreender. Quanto mais percebemos a realidade ao nosso redor, mais entendemos que a verdadeira paz não pode depender de circunstâncias perfeitas. Ela precisa estar firmada em algo que não muda quando as circunstâncias mudam.",
      "É por isso que Paulo fala da paz de Deus guardando o coração e a mente daqueles que estão em Cristo. Antes mesmo de falar sobre essa paz, ele orienta os cristãos a não viverem dominados pela ansiedade, mas a apresentarem suas necessidades a Deus em oração, súplica e ações de graças. A paz não nasce de ignorarmos os problemas, mas de colocá-los diante de Deus e confiar nele.",
      "Essa confiança está fundamentada no que Deus fez por nós em Cristo. Romanos 5:1 afirma que, justificados pela fé, temos paz com Deus por meio do nosso Senhor Jesus Cristo. O Espírito Santo também atua em nós, fortalecendo-nos e produzindo seu fruto em nossa vida. Por isso, a paz cristã não é apenas uma técnica para controlar pensamentos, mas uma realidade que nasce de um relacionamento restaurado com Deus.",
      "Isso não significa que nunca teremos medo, tristeza ou momentos de inquietação. A própria Bíblia mostra homens e mulheres de Deus enfrentando angústias profundas. A diferença está em não precisarmos carregar tudo sozinhos. Podemos levar nossas preocupações ao Senhor, abrir diante dele o coração e confiar que sua presença continua conosco mesmo quando não conseguimos entender o que está acontecendo.",
      "Experimente viver essa paz em Cristo. Não é necessário encontrar palavras difíceis ou seguir fórmulas complicadas. Ore, apresente a Deus aquilo que pesa sobre seu coração, agradeça por sua fidelidade e confie nele. A paz de Deus talvez não mude imediatamente a circunstância que você está enfrentando, mas pode guardar seu coração e sua mente enquanto você atravessa essa circunstância.",
      "Seja também um reflexo dessa paz. Em um mundo marcado pela ansiedade, pelo medo e pelos conflitos, uma vida que confia em Deus pode apontar para aquele que é a nossa verdadeira fonte de paz.",
      "Deus te abençoe!",
    ],
    author: "Aureliano Guimarães Júnior",
    quote: "Não terei paz com ninguém enquanto não tiver paz com Deus.",
    quoteAuthor: "Guimarães Jr.",
  },
  {
    title: "Firmeza no meio da tempestade",
    verse: "Sede firmes, inabaláveis e sempre abundantes na obra do Senhor, sabendo que o vosso trabalho não é vão no Senhor.",
    ref: "1 Coríntios 15:58",
    body: [
      "Homem de Deus não é medido pela ausência de tempestades, mas pela firmeza com que permanece de pé quando elas chegam. A tempestade revela o alicerce.",
      "Muitos homens começam bem: entusiasmados, cheios de planos. Mas a vida cristã não é uma corrida de cem metros — é uma maratona. O que sustenta o corredor não é a emoção da largada, mas a disciplina de cada passo.",
      "Paulo escreveu aos coríntios em meio a confusão, divisões e imoralidade. Mesmo assim, sua palavra não foi 'fujam', mas 'permaneçam firmes'. A firmeza cristã não é teimosia; é confiança de que a obra do Senhor vale a pena.",
      "Hoje, escolha ser constante: na leitura, na oração, no cuidado com sua família. A constância silenciosa constrói legado. Ninguém aplaude o homem que ora às cinco da manhã, mas Deus o vê.",
      "Prática: ore com sua esposa ou filhos antes de dormir. Cinco minutos. Todos os dias desta semana.",
    ],
    author: "Equipe Os Mamutes",
    quote: "A fé não nos livra das tempestades; nos dá um âncora no meio delas.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Liderança que serve",
    verse: "Quem quiser tornar-se grande entre vós, será esse o que vos sirva.",
    ref: "Mateus 20:26",
    body: [
      "Cristo inverteu a lógica do poder. No Reino de Deus, liderar é carregar o peso primeiro, não por último.",
      "Os discípulos discutiam sobre quem seria o maior. Jesus respondeu lavando pés. A lição permanece: a grandeza de um homem se mede por quantos ele serve, não por quantos o servem.",
      "Em casa, isso significa levantar-se para ajudar antes de ser pedido. No trabalho, significa assumir a tarefa ingrata sem reclamar. Na igreja, significa estar disponível para o que ninguém vê.",
      "A liderança que serve não é fraqueza — é força sob controle, a mesma força que levou o Rei do universo a uma cruz.",
      "Prática: assuma hoje uma tarefa que normalmente você deixa para outro, sem anunciar que o fez.",
    ],
    author: "Equipe Os Mamutes",
    quote: "O verdadeiro líder não usa os outros para subir; usa sua posição para levantar os outros.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Integridade no oculto",
    verse: "O que anda em integridade anda seguro, mas o que perverte os seus caminhos será conhecido.",
    ref: "Provérbios 10:9",
    body: [
      "Integridade é ser o mesmo homem quando ninguém está olhando. O caráter não é o que fazemos em público; é o que somos no escuro.",
      "Pequenas concessões abrem grandes brechas. Ninguém cai de um penhasco de uma vez — desce-se um degrau de cada vez, cada um parecendo pequeno demais para importar.",
      "A Bíblia não promete que o íntegro terá vida fácil, mas promete que ele andará seguro. A segurança de não ter nada a esconder é uma das maiores liberdades que um homem pode experimentar.",
      "Prática: confesse a um irmão do grupo uma área em que você precisa de prestação de contas. O segredo perde força quando é trazido à luz.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Caráter é o que você é quando ninguém está vendo.",
    quoteAuthor: "John Wooden",
  },
  {
    title: "O sacerdote do lar",
    verse: "Eu e a minha casa serviremos ao Senhor.",
    ref: "Josué 24:15",
    body: [
      "Josué não decidiu só por si. Decidiu pela casa. Essa é a vocação do homem cristão: ser o sacerdote do próprio lar.",
      "Sua família precisa ver sua fé em ação, não apenas ouvir sobre ela. Filhos aprendem mais pelo que observam do que pelo que escutam. Um pai que ora, lê a Bíblia e pede perdão quando erra ensina mais do que mil sermões.",
      "Ser sacerdote do lar não exige diploma de teologia. Exige presença, iniciativa e humildade. Comece pequeno: uma oração na mesa, um versículo antes de dormir, um culto doméstico por semana.",
      "Prática: leia um salmo em voz alta à mesa no jantar de hoje e faça uma oração curta com a família.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Um homem pode falhar em muitas coisas, mas não pode falhar como sacerdote do seu lar.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "A força da oração",
    verse: "A oração feita por um justo pode muito em seus efeitos.",
    ref: "Tiago 5:16",
    body: [
      "A oração não é o último recurso do homem desesperado; é a primeira arma do homem de Deus.",
      "Elias era um homem comum, sujeito às mesmas fraquezas que nós. Mas orou, e o céu se fechou. Orou de novo, e a chuva veio. O poder não estava em Elias, mas no Deus a quem ele orava.",
      "Muitos homens tentam resolver tudo na força do braço e só oram quando esgotam as próprias forças. Inverta a ordem: comece de joelhos, e depois levante-se para agir.",
      "Prática: antes de tomar qualquer decisão importante hoje, pare e ore por sessenta segundos.",
    ],
    author: "Equipe Os Mamutes",
    quote: "O homem que ora de joelhos pode enfrentar de pé qualquer gigante.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Coragem para obedecer",
    verse: "Esforça-te e tem bom ânimo; não temas, nem te espantes, porque o Senhor teu Deus é contigo, por onde quer que andares.",
    ref: "Josué 1:9",
    body: [
      "Deus não chamou Josué para uma missão fácil: substituir Moisés e conduzir um povo teimoso à Terra Prometida. A ordem divina não foi 'não tenha medo do perigo', mas 'não temas, porque eu sou contigo'.",
      "A coragem bíblica não é ausência de medo; é obediência apesar do medo. O medo olha para o tamanho do gigante; a fé olha para o tamanho de Deus.",
      "Que obediência você vem adiando por medo? Uma conversa difícil, um pedido de perdão, um passo de fé no trabalho? Hoje é o dia de avançar.",
      "Prática: escreva a decisão que você vem adiando e dê o primeiro passo concreto ainda hoje.",
    ],
    author: "Equipe Os Mamutes",
    quote: "A coragem é o medo que disse suas orações.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Domínio próprio",
    verse: "Como a cidade derrubada, que não tem muros, assim é o homem que não pode conter o seu espírito.",
    ref: "Provérbios 16:32",
    body: [
      "Na antiguidade, uma cidade sem muros estava à mercê de qualquer invasor. Assim é o homem sem domínio próprio: qualquer provocação, qualquer tentação, qualquer emoção o derruba.",
      "Domínio próprio não é supressão — é direção. É a força de um rio dentro de suas margens. O homem que domina a si mesmo é mais forte do que o que conquista uma cidade.",
      "Ira, apetite, palavras, telas: quais muros da sua vida estão derrubados? Comece a reconstruir um deles hoje.",
      "Prática: identifique um gatilho que costuma te fazer perder o controle e decida antecipadamente como você vai reagir da próxima vez.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Quem não governa a si mesmo será governado por qualquer coisa.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Palavras que edificam",
    verse: "A palavra branda desvia o furor, mas a palavra dura suscita a ira.",
    ref: "Provérbios 15:1",
    body: [
      "A língua é pequena, mas governa a casa inteira. Uma frase dita no impulso pode destruir em segundos o que levou anos para construir.",
      "O homem maduro aprende a pausar antes de responder. Nem todo pensamento merece virar palavra, e nem toda palavra merece ser dita agora.",
      "Em casa, suas palavras são martelo ou são pincel? Constroem ou desconstroem? Sua esposa e seus filhos conhecem o som da sua voz — que ela seja associada a encorajamento.",
      "Prática: hoje, elogie sinceramente três pessoas da sua casa antes de apontar qualquer falha.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Palavras são sementes: depois de lançadas, você não escolhe a colheita.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Fidelidade nas pequenas coisas",
    verse: "Quem é fiel no mínimo também é fiel no muito.",
    ref: "Lucas 16:10",
    body: [
      "Todos querem as grandes responsabilidades, mas Deus testa o coração nas pequenas. Antes de confiar um reino a Davi, Deus o observou fiel com as ovelhas.",
      "A fidelidade se revela no horário cumprido, na promessa mantida, no dinheiro bem administrado, na leitura feita mesmo sem vontade. Ninguém vê, mas Deus vê.",
      "Não despreze a pequenez do seu campo atual. A maneira como você cuida do pouco determina se Deus pode confiar-lhe o muito.",
      "Prática: escolha hoje um compromisso pequeno que você vem negligenciando e cumpra-o com excelência.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Grandes homens são construídos em pequenas fidelidades diárias.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Descanso em Deus",
    verse: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    ref: "Mateus 11:28",
    body: [
      "O homem moderno carrega o mundo nos ombros: contas, trabalho, família, expectativas. Jesus não oferece mais uma carga — oferece alívio.",
      "Descansar em Deus não é preguiça; é confiança. É reconhecer que o mundo não gira por causa do nosso esforço, mas pela graça de Deus.",
      "Até Deus descansou no sétimo dia. Se o Criador estabeleceu o ritmo de trabalho e descanso, quem somos nós para ignorá-lo?",
      "Prática: reserve hoje trinta minutos sem telas e sem tarefas, apenas para estar com Deus e com quem você ama.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Descanso não é fuga da responsabilidade; é confiança no Responsável.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Amizades que fortalecem",
    verse: "Como o ferro afia o ferro, assim o homem afia o rosto do seu amigo.",
    ref: "Provérbios 27:17",
    body: [
      "Nenhum homem foi feito para lutar sozinho. Até Jesus caminhou com doze. A solidão é um dos maiores campos de batalha do homem contemporâneo.",
      "Amizade verdadeira não é apenas companhia para o churrasco; é alguém que pergunta como está sua alma, que corrige com amor, que ora por você.",
      "É por isso que este grupo existe. Os Mamutes não são apenas um desafio de leitura — são irmãos de caminhada. Invista nessas amizades.",
      "Prática: envie hoje uma mensagem para um irmão do grupo perguntando como você pode orar por ele.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Mostre-me suas amizades e eu te mostrarei seu futuro.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Perdão que liberta",
    verse: "Antes sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo.",
    ref: "Efésios 4:32",
    body: [
      "Guardar mágoa é beber veneno esperando que o outro morra. O perdão não absolve o ofensor primeiro — liberta o ofendido.",
      "Perdoar não é fingir que não doeu, nem concordar com o erro. É entregar a dívida nas mãos de Deus, que julga com justiça, em vez de carregá-la no próprio peito.",
      "A medida do nosso perdão foi dada na cruz. Se Deus nos perdoou uma dívida impagável, como recusar perdão por dívidas tão menores?",
      "Prática: pense em alguém contra quem você guarda ressentimento e ore por essa pessoa hoje, pedindo a Deus graça para perdoar.",
    ],
    author: "Equipe Os Mamutes",
    quote: "O perdão não muda o passado, mas amplia o futuro.",
    quoteAuthor: "Paul Boese",
  },
  {
    title: "Trabalho como adoração",
    verse: "E tudo quanto fizerdes, fazei-o de coração, como ao Senhor, e não aos homens.",
    ref: "Colossenses 3:23",
    body: [
      "Seu trabalho não é apenas um meio de pagar contas — é um altar. Quando você trabalha com excelência, honestidade e alegria, está adorando a Deus.",
      "O crente não trabalha para agradar o chefe, mas para agradar o Senhor. Isso muda tudo: muda a pontualidade, a ética, o cuidado com os detalhes.",
      "Seja na lavoura, no escritório, na obra ou no comércio, seu trabalho diário é seu campo missionário. Suas atitudes pregam antes das suas palavras.",
      "Prática: comece o expediente de hoje com uma oração curta, consagrando seu trabalho a Deus.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Trabalhe como se fosse para Deus — porque é.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Esperança que não decepciona",
    verse: "E a esperança não traz confusão, porquanto o amor de Deus está derramado em nossos corações pelo Espírito Santo.",
    ref: "Romanos 5:5",
    body: [
      "O mundo oferece esperanças frágeis: dinheiro, saúde, planos. Todas podem ruir. A esperança cristã é diferente — está ancorada no caráter de Deus.",
      "Paulo escreveu isso no contexto das tribulações. A esperança bíblica não nega a dor; atravessa a dor com a certeza de que Deus está no controle e que o final da história já está escrito.",
      "Quando o desânimo bater, lembre-se: o mesmo Deus que ressuscitou Jesus cuida de você. Nenhuma situação está além do seu alcance.",
      "Prática: escreva três motivos de gratidão a Deus hoje, mesmo em meio às dificuldades.",
    ],
    author: "Equipe Os Mamutes",
    quote: "A esperança cristã não é um 'talvez'; é um 'certamente' baseado em quem Deus é.",
    quoteAuthor: "Anônimo",
  },
];

/** Devocional do dia: um diferente para cada um dos 180 dias do desafio. */
export function getDevotionalForDay(day: number): DailyDevotional {
  return BASE[(Math.max(1, day) - 1) % BASE.length]!;
}

export const TOTAL_DAYS = 180;
