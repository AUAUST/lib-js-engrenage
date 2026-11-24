---
"@auaust/engrenage": patch
---

- Deny a Bash call passing `metalbrain` an argument the shell expands, naming the single-quote fix
- Read ANSI-C `$'…'` quoted words as their text, and unquoted brace expansions and leading tildes as expansions, in the shell guards
- State in every record command's help that text arguments go in single quotes
