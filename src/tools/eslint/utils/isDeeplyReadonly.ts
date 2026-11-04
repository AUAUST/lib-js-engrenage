import { isPropertyReadonlyInType } from "ts-api-utils";
import {
  SignatureKind,
  TypeFlags,
  type TupleTypeReference,
  type Type,
  type TypeChecker,
  type TypeReference,
} from "typescript";

const mutableCollections = new Set([
  "Array",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
]);

export function isDeeplyReadonly(
  type: Type,
  checker: TypeChecker,
  seen = new Set<Type>(),
): boolean {
  if (seen.has(type)) {
    return true;
  }

  seen.add(type);

  if (type.isUnionOrIntersection()) {
    return type.types.every((member) =>
      isDeeplyReadonly(member, checker, seen),
    );
  }

  if (
    (type.flags & TypeFlags.Object) === 0 ||
    checker.getSignaturesOfType(type, SignatureKind.Call).length > 0 ||
    checker.getSignaturesOfType(type, SignatureKind.Construct).length > 0
  ) {
    return true;
  }

  const name = type.getSymbol()?.getName();

  if (name !== undefined && mutableCollections.has(name)) {
    return false;
  }

  if (
    checker.isTupleType(type) &&
    !(type as TupleTypeReference).target.readonly
  ) {
    return false;
  }

  if (
    checker.isArrayType(type) ||
    checker.isTupleType(type) ||
    name === "ReadonlyMap" ||
    name === "ReadonlySet"
  ) {
    return checker
      .getTypeArguments(type as TypeReference)
      .every((element) => isDeeplyReadonly(element, checker, seen));
  }

  return (
    checker.getPropertiesOfType(type).every((property) => {
      return (
        isPropertyReadonlyInType(type, property.escapedName, checker) &&
        isDeeplyReadonly(checker.getTypeOfSymbol(property), checker, seen)
      );
    }) &&
    checker.getIndexInfosOfType(type).every((info) => {
      return info.isReadonly && isDeeplyReadonly(info.type, checker, seen);
    })
  );
}
