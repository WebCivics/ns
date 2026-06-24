import fs from 'fs';
import path from 'path';
import manifest from '../../../src/ontologies.json';
import ClientViewer from './ClientViewer';

const BASE_URL = 'https://ns.webcivics.net';

const titleize = value => value
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase());

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

export async function generateStaticParams() {
  const paths = [];
  for (const category of Object.keys(manifest)) {
    for (const ont of manifest[category]) {
      // ont.path e.g. "ontologies/core/values.n3"
      const parts = ont.path.replace('.n3', '').split('/');
      paths.push({ slug: parts.slice(1) });
    }
  }
  return paths;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const id = slug[slug.length - 1];
  const paths = getPaths(slug);
  const title = `${titleize(id)} | ns.webcivics.net`;

  return {
    title,
    description: `Machine-readable Web Civics ontology document for ${titleize(id)}.`,
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
  const ontologyFile = `ontologies/${slug.join('/')}.n3`;
  const rawN3Path = path.join(process.cwd(), 'public', 'raw', ontologyFile);
  const paths = getPaths(slug);
  
  let n3Content = '';
  
  if (fs.existsSync(rawN3Path)) {
    n3Content = fs.readFileSync(rawN3Path, 'utf-8');
  }

  const datasetJsonLd = {
    '@context': `${BASE_URL}/context.jsonld`,
    '@id': paths.canonicalUrl,
    '@type': 'dcat:Dataset',
    title: titleize(slug[slug.length - 1]),
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
      />
    </>
  );
}
