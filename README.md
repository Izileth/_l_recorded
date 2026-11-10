# Lyricards

MVP para transformar trechos de música em imagens para redes sociais.
Stack: React + Vite + TypeScript + Tailwind CSS v4.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # type-check + build de produção
```

## Recursos

- Digite ou cole um trecho; uma **linha em branco cria um novo slide** (carrossel).
- Importe **.lrc** ou **.txt** (arraste ou escolha o arquivo), clique nas linhas (Shift = intervalo) e o trecho é montado sozinho. Título/artista do `.lrc` viram o crédito.
- 4 templates (Impact, Duo, Minimal, Sunset), formatos 1:1, 4:5 e 9:16.
- Quebra automática por largura, ajuste automático de tamanho da fonte, caixa alta, destaque da última linha, alinhamento, cores e gradiente.
- Exporta **PNG** (1080 px de largura), copia a imagem ou baixa todos os slides em **ZIP**.
- Tudo é salvo no navegador (localStorage).

## Estrutura

```
src/
  App.tsx                 estado, persistência e exportação
  components/             Card, Preview, SnippetEditor, LyricsPanel, DesignPanel, ui
  lib/                    lrc (parser), text (quebra/slides), templates, export
```

Para criar um template novo, adicione uma entrada em `src/lib/templates.ts` e o estilo
das linhas em `lineStyle()` no `src/components/Card.tsx`.
