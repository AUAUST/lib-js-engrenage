import { matchesGlob } from "node:path";

import { syncBlocks } from "#foundation/blocks/index";
import { loadLazy } from "#foundation/modules/index";
import type { DirectiveDeclaration, LoadedConfig } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";

/**
 * Fills the blocks of every directive in the files the directives declare,
 * skipping the line markers extensions own.
 *
 * @throws {Error} A file matches no block syntax, or holds an unknown marker or
 * a directive that does not declare it.
 */
export async function syncDirectiveBlocks(config: LoadedConfig) {
  const { filesystem, registry } = config.context;

  const directives = registry.list("directives");

  const known = new Set(registry.list("markers").map(({ key }) => key));

  const [syntaxes, listed] = await Promise.all([
    registry.contributions("blocks.syntaxes", config),
    Promise.all(
      directives.map(async ({ declaration }) => {
        return new Set<File>(await declaration.files(config));
      }),
    ),
  ]);

  const files = new Set(
    listed.flatMap((set) => {
      return [...set];
    }),
  );

  function fillersOf(file: File): BlockFillers {
    const fillers: BlockFillers = {};

    for (const [
      index,
      { key: name, declaration, owner },
    ] of directives.entries()) {
      fillers[name] = listed[index]?.has(file)
        ? createFiller(declaration, file)
        : () => {
            throw new Error(
              `@${name} fills only the files ${owner.name} declares for it`,
            );
          };
    }

    return fillers;
  }

  function createFiller(declaration: DirectiveDeclaration, file: File) {
    return async (...args: string[]) => {
      const fill = await loadLazy(declaration);

      return fill({
        args,
        file,
        config,
      });
    };
  }

  await Promise.all(
    [...files].map(async (file) => {
      const content = await filesystem.read(file);

      if (content === undefined) {
        return;
      }

      const syntax = syntaxes.find(({ entry }) => {
        return entry.files.some((glob) => matchesGlob(file, glob));
      });

      if (syntax === undefined) {
        throw new Error(`${file} matches no block syntax`);
      }

      let synced: string;

      try {
        synced = await syncBlocks(content, syntax.entry, fillersOf(file), {
          known,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        throw new Error(`${file}: ${message}`, { cause: error });
      }

      await filesystem.write(file, synced);
    }),
  );
}
