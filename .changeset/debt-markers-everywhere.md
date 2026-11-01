---
"@auaust/engrenage": patch
---

- Apply the `debt-markers` agent rule to all files and let agents mark debt they notice in files they only read, without searching for it
- Allow only technical or required comments in the `implementation` agent instructions, and forbid comments that describe the code
- Make agents try an alternative before changing repository-wide configuration, and report each such change separately
- Define debt in the `debt-markers` agent rule by its gap to the ideal code instead of a list of signs, and treat any doubt as debt
