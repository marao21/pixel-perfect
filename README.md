# Os Mamutes — Desafio Bíblico (Android)

Aplicativo Android nativo desenvolvido em Kotlin com Jetpack Compose para o grupo **Os Mamutes** da Igreja Batista Belém.

## Funcionalidades Principais

- **Home**: Resumo do dia atual do plano de leitura (90, 180 dias ou 1 ano), porcentagem de progresso geral, ofensiva/streak diária, atalho para o devocional diário e comunicados (Avisos).
- **Plano de Leitura**: Cronograma bíblico completo com seleção de ritmo (90 dias, 180 dias ou 1 ano), filtros (Todos, Concluídos, Pendentes) e check-in diário.
- **Bíblia Sagrada**: Leitor bíblico completo com suporte a 66 livros, capítulos e múltiplas traduções (NAA, NVI, ACF, ARA, ARC, NVT, NTLH), integração com API online (bolls.life) e cache local para leitura offline.
- **Oferta**: Contribuições para a Igreja Batista Belém via Pix, com valores sugeridos ou livres, recebedor e cópia rápida da chave Pix.
- **Pecado, Aqui Não!**: Checklist interativo de 21 dias em Romanos com oração, leitura e reflexão diária.
- **Devocional Diário**: 365 devocionais diários com versículo, reflexão prática para o homem cristão, citações inspiradoras e autor.
- **Tempo com Deus**: Temporizador de oração e reflexão pessoal (5, 10, 15, 30 e 60 minutos) com versículos inspiradores.
- **Temas**: Suporte a 4 esquemas de cores: Claro, Escuro (padrão dos Mamutes), Sépia e Azul.

## Arquitetura Android

- **Linguagem**: Kotlin
- **Interface**: Jetpack Compose com Material Design 3 (M3)
- **Navegação**: Navigation Compose e Bottom Navigation Bar
- **Persistência Local**: SharedPreferences e cache local de capítulos bíblicos
- **Rede**: OkHttp com suporte a chamadas assíncronas em Coroutines
