import * as fs from 'fs';
import * as path from 'path';

async function fetchGithubDir(dirPath = '') {
  try {
    const url = `https://api.github.com/repos/insitesdigitalsolutions/Rest/contents/${dirPath}`;
    console.log(`Fetching: ${url}`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      console.error(`Failed to fetch ${dirPath}: ${res.status} ${res.statusText}`);
      return [];
    }

    const items = await res.json() as any[];
    return items;
  } catch (err) {
    console.error(`Error fetching ${dirPath}:`, err);
    return [];
  }
}

async function main() {
  const rootItems = await fetchGithubDir();
  console.log('Root directory items:');
  for (const item of rootItems) {
    console.log(`- [${item.type}] ${item.path} (Download URL: ${item.download_url})`);
  }
}

main();
