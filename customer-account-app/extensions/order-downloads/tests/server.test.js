import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DIR = join(__dirname, '../../../web');

function loadHtml(clientId = 'test-client-id') {
  const raw = readFileSync(join(WEB_DIR, 'index.html'), 'utf-8');
  return raw.replace('__CLIENT_ID__', clientId);
}

describe('web/server — HTML injection', () => {
  it('replaces __CLIENT_ID__ placeholder with the provided value', () => {
    const html = loadHtml('fa9c876462a449fb62474d3f53a0979b');
    expect(html).toContain('data-api-key="fa9c876462a449fb62474d3f53a0979b"');
    expect(html).not.toContain('__CLIENT_ID__');
  });

  it('result is valid HTML (has <html> and <body>)', () => {
    const html = loadHtml();
    expect(html).toContain('<html');
    expect(html).toContain('<body');
    expect(html).toContain('</html>');
  });

  it('includes the App Bridge script tag', () => {
    const html = loadHtml();
    expect(html).toContain('cdn.shopify.com/shopifycloud/app-bridge.js');
  });

  it('includes the frame-ancestors CSP in the server source', () => {
    const server = readFileSync(join(WEB_DIR, 'server.js'), 'utf-8');
    expect(server).toContain('frame-ancestors');
    expect(server).toContain('https://admin.shopify.com');
  });

  it('server listens on $PORT or defaults to 3000', () => {
    const server = readFileSync(join(WEB_DIR, 'server.js'), 'utf-8');
    expect(server).toContain('process.env.PORT');
    expect(server).toContain('3000');
  });
});
