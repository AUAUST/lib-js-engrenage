import { resolveListOption } from "#config/utils/resolveListOption";
import type { ListOption } from "#config/types/ListOption";
import type { ApiGroup } from "#typescript/types/ApiGroup";

export function resolveSourceApis(
  option: ListOption<ApiGroup> | undefined,
): readonly ApiGroup[] {
  return resolveListOption(option, () => [], "src.apis");
}
