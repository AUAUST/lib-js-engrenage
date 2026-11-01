# Scratchpad

Ensure that the frontmatter of generated instruction files are synced. Since frontmatters are structured metadata, if should be relatively easy to compare and update them programmatically. Since the rules' body is managed by @reference blocks that might include user overwrite, this means the frontmatter synchronization should also allow a user to override it. Thus, I'd suggest a comment that the frontmatter was generated; if not present, the frontmatter isn't touched. Few considerations:

- ensure that YAML comments in the frontmatter are accepted at all
- must ensure it doesn't cause trouble with the tooling reading the frontmatter
- add a "refresh" or "force" command to rewrite the generated rules entirely so the comment is added on older files for future syncs
- if the frontmatter is manually edited by the user, the synchronization should respect those changes but log a warning or note indicating that the frontmatter has diverged from the generated state

===

Agents tend to take on responsibilities of prompts despite dedicated agents being available for specific tasks. This leads to poorer performance and less efficient handling of tasks. Thus, we should consider a global instruction that encourages agents to only take on tasks that don't have dedicated agents available; this should however not overlap when an agent is explicitly called. I.e. an agent explicitly invoked for a task should not try to delegate it because of that instruction.

===

Should consider a debugger agent. Since we want to always rely on Sonnet as a default agent to route prompts, it's annoying to switch model constantly only when debugging. And because no debugger agent is currently defined, we always have to specify "do it yourself" to avoid unintended delegation of debugging tasks to a worker or planner that would not proceed correctly.

The worker agent should be able to take in debt markers, github issues, backlog entries or any direct task assignments and process them. If the issue can be resolved automatically, it should do so; otherwise, it should open a GitHub issue that tracks the problem, deleting the corresponding backlog entry. It should state the nature of the problem, and optionally ask questions to direct the resolution process.

For these more complex tasks, the debugger should thus switch to the role of a "scoped planner". It should be responsible for understanding and analyzing the problem, determining the appropriate course of action and define the steps in the issue. After that, it would be a worker's responsibility to execute the defined steps and report back on the progress or completion of the task.

===

This logs multiple times while testing:

(node:67085) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of engrenage.config.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to package.json.

Fix is likely to add `"type": "module"` to all fixture package.json files.

===

The tests trigger several "No engrenage config found in ... using defaults" warnings. The message is expected when running the CLI, but during tests the console should likely be silenced.

Same for "The base tsconfig tsconfig.app.json is not named tsconfig.json, the only name editors and typed lint discover"

===

The planned github labels sync should be a seperate subcommand, not a part of the main sync command. `engrenage github labels`-base, like agents have their own dedicated commands. It should allow diffing the current proposed labels and the existing labels on GitHub. It should then show 3 lists: the list of matches, the list of missing labels that allows picking those to add (all by default), and the list of extra labels that allows picking those to remove (none by default). Same for bug severities and the other fields we end up defining.
