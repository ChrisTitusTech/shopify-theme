# Compact CTT storefront

Reference captured and inspected on 2026-10-23:

- https://christitus.com/ - full-page screenshot, branding, and page structure.
- https://cttstore.com/pages/troubleshooting - existing page markup and screenshot.
- Local reference implementation: `../website/src/styles/global.css`.

The reference screenshot shows a compact navigation bar, closely spaced content
cards, restrained borders, cyan accents on navy surfaces, and PT Sans throughout.
The store retains its existing logo, product photography, content, and Dawn
shopping controls. This is a storefront adaptation, not a pixel-for-pixel copy
of the reference homepage's article layout.

## Extracted tokens

| Role | Light | Dark |
| --- | --- | --- |
| Background | `#f4f8fb` | `#071018` |
| Surface | `#ffffff` | `#0e1b26` |
| Secondary surface | `#e6f0f6` | `#162735` |
| Text | `#101820` | `#f5f8fb` |
| Muted text | `#50606d` | `#b2c1cd` |
| Accent | `#126b94` | `#59d0f7` |
| Accent hover | `#07557c` | `#8addf8` |
| Border | `#c6d5df` | `#2d4658` |
| Text on accent | `#ffffff` | `#04141c` |

Exact reference CSS values: PT Sans 400/700, 16px body type, 1.55 body line height,
2px corner radius, 1180px maximum content width, 760px reading width. Reference
cards use approximately 14px internal padding (`0.9rem`).

## Storefront adaptation

- Retain the store's system light/dark preference; use the reference palettes.
- Use 16px mobile and 24px desktop gutters with a 1180px content maximum.
- Keep primary controls at least 44px tall and retain visible keyboard focus.
- Use smaller page/product headings, tighter paragraphs, and restrained card
  shadows. Preserve Dawn's responsive grids, media controls, forms, and checkout.
- Use even 4:3 product tile previews with contained, uncropped images.
- Bound homepage product imagery to 220-480px high with `object-fit: contain`.
- Preserve product and account screenshots; no new imagery is required.
- Keep troubleshooting instructions in Shopify `page.content`, including all
  existing anchors, links, warning text, and the account screenshot. The scoped
  stylesheet overrides embedded legacy CSS without duplicating the content.
- The troubleshooting page uses 16-20px panel padding, 24px topic headings,
  18px subheadings, compact numbered steps, and wrapping jump links.

Reference asset sources: the main site's logo is
https://christitus.com/images/navlogo.webp; the store continues using its
configured Shopify logo. Product images remain managed in Shopify. The account
screenshot remains the existing `cdn.shopify.com` image in page content.

## Validation scope

Preview by intercepting the live storefront's override stylesheet with local
CSS, adding the troubleshooting wrapper emitted by `sections/main-page.liquid`,
and checking desktop/mobile light/dark layouts. This validates real storefront
content without publishing. Run Shopify Theme Check for the Liquid changes.
Shopify-hosted checkout and customer-account app styling are outside theme CSS.
