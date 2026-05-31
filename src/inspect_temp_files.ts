import * as fs from 'fs';
import * as path from 'path';

function main() {
  const dir = path.join(process.cwd(), 'src', 'migration-temp');
  const indexPath = path.join(dir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf-8');
    
    // Find all script tags
    const scriptRegex = /<script\s*([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;
    while ((match = scriptRegex.exec(html)) !== null) {
      count++;
      const attrs = match[1];
      const code = match[2];
      console.log(`Script #${count}: attributes=[${attrs}], src_match=[${attrs.match(/src=["']([^"']+)["']/i)?.[1] || ''}], length=${code.length}`);
      if (code.trim().length > 0) {
        console.log(`CODE PREVIEW (first 1000 chars):`);
        console.log(code.trim().substring(0, 1000));
        console.log(`...\n`);
      }
    }
  } else {
    console.log('index.html not found!');
  }
}

main();
