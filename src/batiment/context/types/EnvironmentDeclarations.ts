import type { DeclaredEnvironment } from "#batiment/structure/index";

export interface EnvironmentDeclarations extends Omit<
  DeclaredEnvironment,
  "dirs" | "active" | "read"
> {}
