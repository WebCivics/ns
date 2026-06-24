import manifest from '../src/ontologies.json';

export default function sitemap() {
  const routes = [];
  
  for (const category of Object.keys(manifest)) {
    for (const ont of manifest[category]) {
      routes.push({
        url: `https://ns.webcivics.net${ont.canonicalPath || ont.dataPath || `/${ont.path.replace('.n3', '').replace('ontologies/', '')}`}`,
        lastModified: ont.lastModified ? new Date(ont.lastModified) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return [
    {
      url: 'https://ns.webcivics.net',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://ns.webcivics.net/catalog.json',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://ns.webcivics.net/catalog.ttl',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...routes,
  ];
}
