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

===

The codegen library should have a sort of filesystem abstration that allows having "virtualized" files for JSON/Yaml content.
The idea is that we can open some files as virtualized, manipulate their content in memory, and then write them back to the actual filesystem if needed (or diff them) without the serialization/deserialization overhead.
The idea is to enable larger step-by-step operations to be performed on the virtualized files in memory; in our current tooling where we have to read and write package.json, tsconfig and such repeatedly, but where each step typically changes only a small portion of the file content, this makes the thing straightforward and efficient. We can easily have our file opened once, edited efficiently in memory through path-based accessors, and then written back only when necessary. This abstraction would significantly reduce I/O overhead, and should be responsible for managing the consistency of files. I.e. opening a file to set only one field should not reformat the entire file but instead only change the key; same order, same formatting, and minimal changes should be preserved.
