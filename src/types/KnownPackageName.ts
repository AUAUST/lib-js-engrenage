import type { packages } from "#constants";

export type KnownPackageName = (typeof packages)[keyof typeof packages];
