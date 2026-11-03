# file-editing

In-memory editing of JSON and YAML files in the codegen tooling.

## 1. No virtualized files for JSON and YAML.

- why: tooling steps read and write `package.json`, tsconfigs and similar files repeatedly, though each step changes a small part of the content. Related: #153 (init builds its answers on a declarative config state).
- want: a filesystem abstraction in the codegen support code that opens a file as a virtual file, edits it in memory through path-based accessors, and writes it back only when needed (or diffs it). It manages file consistency and preserves formatting: setting one field changes only that key, keeping order, formatting and everything else. Fewer reads and writes, and steps that compose over one open file.
- done: sync and init steps edit files through the abstraction and a single-field edit leaves the rest of the file byte-identical.
