import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

// Extension target: customer-account.order-status.cart-line-list.render-after
// Renders after the line-item list on the order status / order detail page
// in New Customer Accounts. Shows download buttons for products with a URL
// stored as the download_url line item property (injected at add-to-cart time
// via buy-buttons.liquid).
//
// Line item properties are available directly on shopify.lines (OrderStatusApi)
// as CartLine.attributes — no GraphQL query or API capability required.

export default async () => {
  render(<OrderDownloadBlock />, document.body);
};

// Extract { title, url } entries from a CartLine[] by reading the download_url
// custom attribute that buy-buttons.liquid injects at add-to-cart time.
function extractFromLines(lines) {
  return (lines ?? []).flatMap((line) => {
    const urlAttr = line.attributes?.find((a) => a.key === 'download_url');
    if (!urlAttr?.value) return [];
    return [{ title: line.merchandise?.title ?? '', url: urlAttr.value }];
  });
}

const PREVIEW_DOWNLOADS = [
  { title: 'Windows Toolbox', url: '#' },
  { title: 'CTT Linux Course', url: '#' },
];

function OrderDownloadBlock() {
  // shopify.extension.editor is defined only when rendering inside the customizer.
  const isEditing = Boolean(shopify.extension.editor);

  // Initialise synchronously from the current lines value so the UI appears
  // immediately without a loading flash on pages where lines are pre-populated.
  const [downloads, setDownloads] = useState(() =>
    extractFromLines(shopify.lines.value)
  );

  useEffect(() => {
    // Re-read on any future lines changes (e.g. async hydration).
    const update = () => setDownloads(extractFromLines(shopify.lines.value));
    update();
    return shopify.lines.subscribe(update);
  }, []);

  const items = isEditing ? PREVIEW_DOWNLOADS : downloads;

  // Render nothing if this order has no downloadable products.
  if (items.length === 0) return null;

  return (
    <s-stack direction="block" gap="base">
      <s-divider />
      <s-heading level={2}>Downloads</s-heading>
      {items.map((dl) => (
        <s-stack key={dl.title} direction="inline">
          <s-text>{dl.title}</s-text>
          <s-button href={dl.url} target="_blank">Download</s-button>
        </s-stack>
      ))}
    </s-stack>
  );
}
