/**
 * Generates the placeholder images and videos in public/media/.
 *
 *   npm run placeholders
 *
 * These exist so the site is viewable before your real renders arrive. Every
 * file it writes is disposable: drop a real image or video in on top of it,
 * keeping the same filename, and nothing else needs to change.
 *
 * Images are drawn as SVG and rasterised with sharp (already a dependency of
 * Astro). Videos need ffmpeg on your PATH — if it is missing, the images are
 * still written and the videos are skipped with a warning.
 */

import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = join(ROOT, 'public', 'media');

const ACCENT = '#097c87';
const CORAL = '#fca47c';
const INK = '#10282b';

/* ---------------------------------------------------------------------------
 * The image drawing
 * ------------------------------------------------------------------------ */

/** An isometric wireframe cube: a hexagon with three spokes to its centre. */
function isoCube(cx, cy, r, stroke, opacity, width) {
  const point = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const hex = [30, 90, 150, 210, 270, 330].map(point);
  const outline = hex.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const spokes = [30, 150, 270]
    .map(point)
    .map(
      ([x, y]) =>
        `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`,
    )
    .join('');

  return `<g stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}" fill="none" stroke-linejoin="round">
    <polygon points="${outline}" />
    ${spokes}
  </g>`;
}

function svgFor({ width, height, label }) {
  const cx = width * 0.5;
  const cy = height * 0.46;
  const r = Math.min(width, height) * 0.22;
  const pad = Math.round(Math.min(width, height) * 0.055);
  const titleSize = Math.max(15, Math.round(Math.min(width, height) * 0.045));
  const metaSize = Math.max(10, Math.round(titleSize * 0.5));
  const tick = Math.round(pad * 0.6);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="fine" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#097c87" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
    <pattern id="coarse" width="200" height="200" patternUnits="userSpaceOnUse">
      <path d="M200 0H0V200" fill="none" stroke="#097c87" stroke-opacity="0.1" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="${CORAL}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${CORAL}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.7"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="#f5faf8"/>
  <rect width="${width}" height="${height}" fill="url(#fine)"/>
  <rect width="${width}" height="${height}" fill="url(#coarse)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>

  ${isoCube(cx, cy, r * 1.32, INK, 0.12, 1)}
  ${isoCube(cx, cy, r, ACCENT, 0.75, 2)}

  <rect width="${width}" height="${height}" fill="url(#floor)"/>

  <g stroke="${ACCENT}" stroke-opacity="0.5" stroke-width="2" fill="none">
    <path d="M${pad} ${pad + tick}V${pad}H${pad + tick}"/>
    <path d="M${width - pad - tick} ${pad}H${width - pad}V${pad + tick}"/>
    <path d="M${pad} ${height - pad - tick}V${height - pad}H${pad + tick}"/>
    <path d="M${width - pad - tick} ${height - pad}H${width - pad}V${height - pad - tick}"/>
  </g>

  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="${INK}">
    <text x="${pad}" y="${height - pad - metaSize * 1.9}" font-size="${titleSize}" font-weight="700" letter-spacing="-0.5">${escapeXml(label)}</text>
    <text x="${pad}" y="${height - pad}" font-size="${metaSize}" font-weight="600" letter-spacing="2" fill="${ACCENT}" fill-opacity="1">PLACEHOLDER — ${width} × ${height}</text>
  </g>
</svg>`;
}

const escapeXml = (s) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

/* ---------------------------------------------------------------------------
 * What to generate
 *
 * ratio keys: 'wide' = 16:9, 'photo' = 3:2, 'banner' = 21:9, 'og' = social
 * `video: true` also renders an animated MP4 of the same name.
 * ------------------------------------------------------------------------ */

const SIZES = {
  wide: [1600, 900],
  photo: [1500, 1000],
  banner: [1680, 720],
  og: [1200, 630],
};

const FILES = [
  { name: 'hero-poster', ratio: 'wide', label: 'Hero background', video: 'hero' },
  { name: 'og-default', ratio: 'og', label: 'Social share image' },
  { name: 'about-hero', ratio: 'banner', label: 'About — studio banner' },

  { name: 'saas-onboarding', ratio: 'wide', label: 'SaaS Onboarding Series', video: true },
  { name: 'saas-onboarding-01', ratio: 'photo', label: 'Highlighted interface' },
  { name: 'saas-onboarding-02', ratio: 'photo', label: 'Storyboard frames' },

  { name: 'cpd-client-care', ratio: 'wide', label: 'Client Care CPD Series', video: true },
  { name: 'cpd-client-care-01', ratio: 'photo', label: 'Scenario scene' },
  { name: 'cpd-client-care-02', ratio: 'photo', label: 'Knowledge check' },

  { name: 'fintech-payments', ratio: 'wide', label: 'Open Banking Explainer', video: true },
  { name: 'fintech-payments-01', ratio: 'wide', label: 'Payment flow illustration' },

  { name: 'patient-pathway', ratio: 'photo', label: 'Patient Pathway Explainer' },
  { name: 'patient-pathway-01', ratio: 'photo', label: 'Arriving at reception' },
  { name: 'patient-pathway-02', ratio: 'photo', label: 'What to bring' },

  { name: 'council-bilingual', ratio: 'wide', label: 'Bilingual Public Service' },
  { name: 'council-bilingual-01', ratio: 'wide', label: 'English and Irish versions' },

  { name: 'height-safety', ratio: 'wide', label: 'Working at Height Talk', video: true },
  { name: 'height-safety-01', ratio: 'wide', label: 'Safe vs unsafe set-up' },

  { name: 'feature-release', ratio: 'wide', label: 'Feature Release Demo' },
  { name: 'feature-release-01', ratio: 'wide', label: 'New feature in use' },

  { name: 'student-onboarding', ratio: 'photo', label: 'Student Onboarding' },
];

/* ---------------------------------------------------------------------------
 * Run
 * ------------------------------------------------------------------------ */

async function hasFfmpeg() {
  try {
    await execFileAsync('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Turns a still into a short seamless loop: an orange line sweeps across it,
 * like a scanner passing over the model.
 */
async function makeVideo(posterPath, outPath) {
  const sweep = 'mod(t/6,1)';
  const filters = [
    `drawbox=x='(${sweep})*(iw+240)-200':y=0:w=90:h=ih:color=${ACCENT.replace('#', '0x')}@0.10:t=fill`,
    `drawbox=x='(${sweep})*(iw+240)-120':y=0:w=3:h=ih:color=${ACCENT.replace('#', '0x')}@0.85:t=fill`,
  ].join(',');

  await execFileAsync('ffmpeg', [
    '-y',
    '-loglevel', 'error',
    '-loop', '1',
    '-i', posterPath,
    '-t', '6',
    '-r', '25',
    '-vf', filters,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '26',
    '-pix_fmt', 'yuv420p',
    // Lets the browser start playing before the whole file has downloaded.
    '-movflags', '+faststart',
    outPath,
  ]);
}

async function main() {
  await mkdir(MEDIA, { recursive: true });
  const ffmpeg = await hasFfmpeg();
  if (!ffmpeg) {
    console.warn('! ffmpeg not found — writing images only, skipping the MP4s.');
  }

  let images = 0;
  let videos = 0;

  for (const file of FILES) {
    const [width, height] = SIZES[file.ratio];
    const svg = svgFor({ width, height, label: file.label });
    const jpgPath = join(MEDIA, `${file.name}.jpg`);

    await sharp(Buffer.from(svg)).jpeg({ quality: 82, progressive: true }).toFile(jpgPath);
    images++;

    if (file.video && ffmpeg) {
      const videoName = typeof file.video === 'string' ? file.video : file.name;
      await makeVideo(jpgPath, join(MEDIA, `${videoName}.mp4`));
      videos++;
    }
  }

  // The favicon (public/favicon.svg) is hand-drawn from the brand palette
  // and is no longer generated here.

  console.log(`✓ ${images} images and ${videos} videos written to public/media/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
