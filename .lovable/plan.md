# Corrigir exportação e métricas de origem dos leads

## Implementação
- Fazer o CSV incluir todos os campos salvos do lead, respostas do formulário, dados calculados, UTMs, origem, referrer e identificadores de campanha.
- Consolidar variações de `utm_source` em plataformas legíveis, como Instagram, Facebook, WhatsApp, Google e Direto, sem separar posicionamentos.
- Consolidar os referrers externos pelas mesmas plataformas quando reconhecidos e manter o domínio para outras origens.
- Calcular “qualificado” com a classificação da análise ou pontuação mínima equivalente, em vez do status manual do funil.
- Mostrar, por origem, quantidade e taxa de qualificação com os filtros atuais.

## Validação
- Conferir o arquivo CSV gerado e as duas distribuições no painel, incluindo visualização em tela larga.
- Confirmar que a aplicação continua compilando sem erros.
