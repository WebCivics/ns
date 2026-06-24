import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as N3 from 'n3';
import jsonld from 'jsonld';

const BASE_URL = 'https://ns.webcivics.net';
const PUBLIC_ROOT = path.resolve('public');
const PUBLIC_DIR = path.resolve('public/raw/ontologies');
const OUTPUT_FILE = path.resolve('src/ontologies.json');
const CATALOG_JSON_FILE = path.resolve(PUBLIC_ROOT, 'catalog.json');
const CATALOG_TTL_FILE = path.resolve(PUBLIC_ROOT, 'catalog.ttl');
const CONTEXT_FILE = path.resolve(PUBLIC_ROOT, 'context.jsonld');

const RDF_TERM_TYPES = new Set(['NamedNode', 'BlankNode', 'Literal', 'DefaultGraph']);

const WEB_CIVICS_CONTEXT = {
  '@version': 1.1,
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  sh: 'http://www.w3.org/ns/shacl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  dc: 'http://purl.org/dc/terms/',
  dcterms: 'http://purl.org/dc/terms/',
  prov: 'http://www.w3.org/ns/prov#',
  void: 'http://rdfs.org/ns/void#',
  dcat: 'http://www.w3.org/ns/dcat#',
  values: 'https://ns.webcivics.net/values/',
  sense: 'https://ns.webcivics.net/sense/',
  cml: 'https://ns.webcivics.net/cml/',
  concept: 'https://ns.webcivics.net/concept/',
  doc: 'https://ns.webcivics.net/values/',
  label: 'rdfs:label',
  comment: 'rdfs:comment',
  title: 'dc:title',
  date: 'dc:date',
  source: { '@id': 'values:source', '@type': '@id' },
  wasDerivedFrom: { '@id': 'prov:wasDerivedFrom', '@type': '@id' },
  heldBy: { '@id': 'values:heldBy', '@type': '@id' },
  borneBy: { '@id': 'values:borneBy', '@type': '@id' },
  partOf: { '@id': 'values:partOf', '@type': '@id' },
  asserts: { '@id': 'cml:asserts', '@type': '@id' },
  realizedBy: { '@id': 'cml:realizedBy', '@type': '@id' },
};

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (file.endsWith('.n3')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const toPosix = value => value.replace(/\\/g, '/');

const ensureDir = filePath => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

const cleanGeneratedAssets = () => {
  for (const dir of ['core', 'institutions']) {
    fs.rmSync(path.resolve(PUBLIC_ROOT, dir), { recursive: true, force: true });
  }
  for (const file of [CATALOG_JSON_FILE, CATALOG_TTL_FILE, CONTEXT_FILE]) {
    fs.rmSync(file, { force: true });
  }
};

const titleize = name => name
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase());

const ttlString = value => JSON.stringify(value);

const isRdfQuad = quad => [quad.subject, quad.predicate, quad.object, quad.graph]
  .every(term => RDF_TERM_TYPES.has(term.termType));

const writeQuads = (quads, format) => new Promise((resolve, reject) => {
  const writer = new N3.Writer({ format });
  writer.addQuads(quads);
  writer.end((error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
});

const parseAndProjectRdf = content => {
  const parser = new N3.Parser({ format: 'N3' });
  const quads = parser.parse(content);
  const rdfQuads = quads.filter(isRdfQuad);
  return {
    quads,
    rdfQuads,
    projectedQuadCount: quads.length - rdfQuads.length,
  };
};

const writeMachineFormats = async (entry, n3Content) => {
  const outputBase = path.resolve(PUBLIC_ROOT, entry.dataPath.slice(1));
  ensureDir(`${outputBase}.n3`);
  fs.writeFileSync(`${outputBase}.n3`, n3Content);

  const { quads, rdfQuads, projectedQuadCount } = parseAndProjectRdf(n3Content);
  const turtle = await writeQuads(rdfQuads, 'Turtle');
  fs.writeFileSync(`${outputBase}.ttl`, turtle);

  const nquads = await writeQuads(rdfQuads, 'N-Quads');
  const expandedJsonLd = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
  const compactedJsonLd = await jsonld.compact(expandedJsonLd, WEB_CIVICS_CONTEXT);
  fs.writeFileSync(`${outputBase}.jsonld`, `${JSON.stringify(compactedJsonLd, null, 2)}\n`);

  return {
    tripleCount: rdfQuads.length,
    n3StatementCount: quads.length,
    projectedQuadCount,
  };
};

const allFiles = walkSync(PUBLIC_DIR).sort();

const manifest = {};
const catalogEntries = [];

cleanGeneratedAssets();
fs.writeFileSync(CONTEXT_FILE, `${JSON.stringify({ '@context': WEB_CIVICS_CONTEXT }, null, 2)}\n`);

for (const file of allFiles) {
  const relativePath = path.relative(PUBLIC_DIR, file).replace(/\\/g, '/');
  const dataPath = `/${relativePath.replace(/\.n3$/, '')}`;
  const canonicalPath = `${dataPath}/`;
  let category = toPosix(path.dirname(relativePath.replace(/\.n3$/, '')));
  if (category === '.') category = 'uncategorized';

  const name = path.basename(file, '.n3');
  const n3Content = fs.readFileSync(file, 'utf-8');
  const stats = fs.statSync(file);
  const hash = crypto.createHash('sha256').update(n3Content).digest('hex');
  
  const entry = {
    id: name,
    path: `ontologies/${relativePath}`,
    rawPath: `/raw/ontologies/${relativePath}`,
    dataPath,
    canonicalPath,
    n3Path: `${dataPath}.n3`,
    ttlPath: `${dataPath}.ttl`,
    jsonldPath: `${dataPath}.jsonld`,
    name: titleize(name),
    category,
    sha256: hash,
    bytes: stats.size,
    lastModified: stats.mtime.toISOString(),
  };

  const counts = await writeMachineFormats(entry, n3Content);
  Object.assign(entry, counts);

  if (!manifest[category]) {
    manifest[category] = [];
  }
  manifest[category].push(entry);
  catalogEntries.push(entry);
}

for (const category of Object.keys(manifest)) {
  manifest[category].sort((a, b) => a.dataPath.localeCompare(b.dataPath));
}

const catalog = {
  '@context': `${BASE_URL}/context.jsonld`,
  '@id': `${BASE_URL}/catalog.json`,
  '@type': 'dcat:Catalog',
  title: 'Web Civics Ontology Namespace Catalog',
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  datasetCount: catalogEntries.length,
  datasets: catalogEntries.map(entry => ({
    id: entry.id,
    title: entry.name,
    category: entry.category,
    canonicalUrl: `${BASE_URL}${entry.canonicalPath}`,
    htmlUrl: `${BASE_URL}${entry.canonicalPath}`,
    n3Url: `${BASE_URL}${entry.n3Path}`,
    turtleUrl: `${BASE_URL}${entry.ttlPath}`,
    jsonldUrl: `${BASE_URL}${entry.jsonldPath}`,
    rawN3Url: `${BASE_URL}${entry.rawPath}`,
    sourcePath: entry.path,
    sha256: entry.sha256,
    bytes: entry.bytes,
    tripleCount: entry.tripleCount,
    n3StatementCount: entry.n3StatementCount,
    projectedQuadCount: entry.projectedQuadCount,
    lastModified: entry.lastModified,
  })),
};

const catalogTtl = [
  '@prefix dcat: <http://www.w3.org/ns/dcat#> .',
  '@prefix dcterms: <http://purl.org/dc/terms/> .',
  '@prefix void: <http://rdfs.org/ns/void#> .',
  '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .',
  '@prefix webcivics: <https://ns.webcivics.net/ns#> .',
  '',
  `<${BASE_URL}/catalog.ttl> a dcat:Catalog ;`,
  `    dcterms:title ${ttlString('Web Civics Ontology Namespace Catalog')} ;`,
  `    dcterms:modified ${ttlString(catalog.generatedAt)}^^xsd:dateTime ;`,
  `    dcat:dataset ${catalogEntries.map(entry => `<${BASE_URL}${entry.canonicalPath}>`).join(',\n        ')} .`,
  '',
  ...catalogEntries.flatMap(entry => [
    `<${BASE_URL}${entry.canonicalPath}> a dcat:Dataset, void:Dataset ;`,
    `    dcterms:identifier ${ttlString(entry.id)} ;`,
    `    dcterms:title ${ttlString(entry.name)} ;`,
    `    dcterms:modified ${ttlString(entry.lastModified)}^^xsd:dateTime ;`,
    `    void:triples ${entry.tripleCount} ;`,
    `    webcivics:n3StatementCount ${entry.n3StatementCount} ;`,
    `    webcivics:projectedQuadCount ${entry.projectedQuadCount} ;`,
    `    webcivics:sha256 ${ttlString(entry.sha256)} ;`,
    `    dcat:landingPage <${BASE_URL}${entry.canonicalPath}> ;`,
    `    dcat:distribution <${BASE_URL}${entry.n3Path}>, <${BASE_URL}${entry.ttlPath}>, <${BASE_URL}${entry.jsonldPath}> .`,
    '',
    `<${BASE_URL}${entry.n3Path}> a dcat:Distribution ;`,
    '    dcterms:format "text/n3" ;',
    `    dcat:downloadURL <${BASE_URL}${entry.n3Path}> .`,
    '',
    `<${BASE_URL}${entry.ttlPath}> a dcat:Distribution ;`,
    '    dcterms:format "text/turtle" ;',
    `    dcat:downloadURL <${BASE_URL}${entry.ttlPath}> .`,
    '',
    `<${BASE_URL}${entry.jsonldPath}> a dcat:Distribution ;`,
    '    dcterms:format "application/ld+json" ;',
    `    dcat:downloadURL <${BASE_URL}${entry.jsonldPath}> .`,
    '',
  ]),
].join('\n');

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
fs.writeFileSync(CATALOG_JSON_FILE, `${JSON.stringify(catalog, null, 2)}\n`);
fs.writeFileSync(CATALOG_TTL_FILE, catalogTtl);
console.log(`Manifest and machine assets generated for ${catalogEntries.length} ontologies.`);
