import Link from 'next/link';
import manifest from '../src/ontologies.json';

export default function HomePage() {
  // Static rendering of directory, without the client-side search for maximum compatibility
  // (Search can be added later as a client component if needed)
  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>
          The Web Civics Ontology Namespace
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '1rem' }}>
          The foundational namespace and semantic registry for Web Civics. Designed specifically for <strong>Human-Centric</strong> systems, providing the RDF vocabularies, SHACL shapes, and Context Markup Language (CML) architectures necessary to codify human rights instruments and the modalities of human agency into the Semantic Web.
        </p>
      </header>

      <section className="structural-panel">
        <h2>The Core Philosophy: "Civics" vs. "Civic"</h2>
        <p style={{ marginBottom: '1rem' }}>
          The architecture of this namespace is built on a precise distinction between two concepts:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Civics (The Activity):</strong> An active, generative verb. The grassroots activity of <em>natural persons</em> organizing, building, and asserting their rights and mutual agreements.
          </li>
          <li>
            <strong>Civic (The Artifact):</strong> The resulting noun or adjective. Describes the infrastructure or frameworks that are often subsequently adopted, maintained, or managed by formal institutions <em>after</em> natural persons have established them.
          </li>
        </ul>
        <p>
          <strong>Web-Civics</strong> is the digital manifestation of the generative activity. This namespace provides the semantic tooling for natural persons to engage in Web-Civics.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>What is Published Here?</h2>
        <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Normative Instruments:</strong> High-fidelity RDF/SHACL representations of international human rights instruments.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>nquins & CML Integration:</strong> Advanced contextual data structures utilizing nquins alongside Context Markup Language (CML) to enable deep semantic mapping.</li>
          <li><strong>Human-Centric Architectures:</strong> Vocabularies prioritizing natural person agency over centralized institutional control.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <h2>Directory Index</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          URIs are conceptually structured by institutional provenance and normative function.
        </p>

        {Object.entries(manifest).map(([category, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={category} style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                /{category}
              </h3>
              <div className="directory-grid">
                {items.map((ont) => (
                  <Link href={`/${ont.path.replace('.n3', '')}`} key={ont.id} className="directory-item">
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{ont.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                      View Instrument Spec →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <div className="technical-note">
        <strong>Technical Note on Content Negotiation:</strong><br />
        This namespace supports programmatic content negotiation. Resolving these URIs in a browser returns this HTML documentation. Machine agents can supply specific <code>Accept</code> headers to retrieve standard W3C formats such as JSON-LD, Turtle, or RDF/XML directly.
      </div>
    </div>
  );
}
