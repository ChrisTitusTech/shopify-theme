import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

// Extension target: customer-account.order-status.cart-line-list.render-after
// Renders after the line-item list on the order status / order detail page
// in New Customer Accounts. Shows download buttons for products with a URL
// stored in the product's custom.url metafield (namespace="custom", key="url").
//
// The metafield is declared in shopify.extension.toml via [[extensions.metafields]]
// so Shopify auto-fetches it for each product in the order and exposes it via
// shopify.appMetafields — no API capability or GraphQL query required.
//
// A fast path also checks CartLine.attributes for a download_url property that
// buy-buttons.liquid injects at add-to-cart time (for newer orders).

export default async () => {
  render(<OrderDownloadBlock />, document.body);
};

// Build a Map from product GID → download URL using appMetafields entries.
// The metafield type is list.url, so value is a JSON array; we take the last
// element to match the Liquid `| last` filter used in buy-buttons.liquid.
function buildUrlMap(appMetafields) {
  const map = new Map();
  for (const entry of (appMetafields ?? [])) {
    if (entry.target?.type !== 'product') continue;
    const raw = entry.metafield?.value;
    if (!raw) continue;
    let url;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        url = parsed[parsed.length - 1];
      } else if (parsed && typeof parsed === 'object' && parsed.url) {
        // link type metafield: {"text": "...", "url": "https://..."}
        url = parsed.url;
      } else {
        url = raw;
      }
    } catch {
      url = raw;
    }
    if (url) {
      // appMetafields returns numeric id; line.merchandise.product.id is a GID.
      // Store both forms so the lookup works either way.
      const numericId = entry.target.id;
      map.set(numericId, url);
      map.set(`gid://shopify/Product/${numericId}`, url);
    }
  }
  return map;
}

function extractDownloads(lines, appMetafields) {
  const urlMap = buildUrlMap(appMetafields);
  return (lines ?? []).flatMap((line) => {
    // Fast path: download_url attribute set by buy-buttons.liquid at add-to-cart
    const urlAttr = line.attributes?.find((a) => a.key === 'download_url');
    if (urlAttr?.value) return [{ title: line.merchandise?.title ?? '', url: urlAttr.value }];
    // Primary path: look up the product's current metafield value
    const productId = line.merchandise?.product?.id;
    if (!productId) return [];
    const url = urlMap.get(productId);
    if (!url) return [];
    return [{ title: line.merchandise?.title ?? '', url }];
  });
}

const PREVIEW_DOWNLOADS = [
  { title: 'Windows Toolbox', url: '#' },
  { title: 'CTT Linux Course', url: '#' },
];

function OrderDownloadBlock() {
  // shopify.extension.editor is defined only when rendering inside the customizer.
  const isEditing = Boolean(shopify.extension.editor);

  const [downloads, setDownloads] = useState(() =>
    extractDownloads(shopify.lines.value, shopify.appMetafields.value)
  );

  useEffect(() => {
    const update = () => {
      setDownloads(extractDownloads(shopify.lines.value, shopify.appMetafields.value));
    };
    update();
    const unsubLines = shopify.lines.subscribe(update);
    const unsubMeta = shopify.appMetafields.subscribe(update);
    return () => {
      unsubLines();
      unsubMeta();
    };
  }, []);

  const items = isEditing ? PREVIEW_DOWNLOADS : downloads;

  // Render nothing if this order has no downloadable products.
  if (items.length === 0) return null;

  return (
    <s-stack direction="block" gap="base" padding="base">
      <s-divider />
      <s-heading level={2}>Downloads</s-heading>
      {items.map((dl) => (
        <s-stack key={dl.title} direction="inline" alignItems="center" justifyContent="space-between">
          <s-text type="strong">{dl.title}</s-text>
          <s-button href={dl.url} target="_blank" variant="primary">Download</s-button>
        </s-stack>
      ))}
    </s-stack>
  );
}
