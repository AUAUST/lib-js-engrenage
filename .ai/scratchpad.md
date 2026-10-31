# Scratchpad

===

createTsconfigStep.ts still writes the baseline into extends, which sync immediately removes.

===

createDistTsconfigStep.ts still references library.dist.json.

===

pnpm engrenage sync --check still reports drift in this repo’s own tsconfigs. The repo isn’t adopting the new layout yet, and the other producers (target, lib, types, base references) belong to the other sub-issues.
