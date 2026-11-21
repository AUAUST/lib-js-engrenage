import {
  actions,
  commands as commandRole,
  executable,
  index,
} from "#project/roles/index";
import type { RecursiveLayout } from "#batiment/structure/index";

/**
 * The command tree of a program: every directory that is no role is a
 * command group.
 */
export const commands: RecursiveLayout = {
  nature: "recursive",
  name: "commands",
  roles: [index(), executable(), commandRole(), actions()],
  node: {
    label: "command group",
    description: "one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.",
  },
};
