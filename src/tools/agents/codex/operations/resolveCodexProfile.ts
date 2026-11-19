import { parseDocument } from "yaml";

import { loadFormatter } from "#project/format/index";
import { getCodexProfiles } from "#tools/agents/codex/operations/getCodexProfiles";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import type { LoadedConfig } from "#project/config/index";

export async function resolveCodexProfile(config: LoadedConfig, name: string) {
  const { filesystem } = config.context;

  const profiles = await getCodexProfiles({
    extensions: await listActiveExtensions(config),
    fillers: await createAgentFillers(config),
    config,
    formatter: await loadFormatter(config),
  });

  const profile = profiles.find((candidate) => candidate.name === name);

  if (profile === undefined) {
    return;
  }

  const skill = await filesystem.read(profile.skillFile);

  if (!skill?.includes(formatReferenceMarker(profile.reference))) {
    throw new Error(
      `Missing or conflicting generated skill ${profile.skillFile} for Codex profile ${name}`,
    );
  }

  const policy = await filesystem.read(profile.policyFile);

  const parsed = parseDocument(policy ?? "");
  const implicit = profile.invocation === "implicit";

  if (
    policy === undefined ||
    parsed.errors.length > 0 ||
    parsed.getIn(["policy", "allow_implicit_invocation"]) !== implicit
  ) {
    throw new Error(
      `Missing or conflicting generated metadata ${profile.policyFile} for Codex profile ${name}`,
    );
  }

  if ((await filesystem.read(profile.file)) !== profile.content) {
    throw new Error(
      `Missing or conflicting generated Codex profile ${profile.file}: sync agents first`,
    );
  }

  return profile;
}
