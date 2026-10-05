import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { CardSchema } from '../packages/shared/dist/index.js';

type SourceCard = {
  type: 'major' | 'minor';
  name: string;
  value_int: number;
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  meaning_up: string;
  meaning_rev: string;
};

type CommonsImageInfo = {
  url: string;
  thumburl?: string;
  extmetadata?: {
    LicenseShortName?: { value?: string };
  };
};

type CommonsPage = {
  title: string;
  imageinfo?: CommonsImageInfo[];
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cardOutput = resolve(root, 'apps/web/src/content/cards.json');
const publicCardOutput = resolve(root, 'apps/web/public/cards.json');
const imageOutput = resolve(root, 'apps/web/public/cards');
const commonsApi = 'https://commons.wikimedia.org/w/api.php';
const titleAliases: Record<string, string> = {
  Fortitude: 'Strength',
  'Wheel Of Fortune': 'Wheel of Fortune',
  'The Last Judgment': 'Judgement',
};

function slugify(value: string) {
  return value
    .replace(/^The /i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleForCard(card: SourceCard) {
  if (card.type === 'minor') {
    if (!card.suit) {
      throw new Error(`Minor card "${card.name}" has no suit.`);
    }
    return `File:RWS1909 - ${card.suit[0].toUpperCase()}${card.suit.slice(1)} ${String(card.value_int).padStart(2, '0')}.jpeg`;
  }

  const name = titleAliases[card.name] ?? card.name.replace(/^The /, '');
  return `File:RWS1909 - ${String(card.value_int).padStart(2, '0')} ${name}.jpeg`;
}

function cardId(card: SourceCard) {
  return card.type === 'major'
    ? `major-${String(card.value_int).padStart(2, '0')}-${slugify(card.name)}`
    : `${card.suit}-${String(card.value_int).padStart(2, '0')}`;
}

function keywordsFromWaitePhrases(meaning: string) {
  return meaning
    .split(';')
    .map((phrase) => phrase.trim())
    .filter(Boolean);
}

function normalizeTitle(title: string) {
  return title
    .replace(/^File:/i, '')
    .replace(/_/g, ' ')
    .toLowerCase();
}

async function getCommonsImages(titles: string[]) {
  const imageByTitle = new Map<string, CommonsImageInfo>();

  for (let index = 0; index < titles.length; index += 40) {
    const batch = titles.slice(index, index + 40);
    const url = new URL(commonsApi);
    url.search = new URLSearchParams({
      action: 'query',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '500',
      format: 'json',
      formatversion: '2',
    }).toString();

    const response = await fetch(url, {
      headers: { 'User-Agent': 'ArcanaTarotApp/1.0 (public-domain card asset build)' },
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      throw new Error(`Wikimedia Commons returned HTTP ${response.status}.`);
    }

    const result = (await response.json()) as { query?: { pages?: CommonsPage[] } };
    for (const page of result.query?.pages ?? []) {
      const image = page.imageinfo?.[0];
      if (image) {
        imageByTitle.set(normalizeTitle(page.title), image);
      }
    }
  }

  return imageByTitle;
}

async function fetchImage(url: string) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ArcanaTarotApp/1.0 (public-domain card asset build)' },
      signal: AbortSignal.timeout(60_000),
    });
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
    if (response.status !== 429 || attempt === 3) {
      throw new Error(`HTTP ${response.status}`);
    }

    const retryAfter = Number(response.headers.get('retry-after'));
    const delay = Math.min(
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1),
      3000,
    );
    await new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
  }
  throw new Error('Image request exhausted its retry attempts.');
}

const cardBackSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="640" viewBox="0 0 400 640">
    <rect width="400" height="640" rx="24" fill="#111329"/>
    <rect x="20" y="20" width="360" height="600" rx="18" fill="none" stroke="#d9b563" stroke-width="3"/>
    <rect x="34" y="34" width="332" height="572" rx="12" fill="none" stroke="#75658f" stroke-width="2"/>
    <path d="M200 110 224 176 290 200 224 224 200 290 176 224 110 200 176 176Z" fill="none" stroke="#d9b563" stroke-width="4"/>
    <circle cx="200" cy="200" r="115" fill="none" stroke="#75658f" stroke-width="2"/>
    <circle cx="200" cy="200" r="90" fill="none" stroke="#d9b563" stroke-width="2"/>
    <path d="M200 350v135m-48-67h96m-82-34 68 68m0-68-68 68" stroke="#75658f" stroke-width="3"/>
    <circle cx="200" cy="418" r="55" fill="none" stroke="#d9b563" stroke-width="2"/>
  </svg>
`);

async function main() {
  const sourcePath = process.argv[2] ?? process.env.TAROT_SOURCE_JSON;
  if (!sourcePath) {
    throw new Error(
      'Pass the cloned tarot-api static/card_data.json path as an argument or TAROT_SOURCE_JSON.',
    );
  }

  const input = JSON.parse(await readFile(resolve(sourcePath), 'utf8')) as {
    cards?: SourceCard[];
  };
  if (!Array.isArray(input.cards) || input.cards.length !== 78) {
    throw new Error(`Expected 78 source cards; found ${input.cards?.length ?? 0}.`);
  }

  const cards = input.cards.map((source) => ({
    id: cardId(source),
    name: source.name,
    arcana: source.type,
    ...(source.suit ? { suit: source.suit } : {}),
    number: source.value_int,
    keywords: {
      upright: keywordsFromWaitePhrases(source.meaning_up),
      reversed: keywordsFromWaitePhrases(source.meaning_rev),
    },
    meaning: {
      upright: source.meaning_up,
      reversed: source.meaning_rev,
    },
    image: `/cards/${cardId(source)}.webp`,
  }));

  const validation = CardSchema.array().safeParse(cards);
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      console.error(`Card schema failure at ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  await mkdir(dirname(cardOutput), { recursive: true });
  const serializedCards = `${JSON.stringify(validation.data, null, 2)}\n`;
  await writeFile(cardOutput, serializedCards);
  await writeFile(publicCardOutput, serializedCards);

  const titles = input.cards.map(titleForCard);
  const imageByTitle = await getCommonsImages(titles);
  const imageFailures: string[] = [];
  let totalBytes = 0;

  await mkdir(imageOutput, { recursive: true });
  for (const source of input.cards) {
    const title = titleForCard(source);
    const imageInfo = imageByTitle.get(normalizeTitle(title));
    if (!imageInfo) {
      imageFailures.push(`${cardId(source)}: Commons file not found (${title})`);
      continue;
    }
    const license = imageInfo.extmetadata?.LicenseShortName?.value ?? '';
    if (!/public domain/i.test(license)) {
      imageFailures.push(`${cardId(source)}: unexpected Commons license "${license || 'unknown'}"`);
      continue;
    }

    try {
      const output = resolve(imageOutput, `${cardId(source)}.webp`);
      const existing = await sharp(output, { failOn: 'none' })
        .metadata()
        .catch(() => undefined);
      if (existing?.format === 'webp' && existing.width && existing.width <= 400) {
        totalBytes += (await stat(output)).size;
        continue;
      }
      const sourceUrl = imageInfo.thumburl ?? imageInfo.url;
      const buffer = await fetchImage(sourceUrl);
      await sharp(buffer)
        .rotate()
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(output);
      totalBytes += (await stat(output)).size;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      imageFailures.push(`${cardId(source)}: ${detail}`);
    }
  }

  const cardBackPath = resolve(imageOutput, 'card-back.webp');
  await sharp(cardBackSvg).webp({ quality: 82, effort: 5 }).toFile(cardBackPath);
  totalBytes += (await stat(cardBackPath)).size;

  const imageCount = input.cards.length - imageFailures.length;
  console.log(`Validated and wrote ${validation.data.length} cards to ${cardOutput}.`);
  console.log(`Created ${imageCount} card images plus card-back.webp.`);
  console.log(`Total WebP image size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MiB.`);
  if (imageFailures.length > 0) {
    console.error('Image problems:');
    for (const failure of imageFailures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
