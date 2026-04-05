import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { extractDownloads } from './utils.js';

// Extension target: customer-account.order-status.cart-line-list.render-after
// Renders after the line-item list on the order status / order detail page
// in New Customer Accounts. Shows download buttons for products with a URL
// stored as the download_url line item property (injected at add-to-cart time
// via buy-buttons.liquid).

export default async () => {
  render(<OrderDownloadBlock />, document.body);
};

// GraphQL query against the Customer Account API.
// The download URL is read from the download_url line item property.
const QUERY = `
  query OrderDownloads($orderId: ID!) {
    order(id: $orderId) {
      lineItems(first: 50) {
        nodes {
          title
          customAttributes {
            key
            value
          }
        }
      }
    }
  }
`;

const PREVIEW_DOWNLOADS = [
  { title: 'Windows Toolbox', url: '#' },
  { title: 'CTT Linux Course', url: '#' },
];

function OrderDownloadBlock() {
  // shopify.order is a subscribable signal — Preact auto-re-renders on change.
  const order = shopify.order.value;
  // shopify.extension.editor is defined only when rendering inside the customizer.
  const isEditing = Boolean(shopify.extension.editor);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    if (isEditing || !order?.id) return;
    shopify.query(QUERY, { variables: { orderId: order.id } })
      .then(({ data }) => {
        const nodes = data?.order?.lineItems?.nodes ?? [];
        setDownloads(extractDownloads(nodes));
      })
      .catch(() => {});
  }, [isEditing, order?.id]);

  const items = isEditing ? PREVIEW_DOWNLOADS : downloads;

  // Render nothing if this order has no downloadable products
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
