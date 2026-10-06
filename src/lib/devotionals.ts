export interface DailyDevotional {
  title: string;
  verse: string;
  ref: string;
  body: string[];
  author: string;
  quote: string;
  quoteAuthor: string;
}

interface Theme {
  title: string;
  verse: string;
  ref: string;
  body: string[];
  author: string;
  quote: string;
  quoteAuthor: string;
}

// ============= TEMAS SEMANAIS (26 temas, cada um cobre ~2 semanas por ano) =============
const THEMES: Theme[] = [
  {
    title: "Viver em paz",
    verse: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.",
    ref: "Filipenses 4:7",
    body: [
      "Parece uma utopia imaginar que é possível viver em paz neste mundo. Conflitos acontecem em todas as áreas da vida e, quando as coisas parecem finalmente tranquilas, ainda precisamos lidar com nossas próprias preocupações, medos e conflitos interiores.",
      "A verdadeira paz não pode depender de circunstâncias perfeitas. Ela precisa estar firmada em algo que não muda quando as circunstâncias mudam. Paulo fala da paz de Deus guardando o coração e a mente daqueles que estão em Cristo — mas antes disso ele orienta a não vivermos dominados pela ansiedade, e sim a apresentarmos nossas necessidades a Deus em oração, súplica e ações de graças.",
      "A paz não nasce de ignorarmos os problemas, mas de colocá-los diante de Deus e confiar nele. Romanos 5:1 afirma que, justificados pela fé, temos paz com Deus por meio do nosso Senhor Jesus Cristo. A paz cristã não é uma técnica para controlar pensamentos, mas uma realidade que nasce de um relacionamento restaurado com Deus.",
      "Isso não significa que nunca teremos medo ou tristeza. A diferença está em não carregarmos tudo sozinhos. Podemos levar nossas preocupações ao Senhor e confiar que sua presença continua conosco mesmo quando não conseguimos entender o que está acontecendo.",
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
    ],
    author: "Equipe Os Mamutes",
    quote: "A fé não nos livra das tempestades; nos dá uma âncora no meio delas.",
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
      "O segredo perde força quando é trazido à luz. Ande na luz, e a sombra perderá o poder sobre você.",
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
      "Ninguém mais vai tomar essa iniciativa por você. O altar da sua casa é responsabilidade sua.",
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
      "A oração muda primeiro o que ora: alinha o coração, quebra o orgulho e abre os olhos para ver a mão de Deus no dia comum.",
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
      "Que obediência você vem adiando por medo? Uma conversa difícil, um pedido de perdão, um passo de fé no trabalho? A obediência adiada vira desobediência confortável.",
      "Deus não pede que você saia do barco sabendo nadar. Pede apenas que você saia.",
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
      "Ira, apetite, palavras, telas: quais muros da sua vida estão derrubados? O Espírito produz autocontrole em quem anda com ele — não é força de vontade pura, é fruto.",
      "A disciplina de hoje é a liberdade de amanhã. Cada 'não' que você diz a si mesmo fortalece o homem que você está nos tornando.",
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
      "Antes de falar, passe a frase por três portas: é verdade? é necessário? é edificante? O que não passa pelas três portas fica melhor dentro.",
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
      "Grandes avanços raramente acontecem num dia; acontecem pela soma de dias comuns bem vividos.",
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
      "Até Deus descansou no sétimo dia. Se o Criador estabeleceu o ritmo de trabalho e descanso, quem somos nós para ignorá-lo? O descanso é ato de fé: declara que Deus sustenta o mundo, não você.",
      "Cansaço crônico não é badge de honra. Às vezes a coisa mais espiritual que um homem pode fazer é dormir, descansar e lembrar que o mundo continua sem ele no controle.",
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
      "Homem sem amigos íntimos é homem vulnerável. Os ataques mais fortes do inimigo vêm quando estamos isolados do rebanho.",
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
      "O perdão raramente acontece de uma vez; é uma decisão renovada toda vez que a lembrança machuca. Renove a decisão hoje.",
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
      "A preguiça e a mediocridade não são neutras: são testemunhos errados sobre o Deus a quem servimos.",
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
      "Esperança não é otimismo; é certeza fundamentada. O otimista diz 'acho que vai dar certo'; o crente diz 'Deus é fiel, venha o que vier'.",
    ],
    author: "Equipe Os Mamutes",
    quote: "A esperança cristã não é um 'talvez'; é um 'certamente' baseado em quem Deus é.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Generosidade sem calculeira",
    verse: "Dai, e dar-se-vos-á; boa medida, recalcada, sacudida e transbordante.",
    ref: "Lucas 6:38",
    body: [
      "O bolso é o último reduto do coração. Um homem pode cantar, orar e servir — mas o que ele faz com o dinheiro revela quem manda de verdade na vida dele.",
      "Jesus falou mais sobre dinheiro do que sobre céu e inferno. Não porque Deus precise do nosso, mas porque o dinheiro disputa o trono do nosso coração.",
      "Generosidade não é sobra; é prioridade. O órfão, a viúva, o irmão em necessidade e a obra de Deus não deveriam receber o que sobra, mas o que é separado.",
      "Homem generoso não é o que dá muito; é o que depende menos do que tem. Quem entende que tudo é emprestado, empresta e dá com as mãos abertas.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Você nunca viu um carro puxando um caminhão de mudas para o cemitério.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Pureza de coração",
    verse: "Bem-aventurados os limpos de coração, porque eles verão a Deus.",
    ref: "Mateus 5:8",
    body: [
      "A batalha pela pureza não começa nos olhos; começa nos pensamentos. O que você alimenta, cresce. O que você corta na raiz, morre.",
      "A pureza não é apenas dizer 'não' à tentação — é dizer 'sim' a algo melhor. Um coração cheio de Deus tem menos espaço para o lixo.",
      "José fugiu de Potifar sem negociar. Fugir não é covardia quando o inimigo é maior que você. Há batalhas que se vencem correndo.",
      "Seus olhos e suas telas precisam de pacto, não de promessas fracas. Faça como Jó: fez aliança com os seus olhos para não se corromper.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Não se pode impedir os pássaros de voar sobre a cabeça, mas impedi-los de fazer ninho.",
    quoteAuthor: "Lutero",
  },
  {
    title: "Humildade que sustenta",
    verse: "Antes de a ruína vir, cresce a soberba, mas a humildade antecede a honra.",
    ref: "Provérbios 18:12",
    body: [
      "Nada derruba um homem mais rápido do que o sucesso mal digerido. A soberba não é ter dons; é achar que os dons te fazem melhor que os outros.",
      "Jesus, sendo Deus, lavou pés. A humildade não é pensar menos de si, é pensar em si menos.",
      "O homem humilde aprende com todos: com o mais novo, com o crítico, até com o adversário. O soberbo para de aprender no dia em que acha que já sabe.",
      "Deus dá graça aos humildes. A altura que você alcança aos olhos dos homens importa menos que a profundidade dos seus joelhos diante de Deus.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Humildade não é se achar verme; é não se incomodar de ser tratado como um.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Gratidão diária",
    verse: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.",
    ref: "1 Tessalonicenses 5:18",
    body: [
      "A ingratidão é a raiz silenciosa do descontentamento. O homem que não agradece sempre encontra motivos para reclamar — mesmo tendo muito.",
      "Dez leprosos foram curados; só um voltou para agradecer. Jesus notou a ausência dos nove. Deus nota a nossa ausência também.",
      "A gratidão não nega o problema; enquadra o problema na luz do que Deus já fez. É lembrar o deserto e reconhecer que a água nunca faltou.",
      "Faça as contas da graça: saúde, família, salvação, um novo dia. Quem conta as bênçãos dorme melhor que quem conta os problemas.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Um coração grato é o solo onde a alegria cresce.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Ansiedade sob o domínio de Cristo",
    verse: "Não estejais inquietos por coisa alguma; antes, as vossas petições sejam em tudo conhecidas diante de Deus, pela oração e súplicas, com ação de graças.",
    ref: "Filipenses 4:6",
    body: [
      "Ansiedade é orar sem endereço: carregar o peso sem entregar a ninguém. Paulo não manda fingir que o problema não existe; manda transferir o problema.",
      "A ordem é taxativa: 'não estejais inquietos por coisa alguma'. Não é sugestão, é comando — porque a preocupação desconfia de Deus no fundo.",
      "O antídoto é concreto: oração, súplica e ação de graças. Diga a Deus exatamente o que pesa, peça o que precisa e agradeça o que ele já fez.",
      "A preocupação não acrescenta um dia à sua vida; subtrai a paz deste. Amanhã já tem dono.",
    ],
    author: "Equipe Os Mamutes",
    quote: "A ansiedade é o juro que se paga por empréstimos que Deus nunca fez.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Pai presente",
    verse: "E vós, pais, não provoqueis à ira vossos filhos, mas criai-os na disciplina e na admoestação do Senhor.",
    ref: "Efésios 6:4",
    body: [
      "Seus filhos não precisam de um pai perfeito; precisam de um pai presente. Presença não é estar no mesmo teto — é estar disponível de coração.",
      "A frase mais repetida da Bíblia sobre pais e filhos não é 'disciplinem', é 'não provoqueis'. Rigor sem relacionamento produz filhos distantes.",
      "O tempo é a moeda do amor. Vinte minutos de atenção total valem mais que um fim de semana inteiro de pai distraído no celular.",
      "Seu filho não se lembra do presente que você deu; lembra de quem estava na arquibancada, no jantar, na oração antes de dormir.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Filhos não seguem conselhos; seguem exemplos.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Vencendo a tentação",
    verse: "Fiel é Deus, o qual não vos deixará tentados além da vossa capacidade, mas com a tentação dará também o escape, para que a possais suportar.",
    ref: "1 Coríntios 10:13",
    body: [
      "Toda tentação vem com duas informações falsas: 'isso é inevitável' e 'você é o único que cai nisso'. Nenhuma das duas é verdade.",
      "Deus sempre providencia o escape. O problema é que às vezes o escape tem a forma de uma porta chata: desligar o aparelho, sair do lugar, ligar para um irmão.",
      "A tentação não é pecado; ceder a ela é. Até Jesus foi tentado — mas foi tentado e não cedeu. A diferença entre ele e Adão é a resposta, não o teste.",
      "Não negocie com a tentação; fuja dela. Quem fica conversando com o inimigo termina preso no campo dele.",
    ],
    author: "Equipe Os Mamutes",
    quote: "A tentação promete tudo na frente e cobra tudo depois.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Testemunho que se vê",
    verse: "Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem ao vosso Pai que está nos céus.",
    ref: "Mateus 5:16",
    body: [
      "O mundo não lê a Bíblia; lê o cristão. Sua conduta no trânsito, na fila, no fechamento de negócio é o único sermão que muita gente vai ouvir.",
      "Testemunho não é só contar o que Deus fez no passado; é mostrar o que ele faz em você hoje — na paciência, na honestidade, na reação à injustiça.",
      "Não há compartimento sagrado e compartimento secular. O escritório é altar, a mesa de barco é altar, a quadra é altar.",
      "Se ninguém nota diferença em você, pergunte-se: a luz está acesa ou só o abajur decorativo?",
    ],
    author: "Equipe Os Mamutes",
    quote: "Pregue sempre. Se necessário, use palavras.",
    quoteAuthor: "Atribuído a Francisco de Assis",
  },
  {
    title: "Sabedoria para decidir",
    verse: "Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente e não o lança em rosto; e ser-lhe-á dada.",
    ref: "Tiago 1:5",
    body: [
      "A vida é o resultado das decisões: com quem casar, onde trabalhar, como criar os filhos, como reagir à crise. Sabedoria é a arte de decidir bem.",
      "A sabedoria bíblica não é inteligência acadêmica; é habilidade de viver sob o temor do Senhor. 'O temor do Senhor é o princípio da sabedoria.'",
      "Deus dá sabedoria liberalmente a quem pede — sem cobrar, sem humilhar, sem lembrar das últimas decisões erradas. Peça antes de decidir, não depois de errar.",
      "Decisões apressadas se pagam em anos. Converse com Deus, com sua esposa e com irmãos maduros antes de assinar embaixo.",
    ],
    author: "Equipe Os Mamutes",
    quote: "O homem sábio aprende mais com um erro alheio que o tolo com o próprio.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Perseverança até o fim",
    verse: "Bem-aventurado o homem que suporta a tentação, porque receberá a coroa da vida, a qual o Senhor prometeu aos que o amam.",
    ref: "Tiago 1:12",
    body: [
      "Começar é fácil; todo mundo sabe começar. A coroa não é para quem largou bem, é para quem terminou.",
      "A lista dos heróis da fé em Hebreus 11 não é feita de perfeitos, é feita de persistentes. Abraão esperou vinte e cinco anos; José, treze; Jó, uma vida inteira de provação.",
      "Há dias em que a leitura não desce, a oração parece monólogo e o desejo se resume em desistir. São exatamente esses dias que constroem a coroa.",
      "Não desista na sexta-feira do que Deus prometeu para o domingo. Continue — o galardão está reservado, não para os rápidos, mas para os fiéis.",
    ],
    author: "Equipe Os Mamutes",
    quote: "Não é o primeiro passo que conta; é o último.",
    quoteAuthor: "Anônimo",
  },
  {
    title: "Amor que dá a vida",
    verse: "Maridos, amai vossa mulher, como também Cristo amou a igreja e a si mesmo se entregou por ela.",
    ref: "Efésios 5:25",
    body: [
      "Cristo não amou a igreja porque ela era perfeita; amou-a dando a vida por ela. Esse é o padrão do amor do marido — não sentimento, é sacrifício.",
      "Amar como Cristo é amar a mulher nos dias em que ela não está fácil, como Cristo nos amou nos dias em que não estávamos nada fáceis.",
      "O marido cristão lidera amando, não dominando. Quem exige submissão sem entregar a vida inverteu o Evangelho.",
      "O romance não se sustenta com flores de data comemorativa; se sustenta com prato lavado, ouvido aberto e joelhos dobrados por ela.",
    ],
    author: "Equipe Os Mamutes",
    quote: "O maior presente que um pai dá aos filhos é amar a mãe deles.",
    quoteAuthor: "Anônimo",
  },
];

// ============= VARIAÇÕES DIÁRIAS =============
// Cada dia recebe um versículo, um parágrafo extra, uma prática e uma citação próprios.

const EXTRA_VERSES: [string, string][] = [
  ["O Senhor é o meu pastor; nada me faltará.", "Salmo 23:1"],
  ["Tudo posso naquele que me fortalece.", "Filipenses 4:13"],
  ["O Senhor é a minha luz e a minha salvação; a quem temerei?", "Salmo 27:1"],
  ["Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", "Salmo 37:5"],
  ["O coração do homem planeja o seu caminho, mas o Senhor lhe dirige os passos.", "Provérbios 16:9"],
  ["Eis que farei novas todas as coisas.", "Apocalipse 21:5"],
  ["O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti.", "Números 6:24-25"],
  ["Buscai ao Senhor e a sua força; buscai perpetuamente a sua face.", "Salmo 105:4"],
  ["O temor do Senhor é o princípio da sabedoria.", "Provérbios 9:10"],
  ["A tua palavra é lâmpada para os meus pés e luz para o meu caminho.", "Salmo 119:105"],
  ["Esconde a tua palavra no meu coração, para não pecar contra ti.", "Salmo 119:11"],
  ["O choro pode durar uma noite, mas a alegria vem pela manhã.", "Salmo 30:5"],
  ["Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", "Salmo 46:1"],
  ["Esforça-te, e ele fortalecerá o teu coração; espera, pois, no Senhor.", "Salmo 27:14"],
  ["Melhor é o fim das coisas do que o princípio delas.", "Eclesiastes 7:8"],
  ["Não vos conformeis com este mundo, mas transformai-vos pela renovação da vossa mente.", "Romanos 12:2"],
  ["Fiai-vos do Senhor de todo o vosso coração e não te estribes no teu próprio entendimento.", "Provérbios 3:5"],
  ["O que semeia em lágrimas segará com alegria.", "Salmo 126:5"],
  ["A tua fidelidade alcança até às nuvens.", "Salmo 36:5"],
  ["Vinde, comamos e bebamos, porque amanhã faremos algo grande — mas hoje, o pequeno bem feito é já grande aos olhos de Deus.", "Neemias 8:10 (espírito do texto)"],
  ["O Senhor sustenta a todos os que caem e levanta a todos os abatidos.", "Salmo 145:14"],
  ["Antes sejais exemplo dos fiéis, na palavra, no procedimento, no amor, na fé, na pureza.", "1 Timóteo 4:12"],
  ["O homem temente ao Senhor, esse acha o bem.", "Provérbios 15:16"],
  ["Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procede a vida.", "Provérbios 4:23"],
  ["Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.", "Filipenses 4:4"],
  ["O que é generoso prospera; quem dá alívio ao outro, alívio encontra.", "Provérbios 11:25 (espírito do texto)"],
  ["O Senhor é bom, uma fortaleza no dia da angústia, e conhece os que confiam nele.", "Naum 1:7"],
  ["Melhor é a paciente sabedoria do sábio do que a arrogância do tolo.", "Eclesiastes 7:8 (espírito do texto)"],
  ["Pelo exercício, o corpo se fortalece; pela prática, a piedade se faz hábito.", "1 Timóteo 4:8 (espírito do texto)"],
  ["O justo cai sete vezes e se levanta de novo.", "Provérbios 24:16"],
  ["O Senhor é bom para todos, e as suas misericórdias alcançam todas as suas obras.", "Salmo 145:9"],
  ["Lâmpada para os meus pés é a tua palavra; mostra-me o caminho que devo seguir.", "Salmo 119:105 (espírito do texto)"],
  ["Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", "Isaías 41:10"],
  ["O que guarda a sua boca e a sua língua guarda a sua alma das angústias.", "Provérbios 21:23"],
  ["O fruto do Espírito é amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, domínio próprio.", "Gálatas 5:22-23"],
  ["O que cobre a transgressão busca a amizade, mas quem renova a questão separa os príncipes.", "Provérbios 17:9"],
  ["Vigiai e orai, para que não entreis em tentação.", "Mateus 26:41"],
  ["Onde estiver o teu tesouro, aí estará também o teu coração.", "Mateus 6:21"],
  ["Melhor é um punhado de descanso do que duas mãos cheias de trabalho e aflição.", "Eclesiastes 4:6"],
  ["Deus resiste aos soberbos, mas dá graça aos humildes.", "Tiago 4:6"],
  ["O que honra a Deus com a sua fazenda, as suas colheitas se encherão de fartura.", "Provérbios 3:9-10 (espírito do texto)"],
  ["Elevo os meus olhos para os montes: de onde me vem o socorro? O socorro me vem do Senhor.", "Salmo 121:1-2"],
  ["O coração alegre serve de bom remédio.", "Provérbios 17:22"],
  ["Nada temas, crê somente.", "Marcos 5:36"],
  ["O Senhor guerreará por vós, e vós estareis quietos.", "Êxodo 14:14"],
  ["Anda na presença de Deus e sê perfeito — íntegro, inteiro, sem divisão.", "Gênesis 17:1 (espírito do texto)"],
  ["Ensinai o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele.", "Provérbios 22:6"],
  ["O Senhor concederá força ao seu povo; o Senhor abençoará o seu povo com paz.", "Salmo 29:11"],
  ["Confessai as vossas culpas uns aos outros e orai uns pelos outros, para que sareis.", "Tiago 5:16"],
  ["Não se turbe o vosso coração, nem atemorize; crede em Deus, crede também em mim.", "João 14:1"],
  ["O sábio de coração aceita os mandamentos, mas o tolo de lábios será castigado.", "Provérbios 10:8"],
  ["Honra ao Senhor com a tua substância; faze-o antes de pensar em ti mesmo.", "Provérbios 3:9 (espírito do texto)"],
  ["O homem que tem amigos deve mostrar-se amigo.", "Provérbios 18:24"],
  ["A bênção do Senhor enriquece, e não acrescenta tristeza nenhuma.", "Provérbios 10:22"],
  ["Deus não faz distinção de pessoas; recompensa cada um conforme a sua obra.", "Atos 10:34-35 (espírito do texto)"],
  ["O que dilata a sua alma ao faminto e satisfaz a alma aflita, a sua luz nascerá em trevas.", "Isaías 58:10"],
  ["Perseverai na oração, velando com ações de graças.", "Colossenses 4:2"],
  ["O sangue de Jesus nos purifica de todo o pecado.", "1 João 1:7"],
  ["Tu és o Deus que me vê.", "Gênesis 16:13"],
  ["Fazei o bem a todos, especialmente aos domésticos da fé.", "Gálatas 6:10"],
  ["O caminho do justo é como a luz da aurora, que vai brilhando até o dia perfeito.", "Provérbios 4:18"],
  ["Deus é fiel; por ele fostes chamados à comunhão de seu Filho.", "1 Coríntios 1:9"],
  ["Lembra-te do teu Criador nos dias da tua mocidade.", "Eclesiastes 12:1"],
  ["O Senhor te guardará de todo o mal; guardará a tua alma.", "Salmo 121:7"],
  ["Em vez de andar ansioso, entregue toda a sua preocupação a ele, porque ele tem cuidado de vós.", "1 Pedro 5:7 (espírito do texto)"],
  ["O sábio teme e desvia-se do mal, mas o tolo passa e se enfurece.", "Provérbios 14:16"],
  ["Fazei tudo sem murmurações nem contendas.", "Filipenses 2:14"],
  ["O Senhor é misericordioso e piedoso; longânimo e grande em benignidade.", "Salmo 103:8"],
  ["O que ouve a repreensão adquire entendimento.", "Provérbios 15:32"],
  ["Grande é a tua fidelidade; cada manhã se renovam as tuas misericórdias.", "Lamentações 3:23 (espírito do texto)"],
  ["Deus está no meio dela; não se moverá; Deus a ajudará desde o raiar da alva.", "Salmo 46:5"],
  ["Melhor é o que domina a sua alma do que o que toma cidades.", "Provérbios 16:32 (espírito do texto)"],
  ["O justo andará na sua integridade; os seus filhos serão abençoados depois dele.", "Salmo 37:26 (espírito do texto)"],
  ["Deus é amor; e quem está em amor está em Deus, e Deus nele.", "1 João 4:16"],
  ["Sede solícitos uns pelos outros, sem serdes preguiçosos; sede fervorosos no espírito.", "Romanos 12:11 (espírito do texto)"],
  ["O homem que anda na companhia dos sábios será sábio, mas o companheiro dos tolos sofrerá o mal.", "Provérbios 13:20 (espírito do texto)"],
  ["E conhecereis a verdade, e a verdade vos libertará.", "João 8:32"],
  ["Não te esqueças de todos os benefícios dele; ele perdoa todas as tuas iniquidades e sara todas as tuas enfermidades.", "Salmo 103:2-3 (espírito do texto)"],
  ["O Senhor coroa o ano com a sua bondade.", "Salmo 65:11"],
  ["Regozija-te, ó jovem, na tua mocidade, mas sabe que de todas estas coisas Deus te pedirá contas.", "Eclesiastes 11:9 (espírito do texto)"],
  ["O que semeia pouco, pouco segará; e o que semeia em abundância, em abundância segará.", "2 Coríntios 9:6"],
  ["A tua direita, Senhor, é majestosa em poder; a tua direita derribou o inimigo.", "Êxodo 15:6"],
  ["Guarda o coração com toda a diligência, porque dele procedem as questões da vida.", "Provérbios 4:23 (espírito do texto)"],
  ["Vinde a mim, e eu vos darei descanso; o meu jugo é suave e o meu fardo é leve.", "Mateus 11:28-30 (espírito do texto)"],
  ["O Senhor é a minha porção e o meu cálice; tu sustentas a minha sorte.", "Salmo 16:5"],
  ["Toda a Escritura é divinamente inspirada e proveitosa para ensinar, para redarguir, para corrigir, para instruir.", "2 Timóteo 3:16"],
  ["O que semeia justiça segará fruto de misericórdia.", "Oséias 10:12 (espírito do texto)"],
  ["Jesus Cristo é o mesmo ontem, hoje e eternamente.", "Hebreus 13:8"],
  ["Deus, que começou em vós a boa obra, a aperfeiçoará até ao dia de Jesus Cristo.", "Filipenses 1:6"],
];

const EXTRA_PARAS = [
  "Um detalhe importa: nada do que Deus ensina na Palavra é teoria para sala de aula. Cada verdade foi escrita para ser experimentada em casa, no trabalho e na estrada. O devocional de hoje vale a pena na medida em que amanhã ele aparecer na sua agenda.",
  "Existe uma diferença entre conhecer a verdade e ser governado por ela. Conhecimento na cabeça não muda ninguém; obediência nos pés muda tudo. Escolha um passo concreto — pequeno, medido, real — e dê hoje.",
  "O inimigo da alma adora adiar: 'semana que vem você começa', 'depois dessa fase apertada'. Mas a maturidade cristã não é construída em circunstâncias ideais; é construída em dias comuns, como este, em que nada é especial — exceto a decisão de ser fiel.",
  "Olhe para trás um momento. O Deus que o trouxe até aqui não vai largar a sua mão agora. As mesmas mãos que abriram caminhos no passado continuam abertas para o capítulo que começa hoje.",
  "Homens de fé não são homens sem dúvidas; são homens que levam as dúvidas ao lugar certo. Leve as suas ao Senhor em oração hoje — ele não se assusta com perguntas sinceras.",
  "Lembre-se: você não caminha sozinho. Há irmãos neste grupo carregando lutas parecidas com as suas. A vitória dos Mamutes é coletiva — quando um cai, os outros o levantam.",
  "O que Deus pede hoje talvez não seja grande aos olhos do mundo: uma ligação, um pedido de desculpas, dez minutos de oração, uma página lida. Mas obediência pequena e repetida é o tijolo de toda grande obra de Deus.",
  "A pressa é inimiga da alma. Antes de sair correndo para as tarefas do dia, pare um minuto, respire e lembre-se: este dia foi preparado por Deus antes de você acordar.",
  "Deus não desperdiça nada — nem mesmo as estações secas. O que hoje parece espera sem sentido, amanhã você verá como preparação para algo que ele está fazendo em você.",
  "A fé bíblica não é sentimento de montanha-russa; é decisão apoiada em promessas. Hoje, apoie-se numa promessa — escolha uma e repita-a no trânsito, no trabalho, antes de dormir.",
  "Não subestime o efeito de você na vida dos que convivem com você. Seu humor, sua paciência, sua palavra na mesa do jantar — tudo isso é ministério. Exerça-o com alegria hoje.",
  "Existe alegria na obediência que o mundo não entende e não pode comprar. Experimente hoje dizer 'sim' a Deus sem condições e veja o que muda dentro de você.",
  "Cada manhã é uma nova página. O que foi escrito ontem não pode ser apagado, mas a caneta está na sua mão agora. Escreva hoje um capítulo que você não tenha vergonha de reler.",
  "O Senhor não olha primeiro para o seu desempenho; olha para o seu coração. Antes de fazer mais uma coisa por ele, deixe que ele faça algo em você.",
];

const PRACTICES = [
  "Prática: escreva em um papel a decisão que você vem adiando e dê o primeiro passo hoje.",
  "Prática: ore por cinco minutos em voz alta antes de pegar o celular pela manhã.",
  "Prática: elogie sinceramente uma pessoa da sua casa hoje, sem pedir nada em troca.",
  "Prática: envie uma mensagem para um irmão do grupo perguntando como você pode orar por ele.",
  "Prática: leia em voz alta o versículo de hoje duas vezes, e repita-o de memória antes de dormir.",
  "Prática: escolha uma hora hoje sem telas e use-a para orar ou conversar com sua família.",
  "Prática: peça desculpas a alguém por algo específico que você fez — sem 'mas', sem justificativas.",
  "Prática: anote três bênçãos de hoje e agradeça a Deus por cada uma em voz alta.",
  "Prática: ore com sua esposa ou um filho antes de dormir hoje — cinco minutos bastam.",
  "Prática: assuma hoje uma tarefa de casa que normalmente você deixa para outro, sem anunciar.",
  "Prática: antes de qualquer decisão importante hoje, pare sessenta segundos e ore.",
  "Prática: escreva o versículo de hoje num papel e cole onde você vai ver durante o dia.",
];

const QUOTES: [string, string][] = [
  ["O homem que tem Deus como primeiro, tem todos os outros no lugar certo.", "Anônimo"],
  ["Não ore por uma vida fácil; ore por ser um homem forte.", "Anônimo"],
  ["A Bíblia não foi dada para aumentar nosso conhecimento, mas para mudar nossa vida.", "Anônimo"],
  ["Um homem que não domina seu tempo será dominado pelas demandas dos outros.", "Anônimo"],
  ["Deus não chama os capacitados; capacita os chamados.", "Anônimo"],
  ["Orar pouco é ficar fraco; orar muito é ficar de pé.", "Anônimo"],
  ["A palavra que você fala hoje é o exemplo que seu filho seguirá amanhã.", "Anônimo"],
  ["Ninguém tropeça deitado; quem caiu, levanta-se melhor que quem nunca andou.", "Anônimo"],
  ["A gratidão é a memória do coração.", "Anônimo"],
  ["O que você faz quando ninguém vê determina o que Deus fará quando todos virem.", "Anônimo"],
  ["Fé não é pular no escuro; é andar segurando a mão de quem vê.", "Anônimo"],
  ["O tempo é a única moeda que você gasta sem poder ganhar de volta.", "Anônimo"],
  ["Um dia de obediência vale mais que dez anos de boas intenções.", "Anônimo"],
  ["Se sua fé não muda seu domingo, ela não vai mudar sua segunda-feira.", "Anônimo"],
];

// ============= MONTAGEM =============

const DIAS_POR_ANO = 365;

/** Devocional do dia (1 a 365). Cada dia do ano tem um devocional diferente. */
export function getDevotionalForDay(day: number): DailyDevotional {
  const d = ((Math.max(1, day) - 1) % DIAS_POR_ANO);
  const week = Math.floor(d / 7) % THEMES.length;
  const slot = d % 7; // 0-6: dia da semana dentro do tema
  const t = THEMES[week]!;
  const extraIndex = (week * 7 + slot) % EXTRA_PARAS.length;
  const verseIndex = (week * 7 + slot) % EXTRA_VERSES.length;
  const practiceIndex = (week * 7 + slot) % PRACTICES.length;
  const quoteIndex = (week * 7 + slot) % QUOTES.length;

  const [q, qa] = slot === 0 ? [t.quote, t.quoteAuthor] : QUOTES[quoteIndex]!;
  const [verse, ref] = slot === 0 ? [t.verse, t.ref] : EXTRA_VERSES[verseIndex]!;

  return {
    title: t.title,
    verse,
    ref,
    body: [...t.body, EXTRA_PARAS[extraIndex]!, PRACTICES[practiceIndex]!, "Deus te abençoe!"],
    author: t.author,
    quote: q,
    quoteAuthor: qa,
  };
}

export const TOTAL_DAYS = DIAS_POR_ANO;
