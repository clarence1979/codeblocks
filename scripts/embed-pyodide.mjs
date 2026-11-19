// Adds Python (Pyodide) to the built page as gzip + base64 text blocks, so the single HTML file
// runs Python with no internet connection. Usage: node scripts/embed-pyodide.mjs dist/index.html out.html
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

const [, , input, output] = process.argv;
const dir = join(process.cwd(), 'node_modules', 'pyodide');
const files = [
  ['py-asm-js', 'pyodide.asm.js'],
  ['py-asm-wasm', 'pyodide.asm.wasm'],
  ['py-stdlib', 'python_stdlib.zip'],
  ['py-lock', 'pyodide-lock.json'],
];

let html = readFileSync(input, 'utf8');

// Inline the icons that index.html links to, so the page has no side files.
const types = { svg: 'image/svg+xml', png: 'image/png' };
html = html.replace(/href="\.\/([\w.-]+\.(svg|png))"/g, (all, file, ext) => {
  const path = join(dirname(input), file);
  if (!existsSync(path)) return all;
  return `href="data:${types[ext]};base64,${readFileSync(path).toString('base64')}"`;
});
if (/href="\.\//.test(html) || /src="\.\//.test(html)) throw new Error('Page still points at a side file');
if (/<\/script/i.test(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''))) {
  throw new Error('Unexpected </script> outside script blocks');
}
const blocks = files
  .map(([id, name]) => {
    const gz = gzipSync(readFileSync(join(dir, name)), { level: 9 });
    console.log(`${name}: ${(gz.length / 1e6).toFixed(2)} MB gzipped`);
    return `<script type="application/gzip-base64" id="${id}" data-file="${name}">${gz.toString('base64')}</script>`;
  })
  .join('\n');

const marker = '</body>';
const at = html.lastIndexOf(marker);
if (at < 0) throw new Error('No </body> in built page');
html = html.slice(0, at) + '<!-- Python (Pyodide 0.29.0, MPL-2.0) built in for offline use -->\n' + blocks + '\n' + html.slice(at);
writeFileSync(output, html);
console.log(`Wrote ${output}: ${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB`);
