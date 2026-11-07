import { parseDocument } from "yaml";

import { getCodexProfiles } from "#tools/agents/codex/operations/getCodexProfiles";
import type { Filesystem } from "#foundation/filesystem/index";

export async function resolveCodexProfile(
  filesystem: Filesystem,
  name: string,
) {
  const profiles = await getCodexProfiles();

  const profile = profiles.find((candidate) => candidate.name === name);

  if (profile === undefined) {
    return;
  }

  if (
    profile.gate &&
    profile.role !== "worker" &&
    profile.role !== "debugger"
  ) {
    throw new Error(
      `Unsupported canonical gated Codex role ${profile.role} in profile ${name}`,
    );
  }

  const skill = await filesystem.read(profile.skillFile);

  if (!skill?.includes(`<!-- @reference ${profile.reference} -->`)) {
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
