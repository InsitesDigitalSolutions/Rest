async function main() {
  try {
    const url = 'https://raw.githubusercontent.com/insitesdigitalsolutions/Rest/main/index.html';
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Fetch failed with status: ${res.status}`);
      return;
    }
    const html = await res.text();
    console.log('INDEX HTML LENGTH:', html.length);
    
    // Find all <script> tags or files
    const scripts: string[] = [];
    const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      scripts.push(match[1]);
    }
    
    // Find stylesheets
    const styles: string[] = [];
    const styleRegex = /<link\s+[^>]*href=["']([^"']+)["']/gi;
    while ((match = styleRegex.exec(html)) !== null) {
      if (match[1].endsWith('.css') || match[1].includes('stylesheet')) {
        styles.push(match[1]);
      } else {
        styles.push(match[1]);
      }
    }

    console.log('Found script references:', scripts);
    console.log('Found stylesheet/other link references:', styles);

    // Let's print the last 2000 characters and check the style tags or other structures
    console.log('BODY END PATHS OR OTHER ELEMENTS:');
    const index = html.indexOf('</body>');
    if (index !== -1) {
      console.log(html.substring(index - 1000, index + 200));
    } else {
      console.log(html.substring(html.length - 2000));
    }
  } catch (err) {
    console.error('Error fetching:', err);
  }
}

main();
