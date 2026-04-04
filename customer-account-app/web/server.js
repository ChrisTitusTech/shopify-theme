import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.SHOPIFY_API_KEY || '';

// Inject the client_id for App Bridge auto-init at startup (not per-request)
const html = readFileSync(join(__dirname, 'index.html'), 'utf-8')
  .replace('__CLIENT_ID__', CLIENT_ID);

createServer((req, res) => {
  // Health check for Shopify CLI tunnel readiness probe
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    // Allow Shopify admin to embed this page
    'Content-Security-Policy':
      "frame-ancestors https://admin.shopify.com https://*.myshopify.com",
  });
  res.end(html);
}).listen(PORT, () => {
  console.log(`CTT Downloads admin page running on http://localhost:${PORT}`);
});
