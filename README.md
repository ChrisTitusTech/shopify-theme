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
| CLI | Shopify CLI v3.93+ |
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

- [Shopify CLI v3.93+](https://shopify.dev/docs/storefronts/themes/tools/cli)
- A Shopify Partner account with access to the store

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
