---
"@auaust/engrenage": minor
---

- Add the `fetch` API group: `fetch`, `Request`, `Response`, `Headers`, `FormData` and their init types, without browser globals
- Generate the API groups from TypeScript's worker lib, dropping the browser-only `performance.timing`, `performance.navigation`, `EventCounts` and the `MediaSource` overload of `URL.createObjectURL`
