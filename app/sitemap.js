import manifest from '../src/ontologies.json';

export default function sitemap() {
  const routes = [];
  
  for (const category of Object.keys(manifest)) {
    for (const ont of manifest[category]) {
      const parts = ont.path.replace('.n3', '').split('/');
      const slug = parts.slice(1).join('/');
      routes.push({
        url: `https://ns.webcivics.net/ontologies/${slug}`,
        lastModified: new Date(),
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
    ...routes,
  ];
}
