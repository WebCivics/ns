import * as N3 from 'n3';
import jsonld from 'jsonld';

const RDF_TERM_TYPES = new Set(['NamedNode', 'BlankNode', 'Literal', 'DefaultGraph']);

const responseHeaders = contentType => ({
  'Content-Type': contentType,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=3600',
});

const isRdfQuad = quad => [quad.subject, quad.predicate, quad.object, quad.graph]
  .every(term => RDF_TERM_TYPES.has(term.termType));

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: responseHeaders('text/plain; charset=utf-8'),
  });
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const ontologyPath = searchParams.get('path')?.replace(/^\/+|\/+$/g, '');
  const format = searchParams.get('format') || 'n3';

  if (!ontologyPath) {
    return new Response('Missing path parameter', { status: 400 });
  }

  if (ontologyPath.includes('..') || ontologyPath.includes('\\')) {
    return new Response('Invalid path parameter', { status: 400 });
  }

  const rawUrl = new URL(`/raw/ontologies/${ontologyPath}.n3`, origin);
  const response = await fetch(rawUrl);

  if (!response.ok) {
    return new Response('Ontology not found', { status: 404 });
  }

  const n3Content = await response.text();

  try {
    if (format === 'n3') {
      return new Response(n3Content, {
        headers: responseHeaders('text/n3; charset=utf-8'),
      });
    }

    const parser = new N3.Parser({ format: 'N3' });
    const allQuads = parser.parse(n3Content);
    const rdfQuads = allQuads.filter(isRdfQuad);
    const write = writerFormat => new Promise((resolve, reject) => {
      const writer = new N3.Writer({ format: writerFormat });
      writer.addQuads(rdfQuads);
      writer.end((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    if (format === 'ttl') {
      const turtle = await write('Turtle');
      return new Response(turtle, {
        headers: responseHeaders('text/turtle; charset=utf-8'),
      });
    }

    if (format === 'jsonld') {
      const nquads = await write('N-Quads');
      const doc = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
      return new Response(JSON.stringify(doc, null, 2), {
        headers: responseHeaders('application/ld+json; charset=utf-8'),
      });
    }

    return new Response('Unsupported format', { status: 400 });
  } catch (error) {
    console.error('Serialization error:', error);
    return new Response('Internal Server Error during serialization', { status: 500 });
  }
}
