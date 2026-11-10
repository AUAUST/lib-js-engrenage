import { Document, isMap } from "yaml";

import { map } from "@auaust/primitive-kit/arrays";

import { workspaceFile } from "#tools/pnpm/constants";
import { addWorkspaceSettings } from "#tools/pnpm/utils/addWorkspaceSettings";
import { parseWorkspaceDocument } from "#tools/pnpm/utils/parseWorkspaceDocument";
import type { LoadedConfig } from "#project/config/index";

export async function syncWorkspaceFile({ resolve, context }: LoadedConfig) {
  const [
    workspaces,
    filesystem,
  ] = await Promise.all([resolve("workspaces"), context.filesystem]);

  const content = await filesystem.read(workspaceFile);

  if (content === undefined && workspaces.length === 0) {
    return;
  }

  const document = content === undefined
    ? new Document()
    : parseWorkspaceDocument(content);

  if (workspaces.length > 0) {
    const packages = map(workspaces, ({ glob }) => glob);

    if (!isMap(document.contents)) {
      document.contents = document.createNode({ packages });
    } else if (document.has("packages")) {
      document.set("packages", packages);
    } else {
      document.contents.items.unshift(
        document.createPair("packages", packages),
      );
    }
  }

  const added = addWorkspaceSettings(document);

  if (workspaces.length === 0 && !added) {
    return;
  }

  await filesystem.write(workspaceFile, document.toString());
}
