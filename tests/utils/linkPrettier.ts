import { linkPackage } from "#tests/utils/linkPackage";

export function linkPrettier(target: string) {
  linkPackage("prettier", target);
}
