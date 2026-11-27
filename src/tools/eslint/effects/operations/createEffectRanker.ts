import { join } from "node:path";

import {
  SymbolFlags,
  type Program,
  type SourceFile,
  type Symbol,
  type TypeChecker,
} from "typescript";

import {
  rankMember,
  rankUnit,
  type ResolvedEffects,
} from "#batiment/effects/index";
import { relativeWithin } from "#foundation/filesystem/index";
import type { EntityIndex } from "#batiment/structure/index";
import type { RankedUnit } from "#tools/eslint/effects/types/RankedUnit";
import type { Directory } from "#types/Directory";

/**
 * Ranks the modules and bindings a file imports: an internal one by its entity's
 * ceilings, an external one by the configured and shipped ranks.
 */
export function createEffectRanker({
  program,
  checker,
  entities,
  effects,
  root,
}: {
  program: Program;
  checker: TypeChecker;
  entities: EntityIndex;
  effects: ResolvedEffects;
  root: Directory;
}) {
  function isExternal(file: SourceFile) {
    // @debt A `/node_modules/` substring decides what is external; a symlinked workspace package resolves to its real path and may fall through `entityOf` unranked and unreported.
    return (
      program.isSourceFileFromExternalLibrary(file) ||
      file.fileName.includes("/node_modules/")
    );
  }

  function rankInternal(file: SourceFile): RankedUnit | undefined {
    const declaring = entities.entityOf(file.fileName);

    if (declaring === undefined) {
      return;
    }

    const relativePath = relativeWithin(
      join(root, declaring.path),
      file.fileName,
    );

    return {
      unit: declaring.role === undefined
        ? relativePath
        : `${declaring.role} (${relativePath})`,
      // @debt A value declared in a local ambient `declare module` resolves to the unranked `declarations` role, so a ranked importer of that module is reported as importing an unranked target.
      target: (
        declaring.effects ?? {
          evaluation: undefined,
          invocation: undefined,
        }
      ),
    };
  }

  function declaringFile(symbol: Symbol | undefined) {
    if (symbol === undefined) {
      return;
    }

    const target = (symbol.flags & SymbolFlags.Alias) === 0
      ? symbol
      : checker.getAliasedSymbol(symbol);

    if (
      target.declarations?.length === 0 ||
      (target.flags & SymbolFlags.Value) === 0
    ) {
      return;
    }

    // @debt Only the first declaration ranks a merged symbol; declarations spread over several files may rank differently.
    return target.declarations?.[0]?.getSourceFile();
  }

  /**
   * The rank of the module `specifier` loads: its role's ceilings, else its
   * configured rank, `undefined` for an external module nothing ranks.
   */
  function rankModule(
    module: Symbol | undefined,
    specifier: string,
  ): RankedUnit | undefined {
    const file = module?.declarations?.[0]?.getSourceFile();

    if (file === undefined) {
      return;
    }

    if (!isExternal(file)) {
      return rankInternal(file);
    }

    const { level, evaluation } = rankUnit(effects, specifier);

    return evaluation === undefined
      ? undefined
      : {
          unit: `the module \`${specifier}\``,
          target: { evaluation, invocation: level },
        };
  }

  /**
   * The rank of the binding `imported` from `specifier` that `symbol` declares,
   * `undefined` for an external binding nothing ranks.
   */
  function rankBinding(
    symbol: Symbol | undefined,
    specifier: string,
    imported: string,
  ): RankedUnit | undefined {
    const file = declaringFile(symbol);

    if (file === undefined) {
      return;
    }

    if (!isExternal(file)) {
      return rankInternal(file);
    }

    const invocation = rankMember(effects, specifier, imported);

    return invocation === undefined
      ? undefined
      : {
          unit: `the module \`${specifier}\``,
          target: {
            evaluation: rankUnit(effects, specifier).evaluation,
            invocation,
          },
        };
  }

  return { rankModule, rankBinding };
}
