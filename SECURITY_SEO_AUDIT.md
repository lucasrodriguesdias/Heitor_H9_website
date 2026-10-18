# Auditoria de Cybersecurity, AppSec, SEO e Performance — H9

**Data da auditoria:** 18 de outubro de 2026  
**Aplicação:** site oficial de Heitor (H9)  
**URL de produção:** <https://heitor-h9.rodrigues-fortini.chatgpt.site>  
**Escopo:** código-fonte atual, dependências npm, build, prévia local e verificações HTTP não destrutivas da hospedagem.

## Resumo executivo

O H9 é uma aplicação de apresentação sem formulários, uploads, banco de dados ativo, analytics, armazenamento no navegador ou APIs próprias. A superfície de ataque em runtime é pequena: uma página React/Vinext renderizada no servidor, mídias estáticas locais e links HTTPS para WhatsApp e Instagram.

O principal risco confirmado era a árvore de dependências: o `npm audit` inicial indicou 30 ocorrências, incluindo uma vulnerabilidade crítica no Next.js e cinco ocorrências no conjunto de produção. As versões compatíveis foram atualizadas e o resultado final de `npm audit --omit=dev` é **zero vulnerabilidades conhecidas no conjunto de produção**. Permanecem 15 ocorrências no toolchain de desenvolvimento; o npm só propõe correções com downgrade ou breaking change, por isso não foi usado `--force`.

Também foram implementados CSP e cabeçalhos defensivos, metadados completos, canonical, Open Graph, Twitter Card, `robots.txt`, `sitemap.xml`, dados estruturados e WebP derivados. O peso agregado das oito imagens de conteúdo cai de 21,51 MiB em PNG para 1,99 MiB em WebP nos navegadores compatíveis, redução de 90,7%, mantendo os PNGs originais.

O principal impedimento de SEO em produção não está no HTML: o Site está com audiência `custom`, restrita ao proprietário. Requisições anônimas HTTPS retornam `401`, inclusive para `robots.txt` e `sitemap.xml`; portanto, buscadores não conseguem indexá-lo. Alterar a audiência para pública é uma decisão de produção e não foi feita automaticamente.

Nenhum sistema é invulnerável. Os riscos residuais e limitações estão documentados abaixo.

## Inventário técnico

| Item | Estado auditado |
|---|---|
| Runtime | Cloudflare Workers por meio do Sites |
| Framework | Next.js 16.4.2 sobre Vinext 1.2.1 |
| UI | React/React DOM 19.3.1 |
| Build | Vite 8.3.4, TypeScript 5.9.3, Tailwind CSS 4.2.1 |
| Animação | GSAP 3.15.0 e ScrollTrigger |
| Dependências | 868 pacotes totais reportados pelo npm; 198 de produção, 631 de desenvolvimento, 193 opcionais e 44 peers (categorias podem se sobrepor) |
| Rotas | `/`, `/robots.txt`, `/sitemap.xml`; não há rotas API da aplicação |
| Persistência | D1 e R2 desativados (`null`); schema vazio |
| Entradas de usuário | Nenhum formulário, upload, parâmetro de URL ou conteúdo remoto renderizado |
| Integrações externas | WhatsApp e Instagram por links HTTPS; Google Fonts para CSS/fontes |
| Dados no navegador | Nenhum uso de `localStorage`, `sessionStorage`, cookies próprios ou analytics |
| Mídias | 8 PNGs originais, 8 WebPs derivados, ícones locais e 1 MP4 local de 7,63 MiB |
| Segredos | Nenhum `.env`, chave, token, senha ou credencial encontrado no código rastreado ou no diretório público |
| Build público | Nenhum source map encontrado em `dist/client`; mapas internos existem somente no bundle do servidor |

### Mapa de superfície de ataque

1. Visitante acessa o gateway HTTPS do Sites.
2. O gateway aplica a política de audiência atual e, quando autorizado, encaminha a requisição ao Worker.
3. O Worker executa Vinext/Next e devolve HTML, CSS, JavaScript e mídias locais.
4. A página não envia dados para uma API própria; ações externas abrem WhatsApp ou Instagram em nova aba.
5. O vídeo local é controlado por scroll no cliente, sem upload ou conteúdo fornecido pelo usuário.

## Vulnerabilidades e achados

| ID | Problema | Severidade | Evidência | Impacto | Correção | Status |
|---|---|---:|---|---|---|---|
| SEC-001 | Next.js 16.3.4 vulnerável | CRÍTICA | `npm audit` inicial: cadeia crítica e outras falhas no pacote `next` | RCE em recurso específico, SSRF/cache poisoning e divulgação conforme as condições de cada advisory | Atualizado para Next.js 16.4.2; React/RSC alinhados em 19.3.1 | CORRIGIDO |
| SEC-002 | Dependências de produção vulneráveis | ALTA | Auditoria inicial de produção: 1 crítica, 2 altas e 2 moderadas | Risco de disponibilidade, parsing e comportamento de framework | Atualizações compatíveis e `npm audit fix` sem `--force` | CORRIGIDO — 0 em produção |
| SEC-003 | Cabeçalhos defensivos ausentes na aplicação | MÉDIA | Respostas anteriores não tinham CSP, XFO, XCTO ou Permissions-Policy | Clickjacking, MIME sniffing e maior impacto de uma eventual injeção | CSP, HSTS, `nosniff`, `DENY`, Referrer-Policy e Permissions-Policy adicionados no Worker | CORRIGIDO LOCALMENTE; verificar após deploy |
| SEC-004 | Links externos não declaravam `noopener` explicitamente | BAIXA | Links `_blank` usavam apenas `noreferrer` | Clareza e defesa adicional contra controle de `window.opener` | Todos os links externos agora usam `rel="noopener noreferrer"` | CORRIGIDO |
| SEC-005 | `dangerouslySetInnerHTML` no componente de gráfico vendorizado | BAIXA | `components/ui/chart.tsx` gera variáveis CSS a partir de configuração | Potencial de injeção CSS se futuramente receber configuração não confiável | Componente não é importado nem empacotado na página atual; manter dados exclusivamente confiáveis ou validar cores/IDs antes de uso | MITIGADO / NÃO EXPOSTO |
| SEC-006 | 15 ocorrências no toolchain de desenvolvimento | MÉDIA | `npm audit` final: 8 altas e 7 moderadas; `npm audit --omit=dev`: 0 | Afeta lint/build/dev server, não o bundle de produção auditado | Não aplicar `--force`; npm propõe downgrades/breaking changes em Vinext, ESLint ou Drizzle. Monitorar releases compatíveis | PENDENTE CONTROLADO |
| SEC-007 | CSP ainda requer scripts e estilos inline | BAIXA | Next/Vinext injeta bootstrap/hidratação e estilos inline | Reduz a força da CSP contra certas formas de XSS | `unsafe-eval` permanece apenas em desenvolvimento; produção não usa `unsafe-eval`. Não há conteúdo HTML não confiável na aplicação | RISCO RESIDUAL |
| HOST-001 | Gateway anônimo não expõe os headers do Worker | MÉDIA | HTTPS anônimo retorna `401`, `Cache-Control: no-store` e `Referrer-Policy: no-referrer`, sem os demais headers | Cabeçalhos do app só são observáveis depois da autorização | Cabeçalhos implementados no Worker; camada de autenticação é controlada pela hospedagem | PENDÊNCIA DA PLATAFORMA |
| SEO-001 | Site não indexável devido à audiência privada/custom | ALTA (SEO) | Produção devolveu `401` para `/`, `/robots.txt` e `/sitemap.xml` | Google e outros crawlers não conseguem rastrear ou indexar | Tornar público somente com aprovação explícita do proprietário | PENDENTE DE DECISÃO |
| SEO-002 | Metadados técnicos incompletos | MÉDIA | Faltavam canonical, Twitter Card, URL OG, sitemap, robots e dados estruturados | Menor controle de indexação e compartilhamento | Implementados canonical, OG, Twitter, Person/WebSite JSON-LD, robots e sitemap | CORRIGIDO |
| SEO-003 | Imagens muito pesadas | ALTA (performance) | 21,51 MiB em oito PNGs | LCP e transferência mobile prejudicados | WebP qualidade 84 com fallback PNG; total WebP 1,99 MiB (-90,7%) | CORRIGIDO |
| SEO-004 | Fontes externas sem aquecimento de conexão | BAIXA | CSS importa Google Fonts | Atraso de renderização e possível impacto no LCP | `preconnect` para `fonts.googleapis.com` e `fonts.gstatic.com`; `font-display=swap` já presente na URL | CORRIGIDO |
| PERF-001 | Seeking excessivo poderia travar o vídeo | MÉDIA | Hook controla `currentTime` durante eventos de scroll | Sobrecarga do decoder, sobretudo mobile | Scroll agrupado em `requestAnimationFrame`, uma busca por vez e fila do último alvo | CORRIGIDO E TESTADO |
| PRIV-001 | Processamento de terceiros não é descrito no site | INFORMATIVA | Não há coleta própria; hospedagem e links externos podem tratar dados técnicos | Transparência futura caso analytics/formulários sejam adicionados | Não adicionar banner de cookies sem cookies/analytics; revisar transparência se o escopo mudar | MONITORAR |

## Segurança

### XSS e injeção

- Não há entrada de usuário, renderização de parâmetros de URL, HTML remoto, `innerHTML`, `eval` de produção ou `document.write` no código da página.
- React faz escaping do conteúdo textual.
- O único `dangerouslySetInnerHTML` está em um componente vendorizado de gráficos que não é importado pela aplicação atual. Se usado no futuro, as cores e chaves do gráfico devem vir de configuração confiável ou ser validadas.
- JSON-LD é gerado somente de constantes locais e não incorpora dados do visitante.

### Exposição de dados e segredos

- Não foram encontrados `.env`, chaves, tokens, senhas, PEMs ou URLs administrativas no código rastreado e no diretório público.
- `.env*`, `*.pem`, builds, estado local do Wrangler e diretórios de ferramentas estão no `.gitignore`.
- Não há variáveis `VITE_*` na aplicação. Qualquer variável futura com esse prefixo deve ser considerada pública.
- O build público do cliente não contém source maps.
- Gitleaks e Semgrep não estavam instalados; foi feita busca estática por padrões sensíveis e sinks conhecidos. O histórico Git não foi reescrito nem apagado.

### Dependências e supply chain

- O lockfile v3 registra integridade para pacotes npm.
- Atualizações aplicadas: Next 16.4.2, React/React DOM/RSC 19.3.1, Vinext 1.2.1, Vite 8.3.4, Cloudflare Vite Plugin 1.64.0, Wrangler 4.151.1 e Sharp 0.35.5.
- Instalação feita com `--ignore-scripts`, reduzindo risco de scripts de instalação.
- Antes: 30 ocorrências no audit completo e 5 em produção, incluindo 1 crítica.
- Depois: 15 ocorrências somente em desenvolvimento e 0 em produção.
- Não foi executado `npm audit fix --force` porque o npm propõe downgrades/breaking changes incompatíveis com o stack atual.

### Links externos

- WhatsApp: `https://wa.link/7euh5l`.
- Instagram: `https://www.instagram.com/heitorr.h/`.
- URLs são constantes locais, usam HTTPS e não recebem parâmetros fornecidos pelo visitante.
- Todos os links em nova aba usam `noopener noreferrer`.
- Não há open redirect. O helper de autenticação do starter aceita somente caminhos relativos na mesma origem e rejeita `//`, origens externas e rotas reservadas.

### CSP e security headers

Política aplicada pelo Worker:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob:;
media-src 'self';
connect-src 'self';
upgrade-insecure-requests
```

Outros headers:

```text
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

`unsafe-eval` é incluído apenas pelo ambiente de desenvolvimento para as ferramentas de depuração do React/Vite. O build de produção não o inclui. `unsafe-inline` permanece necessário para o bootstrap atual de Next/Vinext e estilos inline; migrar para nonces exigiria suporte coordenado do framework/hospedagem.

### HTTPS e hospedagem

- HTTP de produção respondeu com redirecionamento `302` para HTTPS.
- O handshake HTTPS funcionou.
- A aplicação está protegida pela audiência `custom`; requisições anônimas retornam `401` e `Cache-Control: no-store`.
- A prévia local devolveu `404` real para rota inexistente.
- Não há CORS de API, directory listing, backups ou arquivos de configuração expostos no diretório público identificado.
- Métodos HTTP e headers do gateway autenticado não foram testados com credenciais fora do fluxo do app.

### Privacidade e LGPD

O código da aplicação não coleta nome, telefone, e-mail, IP, cookies, analytics, formulários ou dados de navegação. Não existe base técnica para adicionar banner de cookies neste momento. A plataforma de hospedagem e os destinos externos podem processar dados técnicos ou de conta segundo suas próprias políticas. Se analytics, formulário ou pixels forem adicionados, deve haver nova avaliação de finalidade, base legal, retenção e transparência.

## SEO técnico

### Metadados e semântica

- `<html lang="pt-BR">`, charset/viewport do framework, title e description conforme o briefing.
- Canonical absoluto para a URL conhecida de produção.
- Open Graph com URL, título, descrição, site name, imagem e dimensões reais `1672×941`.
- Twitter Card `summary_large_image`.
- Favicon local.
- Exatamente um H1; hierarquia H2/H3 coerente; `header`, `nav`, `main`, `section` e `footer` presentes.
- Botões são usados para ações locais da galeria/menu; links são usados para navegação e destinos externos.
- Imagens informativas da galeria têm `alt`; fundos decorativos usam `alt=""`.

### Indexação e renderização

- `/robots.txt` local: `200 text/plain`, permite `/` e referencia o sitemap.
- `/sitemap.xml` local: `200 application/xml`, inclui somente a página canônica.
- A página e metadados são entregues no HTML inicial: H1, texto principal, canonical e JSON-LD foram encontrados por requisição HTTP sem executar JavaScript.
- O conteúdo principal não depende exclusivamente de client-side rendering.
- Produção continua não indexável enquanto a audiência for `custom` e o gateway responder `401`.

### Dados estruturados

- Incluídos `WebSite` e `Person` com informações presentes no site: Heitor/H9, URL, idioma, descrição e Instagram.
- Não foram adicionados prêmios, estatísticas, conquistas ou breadcrumbs inexistentes.
- `VideoObject` não foi adicionado: faltam uma página/dados de publicação próprios do vídeo e campos necessários para uma marcação confiável.

### Imagens, vídeo e fontes

- PNGs originais preservados.
- Oito WebPs derivados em qualidade 84 com fallback por `<picture>`.
- Transferência potencial das imagens de conteúdo: 21,51 MiB em PNG contra 1,99 MiB em WebP.
- Imagens abaixo da dobra usam lazy loading; hero usa prioridade alta.
- O vídeo MP4 local tem 7,63 MiB, poster WebP, fallback textual, `playsInline` e `muted`.
- O formato e as dimensões do vídeo foram verificados no navegador: MP4 reproduzível, `1280×720`, duração aproximada de `10,005s`.
- Não foi possível inspecionar codec, bitrate e distribuição de keyframes porque `ffprobe` não está instalado. Reencodificação não foi feita para preservar o conteúdo e evitar regressão no scrub.
- Fontes Google usam `display=swap` e conexões pré-aquecidas.

## Performance e scroll cinematográfico

O hook atual:

- registra um único listener passivo de scroll e um listener de resize;
- agrupa atualizações em `requestAnimationFrame`;
- evita iniciar nova alteração de `currentTime` durante `seeking`;
- guarda somente o alvo mais recente;
- ignora diferenças inferiores a 35 ms;
- remove listeners e cancela RAFs no cleanup;
- funciona em avanço e retorno;
- desativa o seeking automático com `prefers-reduced-motion` e mostra uma experiência alternativa;
- mantém a seção sticky e libera o fluxo depois do fim da altura definida.

Teste mobile em viewport `390×844`:

- início da seção: `currentTime=0`, `readyState=4`;
- avanço: `currentTime=5,688571`, etapa 4 de 6, sem seek pendente;
- retorno: `currentTime=2,844285`, etapa 2 de 6, sem seek pendente.

Não foi possível produzir Lighthouse confiável neste ambiente. LCP, CLS e INP de laboratório/field data devem ser medidos após o site estar público e sem o gateway `401`. A redução de imagens beneficia LCP, mas não substitui dados de usuários reais.

## Testes executados

| Teste | Resultado |
|---|---|
| `npm audit --json` antes | 30 ocorrências: 1 crítica, 21 altas, 7 moderadas e 1 baixa |
| `npm audit --omit=dev --json` antes | 5 ocorrências em produção: 1 crítica, 2 altas e 2 moderadas |
| `npm audit fix --ignore-scripts` | Aplicou somente atualizações sem `--force`; recusou breaking changes |
| `npm audit --json` depois | 15 ocorrências somente no toolchain: 8 altas e 7 moderadas |
| `npm audit --omit=dev --json` depois | 0 vulnerabilidades conhecidas |
| `npm outdated --json` | Executado; atualizações de segurança selecionadas após análise de peers |
| `npm ls --all --json` / `npm ls --depth=0` | Árvore instalada e dependências diretas inspecionadas |
| Busca estática com `rg` | Sem segredos, storage, parâmetros de URL, HTML dinâmico ou sinks ativos na página |
| TypeScript `tsc --noEmit` | Passou sem erros |
| `npm run lint` | Passou com zero erros e zero avisos |
| `npm run build` | Passou; build Vinext/Vite concluído |
| HTTP local `/` | `200`, HTML inicial com conteúdo e metadados |
| HTTP local `/robots.txt` | `200 text/plain` |
| HTTP local `/sitemap.xml` | `200 application/xml` |
| HTTP local rota inexistente | `404` |
| Headers locais | CSP, HSTS, XCTO, XFO, Referrer-Policy e Permissions-Policy presentes |
| Desktop visual | Hero, navegação, links e composição preservados |
| Mobile `390×844` | Hero e menu cobrindo corretamente a viewport; links sociais presentes |
| Console limpo | Zero erros/avisos em uma sessão nova após ajuste da CSP de desenvolvimento |
| Scroll-video | Avanço e retorno funcionais, vídeo pronto (`readyState=4`) |
| Produção HTTP/HTTPS | HTTP redireciona para HTTPS; HTTPS anônimo retorna `401` por audiência custom |

## Pendências de produção

1. **Indexação:** decidir se o Site deve ser público. Enquanto `access_mode=custom`, nenhum crawler poderá acessar página, robots ou sitemap.
2. **Headers do gateway:** os headers do Worker foram verificados localmente. A resposta `401` do gateway ocorre antes do Worker e não pode ser corrigida no código da página.
3. **Core Web Vitals:** executar Lighthouse/CrUX após publicação pública, preferencialmente em mobile e em rede simulada, distinguindo laboratório de dados reais.
4. **Vídeo:** medir bitrate/keyframes com `ffprobe` em ambiente apropriado. Só reencodar após comparação visual e teste de scrub em dispositivos reais.
5. **Toolchain:** acompanhar atualizações de Vinext, ESLint Next e Drizzle que resolvam as 15 ocorrências de desenvolvimento sem downgrade/breaking change.
6. **CSP avançada:** avaliar nonces/hashes quando Vinext/Sites oferecer suporte estável, eliminando `unsafe-inline` de scripts.

## Recomendações futuras priorizadas

| Prioridade | Ação | Risco/Custo | Benefício esperado |
|---|---|---|---|
| P0 | Definir se o site deve ser público | Baixo custo; decisão de acesso | Torna SEO e compartilhamento público possíveis |
| P1 | Medir CWV em produção pública | Baixo custo | Evidência real de LCP, CLS e INP |
| P1 | Monitorar `npm audit --omit=dev` no CI | Baixo custo | Detecta regressões de segurança em produção |
| P1 | Atualizar toolchain quando houver fixes compatíveis | Médio | Elimina riscos residuais de build/dev |
| P2 | Avaliar keyframes/bitrate do MP4 | Médio | Scrub ainda mais fluido em celulares modestos |
| P2 | Migrar CSP para nonce/hash quando suportado | Médio/alto | Defesa mais forte contra XSS |
| P3 | Remover componentes/dependências starter não usados em uma revisão dedicada | Médio | Reduz superfície de supply chain e tempo de instalação |

## Conclusão

O projeto ficou significativamente mais seguro e mais preparado para SEO e performance, sem alterar identidade visual, imagens originais, patrocínios, vídeo ou experiência cinematográfica. O conjunto de produção não apresenta vulnerabilidades conhecidas segundo o npm audit executado nesta data. A principal limitação atual é operacional: a audiência privada impede indexação e também limita a verificação anônima da resposta final do Worker em produção.
