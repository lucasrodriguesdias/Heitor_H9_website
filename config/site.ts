export const SITE_URL =
  "https://lucasrodriguesdias.github.io/Heitor_H9_website/";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}

export const WHATSAPP_URL = "https://wa.link/7euh5l";
export const INSTAGRAM_URL = "https://www.instagram.com/heitorr.h/";
export const navigation = [
  { label: "Home", href: "#home" }, { label: "Jornada", href: "#jornada" },
  { label: "História", href: "#historia" }, { label: "Destaques", href: "#destaques" },
  { label: "Galeria", href: "#galeria" }, { label: "Contato", href: "#contato" },
];
export const whatsappHref = WHATSAPP_URL;
export const socialLinks = [
  { label: "WhatsApp", href: WHATSAPP_URL, icon: assetPath("/assets/icons/whatsapp.png") },
  { label: "Instagram", href: INSTAGRAM_URL, icon: assetPath("/assets/icons/instagram.png") },
];
export const storyMoments = [
  { kicker: "A presença", title: "HEITOR 9", subtitle: "DECISIVO POR NATUREZA.", detail: "23 ANOS · BELO HORIZONTE · CAMISA 9" },
  { kicker: "A origem", title: "DO COMPLEXO DO IAPI PARA O FUTEBOL.", detail: "Foi na escolinha do América que a paixão ganhou seus primeiros capítulos." },
  { kicker: "Além das quatro linhas", title: "CORPO EM EVOLUÇÃO. MENTE EM FOCO.", detail: "Educação Física · Fisiculturismo · Disciplina dentro e fora do campo." },
  { kicker: "A mentalidade", title: "A FÉ MOVE. A DISCIPLINA SUSTENTA.", detail: "Focado, determinado e guiado por Deus." },
  { kicker: "O golaço", title: "NA HORA DE DECIDIR, O 9 APARECE.", detail: "Um toque. Um chute. Uma decisão." },
  { kicker: "A comemoração", title: "GLÓRIA A DEUS.", subtitle: "H9. O HOMEM DA DECISÃO.", detail: "CONVOCAR O H9" },
];
export const gameTraits = [
  { number: "01", title: "CONTROLE", text: "Frieza para dominar. Visão para jogar." },
  { number: "02", title: "POSICIONAMENTO", text: "No lugar certo, na hora certa." },
  { number: "03", title: "FINALIZAÇÃO", text: "Quando a oportunidade aparece, o 9 resolve." },
  { number: "04", title: "COMEMORAÇÃO", text: "Porque gol bom merece comemoração." },
];
export const galleryItems = [
  { desktop: assetPath("/assets/desktop/01_hero_desktop.png"), mobile: assetPath("/assets/mobile/01_hero_mobile.png"), alt: "Composição esportiva de Heitor segurando a bola no estádio", label: "Presença" },
  { desktop: assetPath("/assets/desktop/02_historia_desktop.png"), mobile: assetPath("/assets/mobile/02_historia_mobile.png"), alt: "Heitor diante da paisagem urbana de Belo Horizonte", label: "Origem" },
  { desktop: assetPath("/assets/desktop/03_destaque_desktop.png"), mobile: assetPath("/assets/mobile/03_destaque_mobile.png"), alt: "Montagem de Heitor em momentos de jogo e comemoração", label: "Decisão" },
  { desktop: assetPath("/assets/desktop/05_cta_desktop.png"), mobile: assetPath("/assets/mobile/05_cta_mobile.png"), alt: "Heitor em quadra ao pôr do sol", label: "Convocação" },
];
