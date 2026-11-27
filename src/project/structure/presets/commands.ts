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
    description: "one directory per command group, whose `index.ts` declares its commands, each loading its own action module from `actions/`, and may mount commands another group's `index.ts` exports; the root group's `executable.ts` runs it; a group holds no other module.",
  },
};
