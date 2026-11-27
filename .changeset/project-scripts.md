---
"@auaust/engrenage": patch
---

- Add `engrenage run <script>`, running a program a directory of the scripts environment holds
- Run a project script as `engrenage <script>` when no engrenage command has its name, and list the scripts in `engrenage --help`
- Add the `programs` layout, the scripts environment's default: each top-level directory's `index.ts` default-exports a program, its optional `executable.ts` only hands it to `launch`
- Keep listing every other command in `--help` and usage errors when a command mount fails to load, reporting its error beside them
