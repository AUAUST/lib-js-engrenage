---
"@auaust/engrenage": patch
---

- Enforce consistent property quotes with `auaust/quote-props` (all quoted or none, methods and shorthand left alone) and set Prettier's `quoteProps` to `preserve`
- Keep quoted keys in long form with `auaust/object-shorthand` while accepting quoted method shorthand
- Prefer type arguments on the constructor with `auaust/consistent-generic-constructors`
- Pad switch cases only once a case body spans several lines or the switch already uses blank lines
- Let `delegateRule` take its name and the upstream messages to ignore as options
