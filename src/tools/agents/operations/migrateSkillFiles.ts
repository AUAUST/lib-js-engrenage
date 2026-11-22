import { posix } from "node:path";

import { engrenage } from "#constants";
import {
  isSupportingReference,
  listFormerReferences,
} from "#metalbrain/instructions/index";
import {
  formerCodexFiles,
  metalbrain,
  skillFileName,
} from "#tools/agents/constants";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import { isSkillFileReference } from "#tools/agents/utils/isSkillFileReference";
import { listReferences } from "#tools/agents/utils/listReferences";
import { relocateInstructionReference } from "#tools/agents/utils/relocateInstructionReference";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension } from "#project/config/index";
import type { AgentRuntime } from "#tools/agents/ports/AgentRuntime";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { SkillDefinition } from "#tools/agents/types/SkillDefinition";
import type { Directory } from "#types/Directory";

function isEngrenageSkillReference(reference: string): boolean {
  return relocateInstructionReference(reference).startsWith(
    `${engrenage}/${metalbrain}/skills/`,
  );
}

const generatedSkillFiles = [skillFileName, formerCodexFiles.skillMetadata];

async function removeSupportingFiles(
  filesystem: Filesystem,
  directory: Directory,
  isRemoved: (reference: string) => boolean,
) {
  for (const file of await filesystem.glob(`${directory}/*.md`)) {
    if (posix.basename(file) === skillFileName) {
      continue;
    }

    const references = listReferences((await filesystem.read(file)) ?? "");

    if (references.some(isRemoved)) {
      await filesystem.remove(file);
    }
  }
}

async function removeSkillFiles(
  filesystem: Filesystem,
  directory: Directory,
  reference: string,
) {
  await removeSupportingFiles(filesystem, directory, (found) => {
    return isSkillFileReference(found, reference);
  });

  for (const file of generatedSkillFiles) {
    await filesystem.remove(`${directory}/${file}`);
  }
}

async function moveSkillDirectory(
  filesystem: Filesystem,
  {
    from,
    to,
    reference,
  }: { from: Directory; to: Directory; reference: string },
  rewrite: (content: string) => string,
) {
  if (from !== to && (await filesystem.isDirectory(to))) {
    return removeSkillFiles(filesystem, from, reference);
  }

  for (const file of await filesystem.list(from)) {
    const content = await filesystem.read(file);

    const target = `${to}${file.slice(from.length)}`;

    if (content !== undefined) {
      const rewritten = rewrite(content);

      if (target !== file || rewritten !== content) {
        await filesystem.write(target, rewritten);
      }
    }

    if (target !== file) {
      await filesystem.remove(file);
    }
  }
}

export async function migrateSkillFiles(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  extensions: readonly Extension[];
  runtimes: readonly AgentRuntime[];
}) {
  const { filesystem } = config;

  const preferred = config.agents.preferred ?? [];

  const runtimes = config.runtimes.filter(({ name }) => {
    return preferred.some((agent) => agent === name);
  });

  const definitions = await getSkillDefinitions({
    extensions: config.extensions,
  });

  const owners = new Map<string, SkillDefinition>();

  for (const definition of definitions) {
    owners.set(definition.reference, definition);

    for (const former of listFormerReferences(definition)) {
      owners.set(former, definition);
    }
  }

  const names = new Map<string, SkillDefinition>();

  for (const definition of definitions) {
    if (!isEngrenageSkillReference(definition.reference)) {
      continue;
    }

    for (const name of [definition.name, ...(definition.formerly ?? [])]) {
      names.set(name, definition);
    }
  }

  function findOwned(content: string) {
    return listReferences(content).find((reference) => {
      return owners.has(reference) || isEngrenageSkillReference(reference);
    });
  }

  function findDefinition(reference: string): SkillDefinition | undefined {
    return (
      owners.get(reference) ??
      (isEngrenageSkillReference(reference)
        ? names.get(posix.basename(reference, ".md"))
        : undefined)
    );
  }

  function rewriteTo(definition: SkillDefinition, reference: string) {
    const formers = [reference, ...listFormerReferences(definition)];

    const { dir, name } = posix.parse(definition.reference);

    return (content: string) => {
      const renames = listReferences(content).flatMap((found) => {
        if (formers.includes(found)) {
          return [[found, definition.reference] as const];
        }

        return formers.some((former) => isSupportingReference(found, former))
          ? [[found, `${dir}/${name}/${posix.basename(found)}`] as const]
          : [];
      });

      return renames.reduce((current, [from, to]) => {
        return current
          .split(formatReferenceMarker(from))
          .join(formatReferenceMarker(to));
      }, content);
    };
  }

  for (const { skills: directory } of runtimes) {
    if (directory === undefined) {
      continue;
    }

    for (const file of await filesystem.glob(
      `${directory}/*/${skillFileName}`,
    )) {
      const reference = findOwned((await filesystem.read(file)) ?? "");

      if (reference === undefined) {
        continue;
      }

      const definition = findDefinition(reference);
      const from = posix.dirname(file);

      if (definition === undefined) {
        await removeSkillFiles(filesystem, from, reference);

        continue;
      }

      const to = `${directory}/${definition.name}`;

      if (from !== to || reference !== definition.reference) {
        await moveSkillDirectory(
          filesystem,
          {
            from,
            to,
            reference,
          },
          rewriteTo(definition, reference),
        );
      }

      const shipped = new Set(
        definition.supporting.map((supported) => {
          return supported.reference;
        }),
      );

      await removeSupportingFiles(filesystem, to, (found) => {
        return (
          isSupportingReference(found, definition.reference) &&
          !shipped.has(found)
        );
      });
    }
  }

  for (const file of await filesystem.glob(
    `${formerCodexFiles.skills}/*/${skillFileName}`,
  )) {
    const reference = findOwned((await filesystem.read(file)) ?? "");

    if (reference !== undefined) {
      await removeSkillFiles(filesystem, posix.dirname(file), reference);
    }
  }

  for (const file of await filesystem.glob(
    `${formerCodexFiles.agents}/*.toml`,
  )) {
    const content = await filesystem.read(file);

    if (content?.startsWith(formerCodexFiles.provenance) === true) {
      await filesystem.remove(file);
    }
  }

  // @debt branches on the runtime's name for its agent file pattern and ownership test, so a contributed runtime's agent files are never migrated
  for (const { name, agents: directory } of runtimes) {
    if (directory === undefined) {
      continue;
    }

    if (name === "claude") {
      for (const file of await filesystem.glob(`${directory}/*.md`)) {
        const content = (await filesystem.read(file)) ?? "";
        const reference = findOwned(content);

        if (reference === undefined) {
          continue;
        }

        const definition = findDefinition(reference);

        const target = definition?.agent === undefined
          ? undefined
          : `${directory}/${definition.agent.name}.md`;

        if (definition !== undefined && file === target) {
          if (reference !== definition.reference) {
            await filesystem.write(
              file,
              rewriteTo(definition, reference)(content),
            );
          }

          continue;
        }

        if (
          definition !== undefined &&
          target !== undefined &&
          !(await filesystem.exists(target))
        ) {
          await filesystem.write(
            target,
            rewriteTo(definition, reference)(content),
          );
        }

        await filesystem.remove(file);
      }
    }
  }

  const renames = definitions.flatMap((definition) => {
    return listFormerReferences(definition).map((former) => {
      return {
        from: formatReferenceMarker(former),
        to: formatReferenceMarker(definition.reference),
      };
    });
  });

  if (renames.length === 0) {
    return;
  }

  for (const file of await filesystem.glob(config.agents.instructionFiles)) {
    const content = await filesystem.read(file);

    if (content === undefined) {
      continue;
    }

    const rewritten = renames.reduce((current, { from, to }) => {
      return current.split(from).join(to);
    }, content);

    if (rewritten !== content) {
      await filesystem.write(file, rewritten);
    }
  }
}
