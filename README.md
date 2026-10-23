# CTT Store Shopify Theme

A custom Shopify theme for [cttstore.com](https://cttstore.com), built on top of Shopify's official [Dawn](https://github.com/Shopify/dawn) base theme (v15.4.1).

## Overview

This theme extends Dawn with site-specific customizations including a dark mode UI, custom fonts, customer account enhancements (orders list and digital download support), and style overrides scoped to the CTT Store brand.

No Node.js/npm build step is required — all files (Liquid, CSS, JS) are served directly to Shopify via their CDN.

## Tech Stack

| Layer | Details |
|-------|---------|
| Base theme | Dawn v15.4.1 |
| Templating | Liquid |
| Styles | CSS (no preprocessor) |
| Scripts | Vanilla JavaScript (no bundler) |
| CLI | Shopify CLI v4.9.4+ |
| Validation | Shopify Theme Check |

## Directory Structure

```
assets/         # CSS, JS, images, fonts — all served flat via Shopify CDN
config/         # settings_schema.json and settings_data.json
layout/         # theme.liquid (global shell), password.liquid
locales/        # Translation strings (en.default.json, etc.)
sections/       # Reusable page sections (.liquid + embedded schema)
snippets/       # Reusable partials rendered via {% render %}
templates/      # Page templates as JSON or .liquid
  customers/    # Customer account templates
```

### Key Custom Files

| File | Purpose |
|------|---------|
| `assets/christitus-overrides.css` | All site-specific style overrides (dark mode, fonts, layout) |
| `layout/theme.liquid` | Global `<head>`, font loading, Font Awesome CDN |
| `sections/main-account.liquid` | Customer account page — orders list + downloads section |
| `sections/main-order.liquid` | Individual order detail page — line items + download buttons |

## Development

### Prerequisites

- [Shopify CLI v4.9.4+](https://shopify.dev/docs/storefronts/themes/tools/cli)
- A store owner account or staff/collaborator account with Themes permission

### First-time setup

Use Node.js 22.12+ and Git 2.28+ with the current Shopify CLI:

```sh
npm install -g @shopify/cli@latest
shopify version
shopify theme check --no-color --fail-level error
shopify theme list --store <store>.myshopify.com
```

The last command prompts for Shopify authentication. Use the store owner account
or a staff/collaborator account with Themes permission. The storefront has no npm
install or build step. The main theme is connected to this repository; publishing
changes to its connected branch can update the store.

### Customer-account download app

The separate `customer-account-app/` has its own dependencies and deployment.
Use Node.js 24 LTS (the version validated on this system).
Install the committed dependency versions and run its checks from these directories:

```sh
cd customer-account-app
npm ci
npm audit
cd extensions/order-downloads
npm ci
npm audit
npm test
cd ../..
npm run build
```

Download links must be absolute HTTPS URLs without embedded credentials. Plain
URLs, JSON link objects, and JSON URL lists are accepted; lists use the last URL.
The storefront escapes download values when placing them in HTML attributes.

Line-item properties are customer-controlled and are not proof of purchase.
The external `projects.christitus.com/sign.php` and download backend must verify
customer identity and purchased-product entitlement before signing or serving
files. Those backend sources are excluded from this repository and are not
covered by its tests. Do not put unrestricted private file URLs in storefront
metafields: values rendered into a hidden input are publicly readable.

### Local Dev Server

```sh
shopify theme dev --store <store>.myshopify.com
```

Starts a hot-reload proxy at `http://127.0.0.1:9292`. Changes to CSS and sections refresh automatically.

### Push Changes

```sh
# Push to a staging theme by ID
shopify theme push --theme <theme-id>

# Push and publish live
shopify theme push --theme <theme-id> --publish
```

### Pull Remote Changes

```sh
shopify theme pull --theme <theme-id>
```

### List Themes

```sh
shopify theme list
```

### Package for Upload

```sh
shopify theme package
```

## Validation

Always run Theme Check before committing:

```sh
shopify theme check --no-color --fail-level error
```

Exit code `0` means no errors. Warnings from the upstream Dawn base are acceptable — see the known pre-existing warnings below.

Auto-fix safe issues:

```sh
shopify theme check --auto-correct
```

### Known Pre-existing Warnings (Safe to Ignore)

These originate from the upstream Dawn theme and are false positives:

| File | Warning | Reason |
|------|---------|--------|
| `layout/theme.liquid` | `UndefinedObject: scheme_classes` | Valid Dawn runtime pattern |
| `layout/password.liquid` | `UndefinedObject: scheme_classes` | Valid Dawn runtime pattern |
| `layout/theme.liquid` | `RemoteAsset`: Font Awesome CDN | Intentional — served from cdnjs |
| `sections/main-product.liquid` | `UndefinedObject: continue` | Valid Dawn pagination pattern |

## Deployment

1. Run `shopify theme check --no-color --fail-level error` — must pass with 0 errors
2. Commit changes to `main`
3. Push to staging: `shopify theme push --theme <staging-theme-id>`
4. Verify on the preview URL
5. Push live: `shopify theme push --theme <live-theme-id> --publish`

## License

This theme is a private customization of [Shopify Dawn](https://github.com/Shopify/dawn), which is released under the [MIT License](https://github.com/Shopify/dawn/blob/main/LICENSE.md).
