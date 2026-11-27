import type { HelpListing } from "#nexus/cli/types/HelpListing";
import type { HelpOption } from "#nexus/cli/types/HelpOption";

/**
 * Everything a program's help states of the commands under a path: the program's
 * name, the run options every command but a forwarding one accepts, its reserved
 * flags among them, and each listing.
 */
export interface HelpContract {
  readonly program: string;
  readonly runOptions: readonly HelpOption[];
  readonly listings: readonly HelpListing[];
}
