/**
 * Reads the real upload date and length of every project's Vimeo film and
 * writes them back into that project's frontmatter.
 *
 * Why this exists: Google needs `uploadDate` and `duration` to index a film,
 * and both have to describe the film the `vimeo:` id actually points at. Typing
 * them by hand means they silently go stale the moment an id changes. Run this
 * instead:
 *
 *   node scripts/sync-vimeo.mjs          # update the files
 *   node scripts/sync-vimeo.mjs --check  # report drift, change nothing
 *
 * It uses Vimeo's public oEmbed endpoint, so there is no API key to manage. A
 * film set to Unlisted still answers; one set to Private does not, and is
 * reported rather than guessed at.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = 'src/content/projects';
const checkOnly = process.argv.includes('--check');

/** 103 -> 'PT1M43S'. Seconds and minutes only; no film here runs to hours. */
const toISO = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m ? `${m}M` : ''}${s ? `${s}S` : ''}`;
};

/** Replaces `key: value` if present, otherwise inserts it after the vimeo line. */
const upsert = (text, key, value) => {
  const line = `${key}: '${value}'`;
  const existing = new RegExp(`^${key}:.*$`, 'm');
  if (existing.test(text)) return text.replace(existing, line);
  return text.replace(/^(vimeo: .*)$/m, `$1\n${line}`);
};

const files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));
let changed = 0;
let drifted = 0;
let failed = 0;

for (const file of files) {
  const path = join(DIR, file);
  const text = await readFile(path, 'utf8');
  const slug = file.replace(/\.md$/, '');

  const idMatch = text.match(/^vimeo:\s*'([^']+)'/m);
  if (!idMatch) {
    console.log(`${slug.padEnd(24)} no vimeo id — skipped`);
    continue;
  }
  // A private film's id carries a '?h=hash'; oEmbed wants the bare number.
  const id = idMatch[1].split('?')[0];

  let meta;
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    meta = await res.json();
  } catch (err) {
    console.error(`${slug.padEnd(24)} could not read ${id}: ${err.message}`);
    failed += 1;
    process.exitCode = 1;
    continue;
  }

  const published = meta.upload_date.slice(0, 10);
  const duration = toISO(meta.duration);

  const current = {
    published: text.match(/^published:\s*'([^']*)'/m)?.[1],
    durationISO: text.match(/^durationISO:\s*'([^']*)'/m)?.[1],
  };
  const stale = current.published !== published || current.durationISO !== duration;

  if (!stale) {
    console.log(`${slug.padEnd(24)} ok        ${published}  ${duration}`);
    continue;
  }

  drifted += 1;
  if (checkOnly) {
    console.log(
      `${slug.padEnd(24)} DRIFT     ${current.published ?? '—'} → ${published}` +
        `   ${current.durationISO ?? '—'} → ${duration}`,
    );
    continue;
  }

  let next = upsert(text, 'published', published);
  next = upsert(next, 'durationISO', duration);
  await writeFile(path, next);
  changed += 1;
  console.log(`${slug.padEnd(24)} updated   ${published}  ${duration}   "${meta.title}"`);
}

console.log(checkOnly ? `\n${drifted} file(s) out of date.` : `\n${changed} file(s) updated.`);

if (failed) {
  console.error(
    `${failed} film(s) could not be read, so nothing was changed for them. ` +
      `If every one failed, the usual cause is no network access to vimeo.com ` +
      `rather than a problem with the ids.`,
  );
} else if (checkOnly && drifted) {
  process.exitCode = 1;
}
