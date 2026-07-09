Trocar o CTA da página de obrigado qualificado (/avaliacao/obrigado-qualificado) de "Conhecer o EB-2 NIW" para "Conheça nossas redes sociais", apontando para o Instagram https://www.instagram.com/statusamerica.br/.

Escopo:
- Editar src/routes/avaliacao.obrigado-qualificado.tsx.
- Substituir o <Link> interno para /vistos/$slug por um <a> externo para o Instagram, com target="_blank" e rel="noopener noreferrer".
- Manter o Button size="lg" e as classes btn-label h-12 px-6 para preservar o estilo atual.
- Não alterar texto, layout ou lógica das demais páginas (obrigado não qualificado, home, etc.).

Implementação técnica:
```tsx
<a
  href="https://www.instagram.com/statusamerica.br/"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button size="lg" className="btn-label h-12 px-6">
    Conheça nossas redes sociais
  </Button>
</a>
```

Validação:
- Verificar visualmente no preview se o botão aparece com o novo label e redireciona corretamente para o Instagram.