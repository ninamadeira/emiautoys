// Gera ilustrações originais em WebP (600x600) para o catálogo. Uso: node scripts/gerar-imagens.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SIZE = 600;
const OUTPUT_DIRECTORY = new URL('../public/imagens/', import.meta.url);

const PRODUCTS = [
  { id: 'varinha-pena', kind: 'wand', background: '#ece6ff', accent: '#5a35c2' },
  { id: 'varinha-ratinho', kind: 'wand', background: '#ffe9d6', accent: '#c25a1a' },
  { id: 'bolinhas-kit', kind: 'balls', background: '#e1f5ea', accent: '#1b6e3c' },
  { id: 'bolinha-guizo', kind: 'balls', background: '#fff1d6', accent: '#9a5b00' },
  { id: 'arranhador-papelao', kind: 'scratcher', background: '#f3e8dc', accent: '#8a5a2b' },
  { id: 'arranhador-poste', kind: 'post', background: '#f3e8dc', accent: '#7a4a1f' },
  { id: 'tunel-tres-saidas', kind: 'tunnel', background: '#e0efff', accent: '#255a9a' },
  { id: 'catnip-organico', kind: 'leaf', background: '#e1f5ea', accent: '#1b6e3c' },
  { id: 'brinquedo-pista', kind: 'track', background: '#ffe3ee', accent: '#b01f5b' },
  { id: 'brinquedo-automatico', kind: 'auto', background: '#e8e8ff', accent: '#3b2a73' },
];

const SHAPES = {
  wand: (c) => `<linha x1="140" y1="470" x2="400" y2="190" stroke="${c}" stroke-width="18" stroke-linecap="round"/>
    <path d="M400 190 q60 -110 120 -40 q-40 20 -50 70 q-40 -10 -70 -30z" fill="${c}" opacity=".85"/>
    <circle cx="150" cy="460" r="26" fill="${c}"/>`,
  balls: (c) => `<circle cx="230" cy="330" r="90" fill="${c}"/><circle cx="390" cy="260" r="70" fill="${c}" opacity=".7"/>
    <circle cx="380" cy="420" r="55" fill="${c}" opacity=".5"/><path d="M180 300 q50 -40 100 0" stroke="#fff" stroke-width="10" fill="none" opacity=".6"/>`,
  scratcher: (c) => `<rect x="110" y="250" width="380" height="170" rx="26" fill="${c}"/>
    ${[150, 200, 250, 300, 350, 400, 450].map((x) => `<linha x1="${x}" y1="270" x2="${x}" y2="400" stroke="#fff" stroke-width="8" opacity=".5"/>`).join('')}`,
  post: (c) => `<rect x="240" y="120" width="120" height="330" rx="20" fill="${c}"/>
    ${[160, 210, 260, 310, 360, 410].map((y) => `<linha x1="240" y1="${y}" x2="360" y2="${y}" stroke="#fff" stroke-width="8" opacity=".5"/>`).join('')}
    <rect x="150" y="450" width="300" height="40" rx="14" fill="${c}" opacity=".8"/>`,
  tunnel: (c) => `<path d="M110 440 v-120 a190 190 0 0 1 380 0 v120z" fill="${c}"/>
    <path d="M200 440 v-90 a100 100 0 0 1 200 0 v90z" fill="#fff" opacity=".35"/>`,
  leaf: (c) => `<path d="M300 460 C180 380 190 220 300 130 C410 220 420 380 300 460z" fill="${c}"/>
    <linha x1="300" y1="450" x2="300" y2="190" stroke="#fff" stroke-width="8" opacity=".6"/>`,
  track: (c) => `<circle cx="300" cy="300" r="170" fill="none" stroke="${c}" stroke-width="30"/>
    <circle cx="300" cy="300" r="105" fill="none" stroke="${c}" stroke-width="24" opacity=".6"/><circle cx="300" cy="130" r="30" fill="${c}"/>`,
  auto: (c) => `<rect x="160" y="400" width="280" height="70" rx="22" fill="${c}"/>
    <linha x1="300" y1="400" x2="300" y2="230" stroke="${c}" stroke-width="16"/>
    <path d="M300 230 q-120 -40 -150 -120 M300 230 q120 -40 150 -120" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/>`,
};

function buildSvg({ background, kind, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" fill="${background}"/>${SHAPES[kind](accent)}</svg>`;
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
for (const produto of PRODUCTS) {
  const buffer = await sharp(Buffer.from(buildSvg(produto))).webp({ quality: 82 }).toBuffer();
  await writeFile(new URL(`${produto.id}.webp`, OUTPUT_DIRECTORY), buffer);
}
