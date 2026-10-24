import { fileURLToPath } from "node:url";

export function resolveFromRoot(root: URL, path: string): string {
  if (!root.pathname.endsWith("/")) {
    throw new Error(
      `The ESLint root must be a directory URL ending with "/": ${root.href}`,
    );
  }

  return fileURLToPath(new URL(path, root));
}
