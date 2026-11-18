---
"@auaust/engrenage": patch
---

- Add `agents dispatch <directory> --agent <name> --brief <file> [--effort <level>]`, running an agent headless in another checkout under that checkout's own instructions, agents, hooks and settings, and printing its session id and final report
- Add `agents dispatch <directory> --resume <session> --brief <file>` to resume a dispatched session
- Gate the stop of a Claude session running a gated agent, as a headless dispatch does, like a gated subagent's stop
