import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/index.jsx' {
  const shopify: import('@shopify/ui-extensions/customer-account.order-status.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}
