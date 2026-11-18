import type { Registry } from "#foundation/extensions/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";

export function checkDirectiveNames(
  registry: Registry<Extension, ConfigResolver>,
): void {
  const findings: string[] = [];

  const markers = new Map(
    registry.list("markers").map(({ key, owner }) => [key, owner]),
  );

  if (markers.has("end")) {
    findings.push(
      `${markers.get("end")?.name} owns the reserved marker name "end"`,
    );
  }

  for (const { key: name, owner } of registry.list("directives")) {
    if (name === "end") {
      findings.push(`${owner.name} owns the reserved directive name "end"`);
    }

    const markerOwner = markers.get(name);

    if (markerOwner !== undefined) {
      findings.push(
        `${owner.name} owns directive "${name}", which ${markerOwner.name} owns as a marker`,
      );
    }
  }

  if (findings.length > 0) {
    throw new Error(`Invalid extensions:\n${findings.join("\n")}`);
  }
}
