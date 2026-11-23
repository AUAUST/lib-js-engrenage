import type { Rule } from "eslint";

import type { Entity, NamespaceFileNames } from "#batiment/structure/index";

/**
 * A rule lint runs as an error on the files of the role its loader is keyed by.
 */
export interface RoleRule {
  /**
   * Rule run on the files of each role whose `roleRules` entry loads it; `create`
   * also receives the linted file's entity and its environment's index and entry
   * file names, and is skipped for files outside the structure.
   */
  readonly rule: {
    readonly meta?: Rule.RuleMetaData;
    create(
      context: Rule.RuleContext,
      entity: Entity,
      files: NamespaceFileNames,
    ): Rule.RuleListener;
  };
}
