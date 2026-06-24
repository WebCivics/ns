import fs from 'fs';
import path from 'path';
import manifest from '../../../src/ontologies.json';
import ClientViewer from './ClientViewer';
import * as N3 from 'n3';
import jsonld from 'jsonld';

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

export default async function OntologyPage({ params }) {
  const { slug } = await params;
  const ontologyFile = `ontologies/${slug.join('/')}.n3`;
  const rawN3Path = path.join(process.cwd(), 'public', 'raw', ontologyFile);
  
  let n3Content = '';
  let jsonLdString = null;
  
  if (fs.existsSync(rawN3Path)) {
    n3Content = fs.readFileSync(rawN3Path, 'utf-8');
    try {
      const parser = new N3.Parser({ format: 'N3' });
      const quads = parser.parse(n3Content);
      const writer = new N3.Writer({ format: 'N-Quads' });
      writer.addQuads(quads);
      const nquads = await new Promise((resolve, reject) => {
        writer.end((error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      const doc = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
      jsonLdString = JSON.stringify(doc);
    } catch (e) {
      console.error("Failed to parse JSON-LD for build time insertion", e);
    }
  }

  return (
    <>
      {jsonLdString && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: jsonLdString }} 
        />
      )}
      <ClientViewer 
        slug={slug} 
        ontologyFile={ontologyFile} 
        initialContent={n3Content} 
      />
    </>
  );
}
