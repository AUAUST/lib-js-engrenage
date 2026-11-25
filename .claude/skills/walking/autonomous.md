<!-- @reference @auaust/engrenage/metalbrain/skills/walking/autonomous.md -->

# Autonomous walks

Applies on top of the walking skill when the walk request holds `autonomous`: where a row here covers a step of the walking skill, it replaces that step; `walking §…` names the skill's sections.

The user delegated every decision the instructions let an agent settle and is not there to answer: never ask them or wait for them.

| Walking step                                                                 | Autonomously                                                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Batching questions to the user                                               | Send them to the consultant; the issues it cannot settle stay set aside                          |
| Asking to clear a `drafting` claim                                           | Set the issue aside                                                                              |
| Messaging the user: commit lines, held work, light gaps a permission refuses | Put held work and refused light gaps in your final report; send no commit line                   |
| Starting the consultant (walking §Consultant)                                | Brief it `autonomous` as well                                                                    |
| The final report (walking §Report)                                           | After the merger runs' findings, list every decision the consultant settled, from its carry-over |

<!-- @end -->
