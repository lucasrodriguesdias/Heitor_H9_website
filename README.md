# H9 — Heitor

Site oficial de Heitor, o H9: uma experiência responsiva sobre sua história no futebol, com animações GSAP, galeria e vídeo controlado pela rolagem.

## Site publicado

[https://lucasrodriguesdias.github.io/Heitor_H9_website/](https://lucasrodriguesdias.github.io/Heitor_H9_website/)

## Desenvolvimento local

Requer Node.js 22 ou superior.

```bash
npm ci
npm run dev
```

O preview Vinext inicia normalmente em `http://localhost:5173`.

## Builds

### GitHub Pages

```bash
npm run build:pages
```

O comando usa o compilador oficial do Next.js com exportação estática, aplica o prefixo `/Heitor_H9_website`, grava a saída em `out/` e inclui `out/.nojekyll`.

### Ambiente Sites/Cloudflare

```bash
npm run build
```

Este comando mantém o fluxo Vinext/Cloudflare original separado do build estático do GitHub Pages.

## Publicação automática

O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) executa em pushes para `main` ou `master` e também pode ser iniciado manualmente. Ele:

1. instala as dependências com `npm ci`;
2. gera a exportação estática em `out/`;
3. valida `index.html`, `.nojekyll`, o vídeo e os caminhos prefixados;
4. envia somente a saída compilada para o GitHub Pages;
5. publica usando as Actions oficiais do GitHub.

No repositório, configure **Settings → Pages → Build and deployment → Source** como **GitHub Actions**.

## Estrutura principal

- `app/`: página, layout, SEO, robots e sitemap;
- `components/`: seções visuais e componentes interativos;
- `hooks/use-scroll-video.ts`: sincronização do vídeo com a rolagem;
- `public/assets/`: imagens, ícones e vídeo;
- `config/site.ts`: URLs, navegação e caminhos públicos;
- `next.config.ts`: configuração condicional do export para GitHub Pages.
