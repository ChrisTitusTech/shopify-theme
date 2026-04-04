/**
 * Parse a single line item from the Customer Account API GraphQL response
 * into a download entry, or return null if the item has no download URL.
 *
 * The custom.url metafield is a list.url type stored as a JSON-encoded array.
 * We always take the last entry (most recently added URL), matching the
 * Liquid `| last` behaviour used in main-account.liquid.
 *
 * @param {{ title: string, product: { metafield: { value: string } | null } | null }} lineItem
 * @returns {{ title: string, url: string } | null}
 */
export function parseLineItemDownload(lineItem) {
  const raw = lineItem?.product?.metafield?.value;
  if (!raw) return null;

  let urls;
  try {
    urls = JSON.parse(raw);
  } catch {
    return null;
  }

  const latest = Array.isArray(urls) ? urls[urls.length - 1] : urls;
  if (!latest || typeof latest !== 'string' || latest.trim() === '') return null;

  return { title: lineItem.title, url: latest };
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
