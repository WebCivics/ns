import './globals.css';

export const metadata = {
  title: 'ns.webcivics.net',
  description: 'The Web Civics Ontology Namespace',
};

const NavBar = () => {
  return (
    <nav style={{ borderBottom: '1px solid var(--border-strong)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
      <a href="/" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
        ns.webcivics.net
      </a>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <a href="https://github.com/webcivics/ns" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>GitHub Repository</a>
      </div>
    </nav>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          <main style={{ flexGrow: 1 }}>
            {children}
          </main>
          <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p>ns.webcivics.net — The Web Civics Ontology Namespace</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
