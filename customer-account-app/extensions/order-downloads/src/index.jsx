import { useState, useEffect } from 'react';
import {
  reactExtension,
  useApi,
  useOrder,
  BlockStack,
  InlineStack,
  Button,
  Text,
  Heading,
  Divider,
} from '@shopify/ui-extensions-react/customer-account';
import { extractDownloads } from './utils.js';

const TARGET = 'customer-account.order-status.cart-line-list.render-after';

// Renders after the line-item list on the order status / order detail page
// in New Customer Accounts. Shows download buttons for products with a URL
// stored in the custom.url metafield.
export default reactExtension(TARGET, () => <OrderDownloadBlock />);

// GraphQL query against the Customer Account API.
// The download URL is read from the download_url line item property, which
// is injected as a hidden input in buy-buttons.liquid at add-to-cart time.
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
  const api = useApi(TARGET);
  const { query } = api;
  // useOrder() subscribes to the order subscribable from OrderStatusApi
  const order = useOrder();
  const [downloads, setDownloads] = useState([]);

  // Show example content when rendering inside the customizer editor
  const isEditing = Boolean(api.extension?.editor);

  useEffect(() => {
    if (isEditing || !order?.id) return;
    (async () => {
      try {
        const { data } = await query(QUERY, { variables: { orderId: order.id } });
        const nodes = data?.order?.lineItems?.nodes ?? [];
        setDownloads(extractDownloads(nodes));
      } catch {
        // Silently — block stays hidden on error
      }
    })();
  }, [isEditing, order?.id, query]);

  const items = isEditing ? PREVIEW_DOWNLOADS : downloads;

  // Render nothing if this order has no downloadable products
  if (items.length === 0) return null;

  return (
    <BlockStack spacing="base">
      <Divider />
      <Heading level={2}>Downloads</Heading>
      {items.map((dl) => (
        <InlineStack key={dl.title} blockAlignment="center" spacing="base">
          <Text>{dl.title}</Text>
          <Button kind="secondary" to={dl.url} target="_blank">
            Download
          </Button>
        </InlineStack>
      ))}
    </BlockStack>
  );
}
