import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import type { BlockSyntax } from "#types/BlockSyntax";
import type { Directory } from "#types/Directory";

export const markdownBlocks = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
} as const) satisfies BlockSyntax;

// @debt the marker repeats the form of `formatBlockMarker`, which this pure module cannot import from its confined role
export const endMarker = `${markdownBlocks.open}@end${markdownBlocks.close}`;

export const metalbrain = "metalbrain";

export const sharedFilesKind = "shared";

export const preserveDirective = "@preserve";

export const backlogCategoriesHeading = "## Open categories";

export const backlogTemplate = `${engrenage}/${metalbrain}/templates/backlog.md`;

export const rulesDirectory = ".claude/rules" satisfies Directory;
