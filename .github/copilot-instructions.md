# GitHub Copilot Instructions

## Project Overview

This is a custom Shopify theme based on Dawn (v15.4.1), built for cttstore.com.
It uses **Shopify CLI 3.x** (`shopify` command) as the primary development and deployment tool.
There is no Node/npm build step — all files are served directly to Shopify.

This project modifies the base Dawn theme to create a custom storefront for digital products, with a focus on simplicity and dark mode support.

### CSS Based on christitus.com

The CSS is adapted from the main [christitus.com](https://christitus.com) site, with modifications to fit the Shopify theme structure and support dark mode. The main custom CSS file is `assets/christitus-overrides.css`, which contains all site-specific style overrides. This file is included in the theme's global `<head>` via `layout/theme.liquid`.

Refrence the original CSS from christitus.com at /home/titus/github/website or if no directory exists, the github repo is located at https://github.com/ChrisTitusTech/website. The CSS is organized into sections for typography, layout, dark mode, and component styles. It includes custom properties (CSS variables) for colors and fonts, which are used throughout the theme for consistent styling.

---

## Toolchain

- **CLI**: Shopify CLI v3.93+ (`shopify theme <command>`)
- **Linting/Validation**: `shopify theme check` (Theme Check)
- **Language**: Liquid (`.liquid`), JSON, CSS, JavaScript — no transpilation

---

## Directory Structure

```
assets/         # CSS, JS, images, fonts — all served flat via Shopify CDN
config/         # settings_schema.json (theme settings definition)
                # settings_data.json (active settings values — do not hand-edit)
layout/         # theme.liquid (global shell), password.liquid
locales/        # Translation strings (en.default.json, etc.)
sections/       # Reusable page sections (.liquid + embedded {% schema %})
snippets/       # Reusable partials rendered via {% render 'name' %}
templates/      # Page templates as JSON (section references) or .liquid
  customers/    # Customer account templates (account, order, login, etc.)
```

### Key customization files

| File | Purpose |
|------|---------|
| `assets/christitus-overrides.css` | All site-specific style overrides (dark mode, fonts, layout) |
| `layout/theme.liquid` | Global <head>, font loading, Font Awesome CDN |
| `sections/main-account.liquid` | Customer account page — orders list + downloads section |
| `sections/main-order.liquid` | Individual order detail page — line items + download buttons |

---

## Development Workflow

### Start local dev server (hot reload against live store)

```sh
shopify theme dev --store <store>.myshopify.com
```

- Serves a proxy at `http://127.0.0.1:9292` with hot reload for CSS and sections
- Creates a temporary development theme in the store (deleted on `shopify auth logout`)
- Add `--open` to automatically open the preview in a browser
- Add `--theme-editor-sync` to sync Theme Editor changes back to local files
- Add `--only "assets/*.css"` to limit hot reload to specific file patterns

### Push local changes to a specific theme

```sh
# Push to an unpublished/staging theme by ID
shopify theme push --theme <theme-id>

# Push and publish (make live) — use with caution
shopify theme push --theme <theme-id> --publish
```

### Pull remote theme changes locally

```sh
shopify theme pull --theme <theme-id>
```

### List themes in the store

```sh
shopify theme list
```

### Package theme for upload via Shopify admin

```sh
shopify theme package
# Outputs a .zip file in the current directory
```

---

## Testing & Validation

### Always run theme check before committing

```sh
shopify theme check --no-color
```

- Exit code `0` = no errors (warnings are acceptable)
- Exit code non-zero = errors that must be fixed before pushing
- Use `--fail-level error` to fail only on errors (not warnings):

```sh
shopify theme check --no-color --fail-level error
```

- Auto-fix safe offenses:

```sh
shopify theme check --auto-correct
```

### Known pre-existing warnings (safe to ignore)

These warnings exist in the upstream Dawn base theme and are false positives:

| File | Warning | Reason |
|------|---------|--------|
| `layout/theme.liquid` | `UndefinedObject: scheme_classes` | Dawn Liquid pattern, valid at runtime |
| `layout/password.liquid` | `UndefinedObject: scheme_classes` | Same Dawn pattern |
| `layout/theme.liquid` | `RemoteAsset`: Font Awesome CDN | Intentional — Font Awesome served from cdnjs |
| `sections/main-product.liquid` | `UndefinedObject: continue` | Dawn pagination pattern, valid at runtime |

### Manual preview testing

```sh
# Get shareable preview links for any theme
shopify theme open --theme <theme-id>

# Share an unpublished preview link (survives logout)
shopify theme share
```

### Liquid REPL (interactive debugging)

```sh
shopify theme console
```

Use this to test Liquid snippets and filters against live store data interactively.

---

## Liquid Conventions

- **Metafields**: Download URLs are stored as `list.url` type at `product.metafields.custom.url`. Always use `| last` to get the current URL and avoid showing historical entries from the list.
- **Customer orders**: `customer.orders` is sorted newest-first. Use `customer.orders.first` for the most recent order.
- **Snippets**: Use `{% render 'snippet-name', param: value %}` — never `{% include %}` (deprecated).
- **Sections**: Each section file contains its own `{% schema %}` block at the bottom.
- **i18n**: Use `{{ 'key' | t }}` for all user-facing strings; add keys to `locales/en.default.json`.

---

## Deployment

1. Run `shopify theme check --no-color --fail-level error` — must pass with 0 errors
2. Commit changes to `main` branch
3. Push to staging theme: `shopify theme push --theme <staging-theme-id>`
4. Verify on preview URL
5. Push to live: `shopify theme push --theme <live-theme-id> --publish`
