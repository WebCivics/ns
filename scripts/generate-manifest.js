import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public/ontologies');
const OUTPUT_FILE = path.resolve('src/ontologies.json');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (file.endsWith('.n3')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const allFiles = walkSync(PUBLIC_DIR);

const manifest = {};

allFiles.forEach(file => {
  const relativePath = path.relative(PUBLIC_DIR, file).replace(/\\/g, '/');
  // Category is the folder path, e.g., 'core', 'vendor/un', 'vendor/ilo'
  let category = path.dirname(relativePath);
  if (category === '.') category = 'uncategorized';

  const name = path.basename(file, '.n3');
  
  const entry = {
    id: name,
    path: `ontologies/${relativePath}`,
    name: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  };

  if (!manifest[category]) {
    manifest[category] = [];
  }
  manifest[category].push(entry);
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log('Manifest generated successfully with dynamic categories.');
