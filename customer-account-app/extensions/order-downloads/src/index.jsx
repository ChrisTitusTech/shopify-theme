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

const TARGET = 'customer-account.order-status.cart-line-list.render-after';

// Renders after the line-item list on the order status / order detail page
// in New Customer Accounts. Shows download buttons for products with a URL
// stored in the custom.url metafield.
export default reactExtension(TARGET, () => <OrderDownloadBlock />);

// GraphQL query against the Customer Account API.
// Requires the product metafield (namespace: custom, key: url) to have
// "Customer Account API" access enabled:
//   Shopify Admin → Settings → Custom data → Products → custom.url → Edit → enable access.
const QUERY = `
  query OrderDownloads($orderId: ID!) {
    order(id: $orderId) {
      lineItems(first: 50) {
        nodes {
          title
          product {
            metafield(namespace: "custom", key: "url") {
              value
            }
          }
        }
      }
    }
  }
`;

function OrderDownloadBlock() {
  const { query } = useApi(TARGET);
  // useOrder() subscribes to the order subscribable from OrderStatusApi
  const order = useOrder();
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    if (!order?.id) return;
    (async () => {
      try {
        const { data } = await query(QUERY, { variables: { orderId: order.id } });
        const nodes = data?.order?.lineItems?.nodes ?? [];

        const parsed = nodes.flatMap((item) => {
          const raw = item.product?.metafield?.value;
          if (!raw) return [];
          try {
            // Metafield type is list.url — stored as a JSON array.
            // Take the last entry, matching Liquid's `| last` behaviour.
            const urls = JSON.parse(raw);
            const latest = Array.isArray(urls) ? urls[urls.length - 1] : urls;
            if (!latest) return [];
            return [{ title: item.title, url: latest }];
          } catch {
            return [];
          }
        });

        setDownloads(parsed);
      } catch {
        // Silently — block stays hidden on error
      }
    })();
  }, [order?.id, query]);

  // Render nothing if this order has no downloadable products
  if (downloads.length === 0) return null;

  return (
    <BlockStack spacing="base">
      <Divider />
      <Heading level={2}>Downloads</Heading>
      {downloads.map((dl) => (
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
