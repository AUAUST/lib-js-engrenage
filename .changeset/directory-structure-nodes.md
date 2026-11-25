---
"@auaust/engrenage": minor
---

- Give each directory of a namespace spanning several directories its own `directory` structure node, holding its root files and described by its own `.namespace.json`
- Apply config `structure` keys below the namespace root in every directory of the namespace
- Fail on `children` set on the config `structure` root of a namespace spanning several directories
- Remove the `metafile-kind-conflict` diagnostic code, since metafiles of different directories no longer merge
