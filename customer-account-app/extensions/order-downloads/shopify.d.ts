import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/index.jsx' {
  const shopify: import('@shopify/ui-extensions/customer-account.order-status.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/order-index.jsx' {
  const shopify: import('@shopify/ui-extensions/customer-account.order-index.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/utils.js' {
  const shopify:
    | import('@shopify/ui-extensions/customer-account.order-status.cart-line-list.render-after').Api
    | import('@shopify/ui-extensions/customer-account.order-index.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}
