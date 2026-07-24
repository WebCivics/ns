import fs from 'fs';
import path from 'path';
import manifest from '../../../src/ontologies.json';
import ClientViewer from './ClientViewer';
import CategoryIndex from './CategoryIndex';

const BASE_URL = 'https://ns.webcivics.net';

const titleize = value => value
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase());

const findManifestEntry = slug => {
  const category = slug.slice(0, -1).join('/');
  const id = slug[slug.length - 1];
  return manifest[category]?.find(entry => entry.id === id);
};

const getPaths = slug => {
  const dataPath = `/${slug.join('/')}`;
  const canonicalPath = `${dataPath}/`;
  return {
    dataPath,
    canonicalUrl: `${BASE_URL}${canonicalPath}`,
    n3Url: `${BASE_URL}${dataPath}.n3`,
    ttlUrl: `${BASE_URL}${dataPath}.ttl`,
    jsonldUrl: `${BASE_URL}${dataPath}.jsonld`,
  };
};

/** True when this slug is an intermediate directory (no leaf .n3), not a document. */
const isDirectorySlug = slug => {
  if (!slug?.length) return false;
  const leafN3 = path.join(process.cwd(), 'public', 'raw', 'ontologies', ...slug) + '.n3';
  if (fs.existsSync(leafN3)) return false;
  const categoryKey = slug.join('/');
  if (manifest[categoryKey]?.length) return true;
  // Parent of one or more categories (e.g. institutions → institutions/un)
  return Object.keys(manifest).some(
    key => key === categoryKey || key.startsWith(`${categoryKey}/`),
  );
};

const listDirectChildCategories = slug => {
  const prefix = slug.join('/');
  const depth = slug.length;
  const children = new Map();
  for (const key of Object.keys(manifest)) {
    if (key === prefix) continue;
    if (!key.startsWith(`${prefix}/`)) continue;
    const parts = key.split('/');
    const childPath = parts.slice(0, depth + 1).join('/');
    const count = (manifest[key] || []).length;
    const prev = children.get(childPath) || 0;
    // Count all datasets under that child path (including deeper)
    const under = Object.keys(manifest)
      .filter(k => k === childPath || k.startsWith(`${childPath}/`))
      .reduce((n, k) => n + (manifest[k]?.length || 0), 0);
    children.set(childPath, Math.max(prev, under, count));
  }
  return [...children.entries()]
    .map(([p, count]) => ({ path: p, count, label: titleize(p.split('/').pop()) }))
    .sort((a, b) => a.path.localeCompare(b.path));
};

const listDatasetsAtSlug = slug => {
  const key = slug.join('/');
  return [...(manifest[key] || [])].sort((a, b) =>
    (a.name || a.id).localeCompare(b.name || b.id),
  );
};

export async function generateStaticParams() {
  const pathSet = new Set();

  for (const category of Object.keys(manifest)) {
    // Category directory itself (e.g. institutions/un)
    const catParts = category.split('/').filter(Boolean);
    for (let i = 1; i <= catParts.length; i += 1) {
      pathSet.add(catParts.slice(0, i).join('/'));
    }
    // Leaf documents
    for (const ont of manifest[category]) {
      const parts = ont.path.replace('.n3', '').split('/');
      // ont.path e.g. "ontologies/institutions/un/api-1977" → slug without "ontologies"
      const slugParts = parts[0] === 'ontologies' ? parts.slice(1) : parts;
      for (let i = 1; i <= slugParts.length; i += 1) {
        pathSet.add(slugParts.slice(0, i).join('/'));
      }
    }
  }

  return [...pathSet].map(joined => ({ slug: joined.split('/') }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const paths = getPaths(slug);
  const entry = findManifestEntry(slug);
  const dir = isDirectorySlug(slug);

  if (dir && !entry) {
    const titleBase = titleize(slug[slug.length - 1] || 'Namespace');
    return {
      title: `${titleBase} · directory | ns.webcivics.net`,
      description: `Browse Web Civics ontology documents under /${slug.join('/')}/.`,
      alternates: { canonical: paths.canonicalUrl },
    };
  }

  const instrumentTitle = entry?.name || titleize(slug[slug.length - 1]);
  return {
    title: `${instrumentTitle} | ns.webcivics.net`,
    description: `Machine-readable Web Civics ontology document for ${instrumentTitle}.`,
    alternates: {
      canonical: paths.canonicalUrl,
      types: {
        'text/n3': paths.n3Url,
        'text/turtle': paths.ttlUrl,
        'application/ld+json': paths.jsonldUrl,
      },
    },
  };
}

export default async function OntologyPage({ params }) {
  const { slug } = await params;
  const paths = getPaths(slug);
  const manifestEntry = findManifestEntry(slug);
  const ontologyFile = `ontologies/${slug.join('/')}.n3`;
  const rawN3Path = path.join(process.cwd(), 'public', 'raw', ontologyFile);
  const hasLeafFile = fs.existsSync(rawN3Path);

  // Intermediate directory index (fixes dead /institutions/, /institutions/un/, …)
  if (!hasLeafFile && isDirectorySlug(slug)) {
    const key = slug.join('/');
    const childCategories = listDirectChildCategories(slug);
    const datasets = listDatasetsAtSlug(slug);
    const title = titleize(slug[slug.length - 1] || 'Institutions');
    const description =
      key === 'institutions'
        ? 'Normative instruments organised by institutional provenance (UN, UNESCO, ILO, EU, Australian federal legislation, and more). Each document is available as HTML, N3, Turtle, and JSON-LD.'
        : `Web Civics ontology documents under /${key}/. Prefer machine discovery via catalog.json and llms.txt.`;

    return (
      <CategoryIndex
        slug={slug}
        title={title}
        description={description}
        childCategories={childCategories}
        datasets={datasets}
      />
    );
  }

  let n3Content = '';
  if (hasLeafFile) {
    n3Content = fs.readFileSync(rawN3Path, 'utf-8');
  }

  const tripleCount = manifestEntry ? manifestEntry.tripleCount : 0;

  const datasetJsonLd = {
    '@context': `${BASE_URL}/context.jsonld`,
    '@id': paths.canonicalUrl,
    '@type': 'dcat:Dataset',
    title: manifestEntry?.name || titleize(slug[slug.length - 1]),
    ...(manifestEntry?.registerId && { identifier: manifestEntry.registerId }),
    ...(manifestEntry?.versionDate && { date: manifestEntry.versionDate }),
    'dcat:landingPage': paths.canonicalUrl,
    'dcat:distribution': [
      {
        '@type': 'dcat:Distribution',
        'dcterms:format': 'text/n3',
        'dcat:downloadURL': paths.n3Url,
      },
      {
        '@type': 'dcat:Distribution',
        'dcterms:format': 'text/turtle',
        'dcat:downloadURL': paths.ttlUrl,
      },
      {
        '@type': 'dcat:Distribution',
        'dcterms:format': 'application/ld+json',
        'dcat:downloadURL': paths.jsonldUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <ClientViewer
        slug={slug}
        ontologyFile={ontologyFile}
        initialContent={n3Content}
        canonicalPath={paths.dataPath}
        initialTripleCount={tripleCount}
        documentMetadata={manifestEntry ? {
          title: manifestEntry.name,
          registerId: manifestEntry.registerId,
          versionDate: manifestEntry.versionDate,
          versionDateLabel: manifestEntry.versionDateLabel,
        } : null}
      />
    </>
  );
}
