import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { extractDownloads } from './utils.js';

// Extension target: customer-account.order-index.block.render
// Renders a "Your Downloads" block on the orders list page in New Customer
// Accounts. Queries all orders for downloadable products and shows them in
// one place so customers don't have to open each order to find downloads.
//
// Download URLs are stored as the download_url line item property, injected
// at add-to-cart time via buy-buttons.liquid.

export default async () => {
  render(<DownloadsBlock />, document.body);
};

// Query all orders for the current customer and read the download_url line
// item property from each line item. 50 orders × 20 should cover all real cases.
const QUERY = `
  query AllDownloads {
    customer {
      orders(first: 50) {
        nodes {
          name
          lineItems(first: 20) {
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
    }
  }
`;

const PREVIEW_DOWNLOADS = [
  { title: 'Windows Toolbox', url: '#', orderName: '#1001' },
  { title: 'CTT Linux Course', url: '#', orderName: '#1002' },
];

function DownloadsBlock() {
  // shopify.extension.editor is defined only when rendering inside the customizer.
  const isEditing = Boolean(shopify.extension.editor);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    if (isEditing) return;
    shopify.query(QUERY)
      .then(({ data }) => {
        const orders = data?.customer?.orders?.nodes ?? [];
        const allDownloads = orders.flatMap((order) =>
          extractDownloads(order.lineItems?.nodes ?? []).map((dl) => ({
            ...dl,
            orderName: order.name,
          }))
        );
        setDownloads(allDownloads);
      })
      .catch(() => {});
  }, [isEditing]);

  const items = isEditing ? PREVIEW_DOWNLOADS : downloads;

  if (items.length === 0) return null;

  return (
    <s-stack direction="block" gap="base">
      <s-divider />
      <s-heading level={2}>Your Downloads</s-heading>
      {items.map((dl) => (
        <s-stack key={`${dl.orderName}-${dl.title}`} direction="inline">
          <s-stack direction="block">
            <s-text>{dl.title}</s-text>
            <s-text variant="subdued">{dl.orderName}</s-text>
          </s-stack>
          <s-button href={dl.url} target="_blank">Download</s-button>
        </s-stack>
      ))}
    </s-stack>
  );
}
