import { parseDocument } from "yaml";

import { getCodexProfiles } from "#tools/agents/codex/operations/getCodexProfiles";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import type { Filesystem } from "#foundation/filesystem/index";
import type { BlockFillers } from "#types/BlockFillers";

export async function resolveCodexProfile(
  { filesystem, fillers }: { filesystem: Filesystem; fillers: BlockFillers },
  name: string,
) {
  const profiles = await getCodexProfiles(fillers);

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
