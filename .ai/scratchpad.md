# Scratchpad

===

createTsconfigStep.ts still writes the baseline into extends, which sync immediately removes.

===

createDistTsconfigStep.ts still references library.dist.json.

===

pnpm engrenage sync --check still reports drift in this repo’s own tsconfigs. The repo isn’t adopting the new layout yet, and the other producers (target, lib, types, base references) belong to the other sub-issues.

===

The config valibot schema should be used to generate a config interface with documentation comments for each field.
Right now, the config types are directly typed as infered schema types which means that peaking at the type definitions opens the source schema itself, and doesn't include any documentation comments for each field.
There could be two ways: either there's a way to include documentation comments directly in the valibot schema, or we find a way to extract jsdocs next to each field in the generated config interface.
I'd expect valibot to already have a "schema-to-interface" codegen tool, so we won't want to implement it ourselves.
