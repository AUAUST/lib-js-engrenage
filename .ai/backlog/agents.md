# agents

Shared agent fragments and their init and sync consumers.

## 1. Skills are duplicated across agent directories.

- Matter: each agent directory receives its own copy of the skills, which bloats consumer repositories.
- To investigate: whether the supported agents can read a shared skills directory, so skills are centralized rather than duplicated.
- Done when support is established or ruled out per agent, and the sync output follows the result.
