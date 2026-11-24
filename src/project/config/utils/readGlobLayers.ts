import { isPlainObject } from "@auaust/toolkit";
import { map } from "@auaust/toolkit/array";
import { entries, getOwn, record } from "@auaust/toolkit/object";

import { applyInputDefaults, type InputLayer } from "#foundation/options/index";
import { flattenInput } from "#project/config/utils/flattenInput";
import type { Reporter } from "#foundation/reports/index";
import type { InputScope } from "#project/config/types/InputScope";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Glob } from "#types/Glob";

function pickInputs(
  scopes: ReadonlyMap<string, InputScope>,
  entry: unknown,
): RawConfig {
  if (!isPlainObject(entry)) {
    return {};
  }

  return record(
    entries(entry)
      .filter(([key]) => scopes.has(key))
      .flatMap(([key, value]) => entries(flattenInput(key, value))),
  );
}

function readGlobEntry(workspaces: unknown, glob: Glob): unknown {
  if (!isPlainObject(workspaces) || !isPlainObject(workspaces.globs)) {
    return;
  }

  return getOwn(workspaces.globs, glob);
}

/**
 * The config keys the `workspaces.globs` entry of `glob` sets, as input layers:
 * the one `raw` sets, then the one each of the root's `defaults` layers sets.
 */
export function readGlobLayers({
  raw,
  glob,
  defaults,
  scopes,
  reporter,
}: {
  raw: RawConfig;
  glob: Glob;
  defaults: readonly InputLayer[];
  scopes: ReadonlyMap<string, InputScope>;
  reporter: Reporter;
}): {
  readonly configured: InputLayer;
  readonly inherited: readonly InputLayer[];
} {
  const label = `workspaces.globs "${glob}"`;

  const configured = readGlobEntry(raw.workspaces, glob);

  const inherited = map(defaults, (layer) => {
    const {
      value,
    } = applyInputDefaults(undefined, "workspaces", [layer], reporter);

    return {
      name: `${layer.name} for ${label}`,
      values: pickInputs(scopes, readGlobEntry(value, glob)),
    };
  });

  return {
    configured: { name: label, values: pickInputs(scopes, configured) },
    inherited,
  };
}
