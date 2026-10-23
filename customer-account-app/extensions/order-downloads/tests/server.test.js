import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

// Exercise the tracked Node server; production VPS files are not in this repo.
describe('embedded admin server', () => {
  let child;
  let baseUrl;
  const clientId = '\"><script>alert(1)</script>&\'$&';

  beforeAll(async () => {
    child = spawn(process.execPath, [fileURLToPath(new URL('../../../web/server.js', import.meta.url))], {
      env: { ...process.env, PORT: '0', SHOPIFY_API_KEY: clientId },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    baseUrl = await new Promise((resolve, reject) => {
      let output = '';
      child.on('error', reject);
      child.on('exit', (code) => reject(new Error(`Server exited: ${code}`)));
      child.stdout.on('data', (chunk) => {
        output += chunk;
        const match = output.match(/http:\/\/localhost:(\d+)/);
        if (match) resolve(`http://127.0.0.1:${match[1]}`);
      });
    });
  });

  afterAll(async () => {
    if (child && child.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
  });

  it('escapes client configuration without creating HTML elements', async () => {
    const response = await fetch(baseUrl);
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('data-api-key="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&amp;&#39;$&amp;"');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('__CLIENT_ID__');
    expect(response.headers.get('content-security-policy')).toBe(
      'frame-ancestors https://admin.shopify.com https://*.myshopify.com'
    );
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBeNull();
  });

  it('keeps the readiness probe working', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
  });
});
