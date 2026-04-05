import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VPS_DIR = join(__dirname, '../../../../vps');

describe('vps/admin.php — embedded admin page', () => {
  it('contains the hardcoded Shopify App Bridge client_id', () => {
    const php = readFileSync(join(VPS_DIR, 'admin.php'), 'utf-8');
    expect(php).toContain("CLIENT_ID = 'fa9c876462a449fb62474d3f53a0979b'");
  });

  it('outputs the client_id into the App Bridge data-api-key attribute', () => {
    const php = readFileSync(join(VPS_DIR, 'admin.php'), 'utf-8');
    expect(php).toContain('data-api-key=');
    expect(php).toContain('htmlspecialchars(CLIENT_ID');
  });

  it('sets frame-ancestors CSP for Shopify admin embedding', () => {
    const php = readFileSync(join(VPS_DIR, 'admin.php'), 'utf-8');
    expect(php).toContain('frame-ancestors');
    expect(php).toContain('https://admin.shopify.com');
    expect(php).toContain('https://*.myshopify.com');
  });

  it('includes the App Bridge CDN script', () => {
    const php = readFileSync(join(VPS_DIR, 'admin.php'), 'utf-8');
    expect(php).toContain('cdn.shopify.com/shopifycloud/app-bridge.js');
  });

  it('uses htmlspecialchars to prevent XSS on the client_id output', () => {
    const php = readFileSync(join(VPS_DIR, 'admin.php'), 'utf-8');
    expect(php).toContain('htmlspecialchars');
    expect(php).toContain('ENT_QUOTES');
  });

  it('sets X-Content-Type-Options nosniff header', () => {
    const php = readFileSync(join(VPS_DIR, 'admin.php'), 'utf-8');
    expect(php).toContain('X-Content-Type-Options');
    expect(php).toContain('nosniff');
  });

  it('does NOT set X-Frame-Options (invalid for cross-origin embedding; CSP frame-ancestors is used instead)', () => {
    const php = readFileSync(join(VPS_DIR, 'admin.php'), 'utf-8');
    // X-Frame-Options has no valid value for arbitrary-origin iframing.
    // Shopify admin embedding is controlled solely by frame-ancestors CSP.
    expect(php).not.toContain("header('X-Frame-Options");
    expect(php).not.toContain('header("X-Frame-Options');
  });
});
