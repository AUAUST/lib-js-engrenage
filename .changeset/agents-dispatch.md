---
"@auaust/engrenage": patch
---

- Add `agents dispatch <directory> --client <runtime> --agent <name> --brief <file> [--effort <level>]`, running an agent headless in another checkout through the named runtime's client, under that checkout's own instructions, agents, hooks and settings, and printing its session id and final report
- Add `agents dispatch <directory> --client <runtime> --resume <session> --brief <file>` to resume a dispatched session
- Gate the stop of a Claude session running a gated agent, as a headless dispatch does, like a gated subagent's stop
