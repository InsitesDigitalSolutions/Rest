import * as fs from 'fs';
import * as path from 'path';

function main() {
  const dir = path.join(process.cwd(), 'src', 'migration-temp');
  const indexPath = path.join(dir, 'index.html');
  const outPath = path.join(dir, 'app_source.jsx');
  
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf-8');
    
    // Find script with bable type and react data preset
    const scriptRegex = /<script\s+type="text\/babel"\s+data-presets="react">([\s\S]*?)<\/script>/gi;
    const match = scriptRegex.exec(html);
    if (match) {
      fs.writeFileSync(outPath, match[1], 'utf-8');
      console.log(`Extracted React source to ${outPath} (${match[1].length} characters)`);
    } else {
      // Try generic search for type="text/babel"
      const genericRegex = /<script\s+type="text\/babel">([\s\S]*?)<\/script>/gi;
      const genericMatch = genericRegex.exec(html);
      if (genericMatch) {
        fs.writeFileSync(outPath, genericMatch[1], 'utf-8');
        console.log(`Extracted generic Babel source to ${outPath} (${genericMatch[1].length} characters)`);
      } else {
        console.log('React script tag not found!');
      }
    }
  } else {
    console.log('index.html not found!');
  }
}

main();
