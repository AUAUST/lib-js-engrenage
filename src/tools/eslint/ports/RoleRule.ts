import type { Rule } from "eslint";

import type { Entity, NamespaceFileNames } from "#batiment/structure/index";
import type { ModuleResolver } from "#tools/eslint/apis/ModuleResolver";

/**
 * A rule lint runs as an error on the files of the role its loader is keyed by.
 */
export interface RoleRule {
  /**
   * Rule run on the files of each role whose `roleRules` entry loads it; `create`
   * also receives the linted file's entity, its environment's index and entry
   * file names, and the resolver of the modules it meets to their entities, and
   * is skipped for files outside the structure.
   */
  readonly rule: {
    readonly meta?: Rule.RuleMetaData;
    create(
      context: Rule.RuleContext,
      entity: Entity,
      files: NamespaceFileNames,
      modules: ModuleResolver,
    ): Rule.RuleListener;
  };
}
