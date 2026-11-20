import { rootScope } from "#batiment/scopes/constants";

export function getEnvironmentId(scope: string, name: string): string {
  return scope === rootScope ? name : `${scope}/${name}`;
}
