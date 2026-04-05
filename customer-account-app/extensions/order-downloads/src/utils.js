/**
 * Parse a single line item from the Customer Account API GraphQL response
 * into a download entry, or return null if the item has no download URL.
 *
 * The download URL is injected as the `download_url` line item property at
 * add-to-cart time (via a hidden input in buy-buttons.liquid) and is stored
 * on the order as a `customAttribute` entry.
 *
 * @param {{ title: string, customAttributes: Array<{ key: string, value: string }> | null }} lineItem
 * @returns {{ title: string, url: string } | null}
 */
export function parseLineItemDownload(lineItem) {
  const attrs = lineItem?.customAttributes;
  const attr = Array.isArray(attrs) ? attrs.find((a) => a.key === '_download_url') : null;
  const url = attr?.value;
  if (!url || typeof url !== 'string' || url.trim() === '') return null;
  return { title: lineItem.title, url };
}

/**
 * Filter an array of line items down to only those with a download URL.
 *
 * @param {Array} lineItems
 * @returns {Array<{ title: string, url: string }>}
 */
export function extractDownloads(lineItems) {
  return lineItems.flatMap((item) => {
    const parsed = parseLineItemDownload(item);
    return parsed ? [parsed] : [];
  });
}
