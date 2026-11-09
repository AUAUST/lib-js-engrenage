import type { Registry } from "#foundation/extensions/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";

export function checkFileParts(
  registry: Registry<Extension, ConfigResolver>,
): void {
  const findings: string[] = [];

  for (const { key: part, owner } of registry.list("parts")) {
    const file = part.slice(0, part.indexOf("#"));

    const fileOwner = registry.owner("files", file);

    if (fileOwner === undefined) {
      findings.push(
        `${owner.name} owns part "${part}" of "${file}", which no extension owns`,
      );
    } else if (registry.get("files", file)?.parts !== true) {
      findings.push(
        `${owner.name} owns part "${part}", but ${fileOwner.name} does not open "${file}" to parts`,
      );
    }
  }

  if (findings.length > 0) {
    throw new Error(`Invalid extensions:\n${findings.join("\n")}`);
  }
}
