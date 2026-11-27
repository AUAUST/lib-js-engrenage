import { actions, executable, index } from "#project/roles/index";
import type { RecursiveLayout } from "#batiment/structure/index";

/**
 * The command tree of a program: every directory that is no role is a
 * command group.
 */
export const commands: RecursiveLayout = {
  nature: "recursive",
  name: "commands",
  roles: [index(), executable(), actions()],
  node: {
    label: "command group",
    description: "one directory per command group, whose `index.ts` declares it; the root group's `executable.ts` runs it and `actions/` holds one action module per command; any other module holds a command, several or a group, which a group's `index.ts` declares or loads.",
  },
};
