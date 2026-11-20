import type { ParamExp } from "sh-syntax";

export function readPlainParameter(part: ParamExp) {
  const plain = (
    part.flags == null &&
    !part.excl &&
    !part.length &&
    !part.width &&
    !part.isSet &&
    part.split === 0 &&
    part.globSubst === 0 &&
    part.rcExpand === 0 &&
    part.nestedParam == null &&
    part.index == null &&
    part.subscripts.length === 0 &&
    part.modifiers.length === 0 &&
    part.slice == null &&
    part.repl == null &&
    part.names === 0 &&
    part.exp == null
  );

  return plain ? part.param?.value : undefined;
}
