import { getOwn } from "@auaust/toolkit/object";

import { listTsconfigRegistrations } from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

export async function listTsconfigEnvironments(
  config: ConfigResolver,
): Promise<readonly string[]> {
  const [registrations, context] = await Promise.all([
    listTsconfigRegistrations(config),
    config.resolve("structure.context"),
  ]);

  const { namespaces } = await context.discover();

  return registrations
    .filter(({ name }) => getOwn(namespaces, name)?.active === true)
    .map(({ name }) => name);
}
