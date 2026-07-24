/**
 * Generate lightweight title indexes for agent keyword discovery.
 * Reads public/catalog.json and public/au-legislation-corpus.json (if present).
 * Writes public/search/title-index.json and public/search/au-title-index.json.
 *
 * Run: node scripts/generate-search-indexes.js
 */
import fs from 'fs';
import path from 'path';

const PUBLIC_ROOT = path.resolve('public');
const SEARCH_DIR = path.resolve(PUBLIC_ROOT, 'search');
const BASE_URL = 'https://ns.webcivics.net';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const catalogPath = path.join(PUBLIC_ROOT, 'catalog.json');
if (!fs.existsSync(catalogPath)) {
  console.error('Missing public/catalog.json — run generate-manifest first.');
  process.exit(1);
}

const catalog = readJson(catalogPath);
const titleIndex = {
  '@id': `${BASE_URL}/search/title-index.json`,
  '@type': 'webcivics:TitleIndex',
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  source: `${BASE_URL}/catalog.json`,
  entryCount: 0,
  entries: (catalog.datasets || []).map((ds) => ({
    id: ds.id,
    title: ds.title,
    category: ds.category,
    canonicalUrl: ds.canonicalUrl,
    n3Url: ds.n3Url,
    turtleUrl: ds.turtleUrl,
    jsonldUrl: ds.jsonldUrl,
    registerId: ds.registerId ?? null,
    tripleCount: ds.tripleCount ?? null,
  })),
};
titleIndex.entryCount = titleIndex.entries.length;
writeJson(path.join(SEARCH_DIR, 'title-index.json'), titleIndex);
console.log(`Wrote search/title-index.json (${titleIndex.entryCount} entries)`);

const corpusPath = path.join(PUBLIC_ROOT, 'au-legislation-corpus.json');
if (fs.existsSync(corpusPath)) {
  const corpus = readJson(corpusPath);
  const datasets = corpus.datasets || [];
  const auIndex = {
    '@id': `${BASE_URL}/search/au-title-index.json`,
    '@type': 'webcivics:TitleIndex',
    jurisdiction: corpus.jurisdiction || 'AU',
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    source: `${BASE_URL}/au-legislation-corpus.json`,
    entryCount: 0,
    entries: datasets.map((ds) => ({
      id: ds.id || ds.registerId,
      registerId: ds.registerId || ds.id,
      title: ds.title,
      canonicalUrl: ds.canonicalUrl,
      n3Url: ds.n3Url,
      officialSource: ds.officialSource,
      rdfTriples: ds.rdfTriples ?? null,
      n3Bytes: ds.n3Bytes ?? null,
      curationStatus: ds.curationStatus ?? null,
    })),
  };
  auIndex.entryCount = auIndex.entries.length;
  writeJson(path.join(SEARCH_DIR, 'au-title-index.json'), auIndex);
  console.log(`Wrote search/au-title-index.json (${auIndex.entryCount} entries)`);
} else {
  console.warn('No au-legislation-corpus.json — skipped au-title-index.json');
}
