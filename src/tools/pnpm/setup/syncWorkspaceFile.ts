import { Document, isMap } from "yaml";

import { map } from "@auaust/primitive-kit/arrays";

import { workspaceFile } from "#tools/pnpm/constants";
import { parseWorkspaceDocument } from "#tools/pnpm/utils/parseWorkspaceDocument";
import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig } from "#project/config/index";

export async function syncWorkspaceFile({
  get,
}: OptionContext<Pick<ProjectConfig, "workspaces" | "filesystem">>) {
  const [workspaces, filesystem] = await Promise.all([
    get("workspaces"),
    get("filesystem"),
  ]);

  if (workspaces.length === 0) {
    return;
  }

  const packages = map(workspaces, ({ glob }) => glob);
  const content = filesystem.read(workspaceFile);

  const document =
    content === undefined ? new Document() : parseWorkspaceDocument(content);

  if (!isMap(document.contents)) {
    document.contents = document.createNode({ packages });
  } else if (document.has("packages")) {
    document.set("packages", packages);
  } else {
    document.contents.items.unshift(document.createPair("packages", packages));
  }

  filesystem.write(workspaceFile, document.toString());
}
