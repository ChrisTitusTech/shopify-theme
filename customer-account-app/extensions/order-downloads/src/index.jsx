import { useState, useEffect } from 'react';
import {
  reactExtension,
  useApi,
  BlockStack,
  InlineStack,
  Button,
  Text,
  Heading,
  Divider,
} from '@shopify/ui-extensions-react/customer-account';

// Registered on the order detail page in New Customer Accounts.
// Shopify injects this block below the order summary for every order.
export default reactExtension(
  'customer-account.order.block.render',
  () => <OrderDownloadBlock />,
);

// GraphQL query against the Customer Account API.
// Requires the product metafield definition (namespace: custom, key: url)
// to have "Customer Account API" access enabled in Shopify Admin:
//   Settings → Custom data → Products → custom.url → Edit → enable access.
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
  const { query, order } = useApi('customer-account.order.block.render');
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
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
        // Silently swallow errors — block simply stays hidden
      }
    })();
  }, [order.id, query]);

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
