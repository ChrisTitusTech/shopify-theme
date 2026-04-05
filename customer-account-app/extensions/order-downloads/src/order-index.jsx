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
// Download URLs are stored as the download_url line item property, injected
// at add-to-cart time via buy-buttons.liquid.
export default reactExtension(TARGET, () => <DownloadsBlock />);

// Query all orders for the current customer and read the _download_url line
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
  const api = useApi(TARGET);
  const { query } = api;
  const [downloads, setDownloads] = useState([]);

  // Show example content when rendering inside the customizer editor
  const isEditing = Boolean(api.extension?.editor);

  useEffect(() => {
    if (isEditing) return;
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
  }, [isEditing, query]);

  const items = isEditing ? PREVIEW_DOWNLOADS : downloads;

  if (items.length === 0) return null;

  return (
    <BlockStack spacing="base">
      <Divider />
      <Heading level={2}>Your Downloads</Heading>
      {items.map((dl) => (
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
