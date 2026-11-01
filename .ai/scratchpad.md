# Scratchpad

Ensure that the frontmatter of generated instruction files are synced. Since frontmatters are structured metadata, if should be relatively easy to compare and update them programmatically. Since the rules' body is managed by @reference blocks that might include user overwrite, this means the frontmatter synchronization should also allow a user to override it. Thus, I'd suggest a comment that the frontmatter was generated; if not present, the frontmatter isn't touched. Few considerations:

- ensure that YAML comments in the frontmatter are accepted at all
- must ensure it doesn't cause trouble with the tooling reading the frontmatter
- add a "refresh" or "force" command to rewrite the generated rules entirely so the comment is added on older files for future syncs
- if the frontmatter is manually edited by the user, the synchronization should respect those changes but log a warning or note indicating that the frontmatter has diverged from the generated state
