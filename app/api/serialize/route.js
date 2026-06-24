import * as N3 from 'n3';
import jsonld from 'jsonld';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const ontologyPath = searchParams.get('path');
  const format = searchParams.get('format') || 'n3';

  if (!ontologyPath) {
    return new Response('Missing path parameter', { status: 400 });
  }

  // Fetch the raw .n3 file from the static assets
  const rawUrl = new URL(`/raw/ontologies/${ontologyPath}.n3`, origin);
  const response = await fetch(rawUrl);

  if (!response.ok) {
    return new Response('Ontology not found', { status: 404 });
  }

  const n3Content = await response.text();

  try {
    if (format === 'n3') {
      return new Response(n3Content, {
        headers: { 'Content-Type': 'text/n3; charset=utf-8' },
      });
    }

    const parser = new N3.Parser({ format: 'N3' });
    const allQuads = parser.parse(n3Content);

    if (format === 'ttl') {
      const writer = new N3.Writer({ format: 'Turtle' });
      writer.addQuads(allQuads);
      const turtle = await new Promise((resolve, reject) => {
        writer.end((error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      return new Response(turtle, {
        headers: { 'Content-Type': 'text/turtle; charset=utf-8' },
      });
    }

    if (format === 'jsonld') {
      // JSON-LD does not support N3 logic variables (?var) or formulas
      const quads = allQuads.filter(
        (q) =>
          q.subject.termType !== 'Variable' &&
          q.predicate.termType !== 'Variable' &&
          q.object.termType !== 'Variable'
      );

      const writer = new N3.Writer({ format: 'N-Quads' });
      writer.addQuads(quads);
      const nquads = await new Promise((resolve, reject) => {
        writer.end((error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      const doc = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
      return new Response(JSON.stringify(doc, null, 2), {
        headers: { 'Content-Type': 'application/ld+json; charset=utf-8' },
      });
    }

    return new Response('Unsupported format', { status: 400 });
  } catch (error) {
    console.error('Serialization error:', error);
    return new Response('Internal Server Error during serialization', { status: 500 });
  }
}
