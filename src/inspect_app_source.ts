import * as fs from 'fs';
import * as path from 'path';

function main() {
  const file = path.join(process.cwd(), 'src', 'migration-temp', 'app_source.jsx');
  if (!fs.existsSync(file)) {
    console.log('app_source.jsx does not exist!');
    return;
  }

  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  console.log(`app_source.jsx line count: ${lines.length}`);

  // Find all function declarations at top level
  console.log('\n--- Component / Function Declarations ---');
  const funcRegex = /^(async\s+)?function\s+(\w+)\s*\(/gm;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const name = match[2];
    const index = match.index;
    const charBefore = index > 0 ? content[index - 1] : '';
    // Let's find the line number
    const lineNum = content.substring(0, index).split('\n').length;
    console.log(`Line ${lineNum}: function ${name}`);
  }

  // Find all key constant definitions at top level
  console.log('\n--- Constant Declarations of Interest ---');
  const constRegex = /^const\s+(\w+)\s*=/gm;
  while ((match = constRegex.exec(content)) !== null) {
    const name = match[1];
    const index = match.index;
    const lineNum = content.substring(0, index).split('\n').length;
    console.log(`Line ${lineNum}: const ${name}`);
  }
}

main();
