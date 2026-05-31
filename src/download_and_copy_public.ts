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
  
  // Note: if it's binary like mp3, use arrayBuffer, else text
  if (url.endsWith('.mp3')) {
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    console.log(`Saved binary ${dest} (${buffer.byteLength} bytes)`);
  } else {
    const content = await res.text();
    fs.writeFileSync(dest, content, 'utf-8');
    console.log(`Saved text ${dest} (${content.length} characters)`);
  }
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const tempDir = path.join(process.cwd(), 'src', 'migration-temp');

  const textFiles = [
    'rest-data-0.js',
    'rest-data-1.js',
    'rest-data-2.js',
    'rest-data-3.js'
  ];

  for (const file of textFiles) {
    const tempPath = path.join(tempDir, file);
    const publicPath = path.join(publicDir, file);
    if (fs.existsSync(tempPath)) {
      console.log(`Copying ${file} to public directory...`);
      fs.copyFileSync(tempPath, publicPath);
    } else {
      const url = `https://raw.githubusercontent.com/InsitesDigitalSolutions/Rest/main/${file}`;
      await downloadFile(url, publicPath);
    }
  }

  const musicFiles = [
    'rest-music-1.mp3',
    'rest-music-2.mp3',
    'rest-music-3.mp3'
  ];

  for (const file of musicFiles) {
    const publicPath = path.join(publicDir, file);
    if (!fs.existsSync(publicPath)) {
      const url = `https://raw.githubusercontent.com/InsitesDigitalSolutions/Rest/main/${file}`;
      try {
        await downloadFile(url, publicPath);
      } catch (e: any) {
        console.error(`Skipping ${file} due to download error:`, e.message);
      }
    } else {
      console.log(`${file} already exists in public.`);
    }
  }
  
  console.log('Static assets setup complete.');
}

main().catch(err => {
  console.error('Asset copy error:', err);
});
