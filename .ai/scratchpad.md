# Scratchpad

To the managed GitHub labels and fields, we'll want to have:

- an environment label/field that maps to the environments defined in engrenage
  - source, tests, tooling, bin, scripts, data
- the general nature
  - bug, feature, task, improvement
- the priority or urgency
  - low, medium, high, critical
- the status or state
  - blocked by other, missing info

We'll want to rely as much as possible on the new fields github provides instead of going all-label

===

Should make the CI/test timeout configurable, and configurable per environment

===

The debugger agent should be updated to be significantly more eager to flag potential issues as debt than others agents. Because its role is to identify and highlight potential problems early, and to prevent issues from escalating into larger problems down the line, it makes sense to jump in its already proactive approach and detect potential issues more aggressively.
