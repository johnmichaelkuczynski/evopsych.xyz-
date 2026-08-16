---
name: api-server esbuild bundling quirks
description: Packages that break when bundled into the api-server dist
---
The api-server builds with esbuild into a single bundle; packages that read sibling data files at runtime must be added to the `external` list in its build script.
**Why:** pdfkit reads its standard-font `.afm` files relative to its package dir — bundling it caused ENOENT `dist/data/Helvetica.afm` in the built server (dev workflow builds too, so it fails immediately). Its fontkit/brotli chain also needs `@swc/helpers` installed as a real dependency.
**How to apply:** when adding a server dep that loads assets by path traversal, externalize it in the build config and keep it (plus runtime helper deps) in the package's dependencies.
