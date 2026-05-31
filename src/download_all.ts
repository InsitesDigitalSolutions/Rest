import * as fs from 'fs';
import * as path from 'path';

async function downloadFile(url: string, dest: string) {
  console.log(`Downloading ${url} to ${dest}...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.statusText}`);
  }
  const content = await res.text();
  fs.writeFileSync(dest, content, 'utf-8');
  console.log(`Saved ${dest} (${content.length} characters)`);
}

async function main() {
  const files = [
    'rest-data-0.js',
    'rest-data-1.js',
    'rest-data-2.js',
    'rest-data-3.js'
  ];

  // Create temporary directory in src or assets to download these files
  const downloadDir = path.join(process.cwd(), 'src', 'migration-temp');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  for (const file of files) {
    const url = `https://raw.githubusercontent.com/InsitesDigitalSolutions/Rest/main/${file}`;
    await downloadFile(url, path.join(downloadDir, file));
  }

  // Also download the index.html
  const indexUrl = `https://raw.githubusercontent.com/InsitesDigitalSolutions/Rest/main/index.html`;
  await downloadFile(indexUrl, path.join(downloadDir, 'index.html'));
}

main().catch(err => {
  console.error('Download error:', err);
});
