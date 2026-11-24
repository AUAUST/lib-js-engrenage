---
"@auaust/engrenage": patch
---

- Declare the Shopify theme namespaces, with the `liquid-theme` namespace kind and environment preset and the `liquid` language, in each scope selecting the `shopify-theme` preset
- Locate the Shopify theme Vite output only in scopes selecting the `shopify-theme` preset
- Add the `json` language
- Keep files of non-module languages out of workspace code globs
