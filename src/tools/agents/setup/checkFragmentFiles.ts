import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
import { listMentionedFiles } from "#tools/agents/utils/listMentionedFiles";
import { listReferenceBlocks } from "#tools/agents/utils/listReferenceBlocks";
import { throwViolations } from "#tools/agents/utils/throwViolations";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * @throws {Error} A filled `@reference` block names a project file that
 * does not exist.
 */
export async function checkFragmentFiles(config: LoadedConfig): Promise<void> {
  const { filesystem, registry } = config.context;

  if (!hasPreferredAgents(await config.resolve("agents"))) {
    return;
  }

  const directive = registry.list("directives").find(({ key }) => {
    return key === "reference";
  });

  if (directive === undefined) {
    throw new Error("The reference directive is not registered");
  }

  const violations = new Map<string, Map<File, File>>();

  for (const file of await directive.declaration.files(config)) {
    const content = (await filesystem.read(file)) ?? "";

    for (const { reference, body } of listReferenceBlocks(content)) {
      const missing = violations.get(reference) ?? new Map<File, File>();

      for (const path of listMentionedFiles(body)) {
        if (!missing.has(path) && !(await filesystem.exists(path))) {
          missing.set(path, file);
        }
      }

      if (missing.size > 0) {
        violations.set(reference, missing);
      }
    }
  }

  throwViolations(
    "Instruction fragments reference project files that do not exist; create each file or remove its fragment:",
    [...violations].flatMap(([reference, missing]) => {
      return [...missing].map(([path, file]) => {
        return `${reference} (in ${file}): ${path}`;
      });
    }),
  );
}
