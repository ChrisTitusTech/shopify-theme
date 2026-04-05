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
import { extractDownloads } from './utils.js';

const TARGET = 'customer-account.order-index.block.render';

// Renders a "Your Downloads" block on the orders list page in New Customer
// Accounts. Queries all orders for downloadable products and shows them in
// one place so customers don't have to open each order to find downloads.
//
// Requires the product metafield (namespace: custom, key: url) to have
// "Customer Account API" access enabled:
//   Shopify Admin → Settings → Custom data → Products → custom.url → Edit
export default reactExtension(TARGET, () => <DownloadsBlock />);

// Query all orders for the current customer and pull the custom.url metafield
// from each line item. 50 orders × 20 line items should cover all real cases.
const QUERY = `
  query AllDownloads {
    customer {
      orders(first: 50) {
        nodes {
          name
          lineItems(first: 20) {
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
    }
  }
`;

function DownloadsBlock() {
  const { query } = useApi(TARGET);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await query(QUERY);
        const orders = data?.customer?.orders?.nodes ?? [];
        const allDownloads = orders.flatMap((order) =>
          extractDownloads(order.lineItems?.nodes ?? []).map((dl) => ({
            ...dl,
            orderName: order.name,
          }))
        );
        setDownloads(allDownloads);
      } catch {
        // Stay hidden on error — don't disrupt the orders list
      }
    })();
  }, [query]);

  if (downloads.length === 0) return null;

  return (
    <BlockStack spacing="base">
      <Divider />
      <Heading level={2}>Your Downloads</Heading>
      {downloads.map((dl) => (
        <InlineStack
          key={`${dl.orderName}-${dl.title}`}
          blockAlignment="center"
          spacing="base"
        >
          <BlockStack spacing="extraTight">
            <Text>{dl.title}</Text>
            <Text size="small" appearance="subdued">{dl.orderName}</Text>
          </BlockStack>
          <Button kind="secondary" to={dl.url} target="_blank">
            Download
          </Button>
        </InlineStack>
      ))}
    </BlockStack>
  );
}
