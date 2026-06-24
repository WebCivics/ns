import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');
const MANIFEST_PATH = path.resolve('src/ontologies.json');
const PUBLIC_DIR = path.resolve('public');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Manifest not found at ${MANIFEST_PATH}. Please run generate-manifest.js first.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const indexHtmlPath = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error(`index.html not found at ${indexHtmlPath}. Please run vite build first.`);
  process.exit(1);
}

const template = fs.readFileSync(indexHtmlPath, 'utf-8');

// 1. Generate link list for the home page
let linksHtml = '<div id="agent-nav" style="display:none;">\n<h2>Ontology Directory</h2>\n<ul>\n';
const flatOntologies = [];

for (const category of Object.keys(manifest)) {
  for (const ont of manifest[category]) {
    // ont.path is something like "ontologies/core/values.n3"
    // The route matches what React Router expects: "/ontologies/core/values"
    const route = `/${ont.path.replace('.n3', '')}`;
    linksHtml += `  <li><a href="${route}">${ont.name}</a> (<a href="/${ont.path}">Raw N3</a>)</li>\n`;
    flatOntologies.push({ ...ont, route });
  }
}
linksHtml += '</ul>\n</div>';

// Inject links into the main index.html root div
const homeHtml = template.replace('<div id="root"></div>', `<div id="root">\n${linksHtml}\n</div>`);
fs.writeFileSync(indexHtmlPath, homeHtml);

// Create 404 fallback required by GitHub Pages for SPA routing
const notFoundHtmlPath = path.join(DIST_DIR, '404.html');
fs.writeFileSync(notFoundHtmlPath, homeHtml);

// 2. Generate static HTML for each ontology route
const escapeHtml = (str) => {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

for (const ont of flatOntologies) {
  const rawN3Path = path.resolve(PUBLIC_DIR, ont.path);
  let n3Content = '';
  
  if (fs.existsSync(rawN3Path)) {
    n3Content = fs.readFileSync(rawN3Path, 'utf-8');
  } else {
    console.warn(`Warning: Ontology file not found at ${rawN3Path}`);
  }

  const routeDir = path.join(DIST_DIR, ont.route.substring(1)); // Remove leading slash for path.join
  fs.mkdirSync(routeDir, { recursive: true });

  const articleHtml = `
<div id="agent-article" style="display:none;">
  <h1>${ont.name}</h1>
  <p>Canonical URI: <a href="https://ns.webcivics.net${ont.route}">https://ns.webcivics.net${ont.route}</a></p>
  <pre><code>${escapeHtml(n3Content)}</code></pre>
</div>`;

  const pageHtml = template.replace(
    '<div id="root"></div>', 
    `<div id="root">\n${linksHtml}\n${articleHtml}\n</div>`
  );
  
  fs.writeFileSync(path.join(routeDir, 'index.html'), pageHtml);
}

console.log('Prerendering complete: Static HTML generated for software agents.');
