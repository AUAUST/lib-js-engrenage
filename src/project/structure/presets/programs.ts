import { commands } from "#project/structure/presets/commands";
import type { RecursiveLayout } from "#batiment/structure/index";

/**
 * Programs a directory source mounts: every directory of the environment root
 * is a program, and every directory below that is no role a command group, with
 * the roles of the `commands` layout.
 */
export const programs: RecursiveLayout = {
  ...commands,
  name: "programs",
  node: {
    label: "command group",
    description: "one directory per program, whose `index.ts` default-exports the program and whose optional `executable.ts` only hands it to nexus's `launch`; below it, one directory per command group, whose `index.ts` declares it; `actions/` holds one action module per command; any other module holds a command, several or a group, which a group's `index.ts` declares or loads.",
  },
};
