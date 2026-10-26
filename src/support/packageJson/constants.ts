import { freeze } from "@auaust/toolkit/object";

export const dependencyFields = freeze([
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const);
