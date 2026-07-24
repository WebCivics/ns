import Link from 'next/link';

const BASE_URL = 'https://ns.webcivics.net';

const titleize = value => value
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase());

/**
 * Directory index for intermediate paths such as /institutions/ or /institutions/un/.
 * Leaf ontology documents use ClientViewer; this page lists children from the manifest.
 */
export default function CategoryIndex({
  slug,
  title,
  description,
  childCategories = [],
  datasets = [],
}) {
  const dataPath = `/${slug.join('/')}`;
  const canonicalUrl = `${BASE_URL}${dataPath}/`;

  const catalogJsonLd = {
    '@context': `${BASE_URL}/context.jsonld`,
    '@id': canonicalUrl,
    '@type': 'dcat:Catalog',
    title,
    description,
    'dcat:dataset': datasets.map(d => ({
      '@id': `${BASE_URL}${d.canonicalPath || `${d.dataPath}/`}`,
      '@type': 'dcat:Dataset',
      title: d.name || d.title || d.id,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <nav style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          <Link href="/" style={{ color: 'var(--accent-primary)' }}>Home</Link>
          {slug.map((part, i) => {
            const href = `/${slug.slice(0, i + 1).join('/')}/`;
            return (
              <span key={href}>
                {' / '}
                <Link href={href} style={{ color: 'var(--accent-primary)' }}>
                  {titleize(part)}
                </Link>
              </span>
            );
          })}
        </nav>

        <header style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Namespace directory
          </p>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: '42rem' }}>
            {description}
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Canonical: <code style={{ color: 'var(--accent-primary)' }}>{canonicalUrl}</code>
            {' · '}
            <a href={`${BASE_URL}/catalog.json`} style={{ color: 'var(--accent-primary)' }}>catalog.json</a>
            {' · '}
            <a href={`${BASE_URL}/llms.txt`} style={{ color: 'var(--accent-primary)' }}>llms.txt</a>
          </p>
        </header>

        {childCategories.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Sub-collections
            </h2>
            <div className="directory-grid">
              {childCategories.map(cat => (
                <div key={cat.path} className="directory-item">
                  <Link href={`/${cat.path}/`} style={{ display: 'block' }}>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      /{cat.path}/
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {cat.count} document{cat.count === 1 ? '' : 's'}
                    </span>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                      Browse →
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {datasets.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Documents ({datasets.length})
            </h2>
            <div className="directory-grid">
              {datasets.map(ont => {
                const routePath = ont.dataPath || `/${ont.path?.replace('.n3', '').replace('ontologies/', '')}`;
                const htmlPath = ont.canonicalPath || `${routePath}/`;
                return (
                  <div key={`${ont.category || ''}/${ont.id}`} className="directory-item">
                    <Link href={htmlPath} style={{ display: 'block' }}>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                        {ont.name || ont.title || titleize(ont.id)}
                      </h3>
                      {ont.registerId && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          {ont.registerId}
                        </div>
                      )}
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                        View instrument →
                      </span>
                    </Link>
                    <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>RDF:</span>
                      <a href={`${routePath}.n3`} style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>.n3</a>
                      <a href={`${routePath}.ttl`} style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>.ttl</a>
                      <a href={`${routePath}.jsonld`} style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>.jsonld</a>
                      {typeof ont.tripleCount === 'number' && (
                        <span style={{ color: 'var(--text-secondary)' }}>· {ont.tripleCount} triples</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {childCategories.length === 0 && datasets.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>
            No documents are indexed under this path yet. See{' '}
            <a href={`${BASE_URL}/catalog.json`} style={{ color: 'var(--accent-primary)' }}>catalog.json</a>.
          </p>
        )}

        <aside style={{ marginTop: '3rem', padding: '1rem 1.15rem', border: '1px solid var(--border-light)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Agents:</strong>{' '}
          Prefer catalog-driven discovery via <code>/catalog.json</code> and <code>/llms.txt</code>.
          For local MCP tools over fetched N3, see{' '}
          <a href="/agent-mcp-guide.md" style={{ color: 'var(--accent-primary)' }}>agent-mcp-guide.md</a>.
        </aside>
      </div>
    </>
  );
}
