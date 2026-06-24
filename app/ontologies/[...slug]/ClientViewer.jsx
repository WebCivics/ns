'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as N3 from 'n3';
import jsonld from 'jsonld';

export default function ClientViewer({ slug, ontologyFile, initialContent }) {
  const [content, setContent] = useState(initialContent || '');
  const [quads, setQuads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('turtle');
  const [convertedContent, setConvertedContent] = useState(initialContent || '');
  const [documentSource, setDocumentSource] = useState(null);

  const id = slug[slug.length - 1];
  const categoryPath = slug.slice(0, -1).join(' / ');

  useEffect(() => {
    const parseOntology = async () => {
      try {
        let currentContent = content;
        if (!currentContent) {
          setLoading(true);
          // Fix path to fetch from raw/ontologies
          const res = await fetch(`/raw/ontologies/${slug.join('/')}.n3`);
          if (!res.ok) throw new Error(`Failed to fetch ${ontologyFile}`);
          currentContent = await res.text();
          setContent(currentContent);
          setConvertedContent(currentContent);
        }

        const parser = new N3.Parser({ format: 'N3' });
        const parsedQuads = [];
        let sourceUri = null;

        parser.parse(currentContent, (err, quad, prefixes) => {
          if (err) {
            console.error('Client parse error:', err);
            setError(err.message);
            setLoading(false);
          } else if (quad) {
            parsedQuads.push(quad);
            if (quad.predicate.value === 'https://ns.webcivics.net/values/source' || 
                quad.predicate.value === 'http://purl.org/dc/terms/source') {
              sourceUri = quad.object.value;
            }
          } else {
            setQuads(parsedQuads);
            if (sourceUri) setDocumentSource(sourceUri);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    parseOntology();
  }, [content, ontologyFile, slug]);

  useEffect(() => {
    if (!quads.length) return;

    const convertFormat = async () => {
      try {
        if (format === 'turtle') {
          setConvertedContent(content);
        } else if (format === 'ntriples') {
          const writer = new N3.Writer({ format: 'N-Triples' });
          writer.addQuads(quads);
          writer.end((err, res) => {
            if (!err) setConvertedContent(res);
          });
        } else if (format === 'jsonld') {
          const writer = new N3.Writer({ format: 'N-Quads' });
          writer.addQuads(quads);
          writer.end(async (err, nquads) => {
            if (!err) {
              const doc = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
              setConvertedContent(JSON.stringify(doc, null, 2));
            }
          });
        }
      } catch (e) {
        console.error('Conversion error', e);
      }
    };
    convertFormat();
  }, [format, quads, content]);

  const handleDownload = () => {
    const blob = new Blob([convertedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let ext = '.ttl';
    if (format === 'jsonld') ext = '.jsonld';
    if (format === 'ntriples') ext = '.nt';
    a.download = `${id}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="container" style={{ padding: '4rem 2rem' }}>Parsing instrument semantic profile...</div>;
  if (error) return <div className="container" style={{ padding: '4rem 2rem', color: 'var(--accent-secondary)' }}>Error: {error}</div>;

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link href="/">Home</Link> &gt; <span style={{ textTransform: 'capitalize' }}>{categoryPath}</span> &gt; {id}
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', textTransform: 'capitalize', marginBottom: '0.5rem' }}>
          {id.replace(/-/g, ' ')}
        </h1>
        <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          <strong>Canonical URI:</strong> <code>https://ns.webcivics.net/ontologies/{slug.join('/')}</code><br />
          <strong>Promulgating Institution / Scope:</strong> <span style={{ textTransform: 'capitalize' }}>{slug.join(', ')}</span><br />
          <strong>Triples Extracted:</strong> {quads.length}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {documentSource && (
            <a href={documentSource} target="_blank" rel="noreferrer" className="btn">
              View Original Instrument (Origin)
            </a>
          )}
          <a href={`https://github.com/webcivics/ns/commits/main/public/${ontologyFile}`} target="_blank" rel="noreferrer" className="btn">
            View Git Version History
          </a>
          <button onClick={handleDownload} className="btn btn-primary">
            Download Serialized Graph
          </button>
        </div>
      </header>

      <section className="structural-panel">
        <h2>Normative Modalities</h2>
        <p style={{ marginBottom: '1rem' }}>
          This instrument defines specific modalities of human agency and fundamental freedoms. The RDF properties and SHACL shapes parsed below codify these rights as affirmable undertakings binding upon actors. 
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          <strong>Note:</strong> We strictly map these rights to the <em>natural person</em>, prioritizing self-determination and autonomy. Institutional constructs (such as corporate personhood) are explicitly disjoint from these human-centric dignity classifications within the SHACL constraints.
        </p>
      </section>

      <section className="structural-panel">
        <h2>Contextual Data Structures (CML & nquins)</h2>
        <p style={{ marginBottom: '1rem' }}>
          The underlying structure of this schema utilizes <strong>nquins</strong> and Context Markup Language (CML) to provide deep, context-aware semantic mapping. 
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          This architecture ensures that whenever multiple cryptography-supported identifiers are utilized to manage state or attribute assertions, they remain entirely enumerated and compartmentalized. This prevents the blending of distinct agent presence modalities and secures the structural integrity of the Human-Centric system against opaque institutional tracking.
        </p>
      </section>

      <section className="structural-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <strong style={{ marginRight: 'auto' }}>Triples / Shapes Viewer</strong>
          <button 
            onClick={() => setFormat('turtle')}
            className={`btn ${format === 'turtle' ? 'btn-primary' : ''}`}
            style={{ padding: '0.25rem 0.75rem' }}
          >
            Turtle / N3
          </button>
          <button 
            onClick={() => setFormat('jsonld')}
            className={`btn ${format === 'jsonld' ? 'btn-primary' : ''}`}
            style={{ padding: '0.25rem 0.75rem' }}
          >
            JSON-LD
          </button>
          <button 
            onClick={() => setFormat('ntriples')}
            className={`btn ${format === 'ntriples' ? 'btn-primary' : ''}`}
            style={{ padding: '0.25rem 0.75rem' }}
          >
            N-Triples
          </button>
        </div>
        
        <pre style={{ margin: 0, border: 'none', borderRadius: 0, maxHeight: '600px', padding: '1.5rem' }}>
          <code>{convertedContent}</code>
        </pre>
      </section>
    </div>
  );
}
