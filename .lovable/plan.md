# Aplicar Velaris na primeira dobra

## Objetivo
Substituir o fundo atual da primeira dobra por uma animação WebGL Velaris, mantendo o conteúdo, os botões e a identidade branco/dourado.

## Implementação
- Criar o componente reutilizável `Velaris` na biblioteca de interface, com tipagem segura, limpeza dos recursos WebGL e suporte a movimento reduzido.
- Aplicar o canvas somente ao fundo da primeira dobra da Home, atrás do conteúdo existente.
- Usar branco, champagne, dourado e grafite suave em vez da paleta verde/preta do exemplo.
- Preservar contraste, carregamento inicial, versão móvel e fallback visual quando WebGL não estiver disponível.
- Remover do fundo da primeira dobra as camadas visuais que competirem com o novo efeito, sem alterar textos, CTAs ou rastreamento.

## Validação
- Conferir a Home em desktop e celular.
- Verificar animação, legibilidade, ausência de estouro lateral, erros e respeito a `prefers-reduced-motion`.
