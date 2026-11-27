import type { ForwardingCommandDeclaration } from "#nexus/cli/types/ForwardingCommandDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";

export type CommandDeclaration =
  | ParsingCommandDeclaration
  | ForwardingCommandDeclaration;
