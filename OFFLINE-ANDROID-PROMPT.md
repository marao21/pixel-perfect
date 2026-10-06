# Prompt para preparar e usar o app offline em Android

Copie e cole este prompt no Lovable quando quiser revisar ou continuar a configuração de uso offline deste projeto:

```text
Analise o projeto existente Os Mamutes (pixel-perfect) e mantenha a implementação incremental. Preserve todas as abas e funções atuais. Não recrie o app e não adicione recursos de NextTV, player de vídeo, playlists, R2, autenticação ou sincronização com Supabase: esses recursos não fazem parte das telas atuais.

Objetivo: deixar o PWA utilizável em um celular ou tablet Android sem internet depois que ele for preparado online.

Confira o registro do Service Worker, o cache do shell e dos arquivos JS/CSS/imagens, o armazenamento IndexedDB dos capítulos bíblicos já consultados e a persistência local do progresso/configurações. Preserve os dados existentes e não armazene conteúdo grande ou tokens em localStorage. Mostre claramente quando o aparelho está offline e explique quando um capítulo bíblico ainda não foi baixado.

Não afirme que todo o texto bíblico está disponível offline: neste projeto, ficam disponíveis os capítulos que já foram abertos com conexão, limitados ao espaço local do navegador. Não invente sincronização entre dispositivos; progresso e preferências ficam neste aparelho.

Prepare um procedimento simples de instalação e verificação em Android Chrome:
1. Com internet, abra o endereço publicado e aguarde o carregamento completo.
2. Use “Instalar app” ou “Adicionar à tela inicial” no menu do Chrome.
3. Abra as abas Home, Plano, Bíblia, Oferta, Pecado e Devocional enquanto online. Na Bíblia, abra os capítulos que precisar ler offline; cada tradução/capítulo precisa ser carregado uma vez.
4. Feche o app, ative o modo avião e abra o ícone instalado. Confirme que o app abre, todas as abas locais navegam, progresso e tema permanecem salvos, e os capítulos previamente abertos continuam visíveis.
5. Escolha um capítulo bíblico nunca carregado: deve aparecer uma explicação clara pedindo conexão, sem tela branca ou loading infinito.
6. Desative o modo avião e confirme que novos capítulos voltam a carregar. Não reinicie nem interrompa uma página em uso só para atualizar o cache.

Se encontrar falha, explique qual recurso foi afetado, corrija-o sem quebrar os fluxos atuais e informe o que ainda depende de conexão. Não diga que um teste em Android físico foi concluído se ele não foi executado nesse aparelho.
```

## Preparação resumida do aparelho

Abra o app publicado uma vez com internet, instale-o pela opção do Chrome e consulte os capítulos bíblicos necessários. Depois, ative o modo avião e abra o ícone instalado. Capítulos bíblicos nunca consultados precisam de internet na primeira abertura.
