import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 8000);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.mp4': 'video/mp4', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch (_) { response.writeHead(400).end(); return; }
  // A prefix makes it possible to check deployment under a project subdirectory.
  pathname = pathname.replace(/^\/mirror(?=\/|$)/, '') || '/';
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const publicFile = ['index.html', 'styles.css', 'main.js'].includes(relative) ||
    relative === 'data/content.json' || relative.startsWith('assets/');
  const filename = path.resolve(root, relative);
  if (!publicFile || !filename.startsWith(root + path.sep)) {
    response.writeHead(404).end(); return;
  }
  let stat;
  try { stat = fs.statSync(filename); }
  catch (_) { response.writeHead(404).end(); return; }
  if (!stat.isFile()) { response.writeHead(404).end(); return; }
  const headers = {
    'Content-Type': types[path.extname(filename)] || 'application/octet-stream',
    'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'X-Robots-Tag': 'noindex, nofollow',
  };
  let start = 0;
  let end = stat.size - 1;
  let status = 200;
  if (request.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
    if (!match || (!match[1] && !match[2])) { response.writeHead(416).end(); return; }
    start = match[1] ? Number(match[1]) : Math.max(0, stat.size - Number(match[2]));
    end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
    if (start > end || start >= stat.size) {
      response.writeHead(416, {'Content-Range': `bytes */${stat.size}`}).end(); return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length'] = end - start + 1;
  response.writeHead(status, headers);
  if (request.method === 'HEAD') response.end();
  else fs.createReadStream(filename, {start, end}).pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`MIRROR preview: http://127.0.0.1:${port}/mirror/`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
