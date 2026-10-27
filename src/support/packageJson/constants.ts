import { freeze } from "@auaust/toolkit/object";

export const dependencyFields = freeze([
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const);

export const initialVersion = "0.0.0";

export const publicLicense = "GPL-3.0-only";

export const privateLicense = "UNLICENSED";

export const visibilities = freeze(["public", "private"] as const);
