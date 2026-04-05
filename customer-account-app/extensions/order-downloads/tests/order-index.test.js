import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '../src');
const EXT_DIR = join(__dirname, '..');

describe('order-index.jsx — orders list downloads block', () => {
  const src = readFileSync(join(SRC_DIR, 'order-index.jsx'), 'utf-8');

  it('targets the order-index block render extension point', () => {
    expect(src).toContain('customer-account.order-index.block.render');
  });

  it('queries customer.orders with lineItems and metafield', () => {
    expect(src).toContain('customer {');
    expect(src).toContain('orders(first: 50)');
    expect(src).toContain('lineItems(first: 20)');
    expect(src).toContain('metafield(namespace: "custom", key: "url")');
  });

  it('imports extractDownloads from utils.js', () => {
    expect(src).toContain("from './utils.js'");
    expect(src).toContain('extractDownloads');
  });

  it('shows orderName alongside product title in the UI', () => {
    expect(src).toContain('orderName');
    expect(src).toContain('dl.orderName');
  });

  it('renders a "Your Downloads" heading', () => {
    expect(src).toContain('Your Downloads');
  });

  it('returns null when downloads array is empty', () => {
    expect(src).toContain('downloads.length === 0');
    expect(src).toContain('return null');
  });
});

describe('shopify.extension.toml — extension targeting', () => {
  const toml = readFileSync(join(EXT_DIR, 'shopify.extension.toml'), 'utf-8');

  it('includes order-status target for per-order download buttons', () => {
    expect(toml).toContain('customer-account.order-status.cart-line-list.render-after');
  });

  it('includes order-index target for the all-downloads block', () => {
    expect(toml).toContain('customer-account.order-index.block.render');
  });

  it('maps order-index target to order-index.jsx', () => {
    expect(toml).toContain('./src/order-index.jsx');
  });
});

describe('dead code removal — Liquid sections', () => {
  const mainAccount = readFileSync(
    join(__dirname, '../../../../sections/main-account.liquid'),
    'utf-8'
  );
  const mainOrder = readFileSync(
    join(__dirname, '../../../../sections/main-order.liquid'),
    'utf-8'
  );

  it('main-account.liquid no longer contains download table logic', () => {
    expect(mainAccount).not.toContain('has_any_downloads');
    expect(mainAccount).not.toContain('customer__downloads');
  });

  it('main-order.liquid no longer contains the order_status_url download redirect', () => {
    expect(mainOrder).not.toContain('order_status_url');
  });
});
