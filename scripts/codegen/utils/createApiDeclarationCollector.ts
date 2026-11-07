import {
  forEachChild,
  isExpressionWithTypeArguments,
  isFunctionDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
  isPropertyAccessExpression,
  isQualifiedName,
  isTypeAliasDeclaration,
  isTypeQueryNode,
  isTypeReferenceNode,
  isVariableStatement,
  type EntityName,
  type Node,
  type SourceFile,
  type Statement,
} from "typescript";

function declaredNames(statement: Statement): string[] {
  if (
    isInterfaceDeclaration(statement) ||
    isTypeAliasDeclaration(statement) ||
    (isFunctionDeclaration(statement) && statement.name !== undefined)
  ) {
    return statement.name === undefined ? [] : [statement.name.text];
  }

  if (isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap(({ name }) => {
      return isIdentifier(name) ? [name.text] : [];
    });
  }

  return [];
}

function leftmost(name: Node): string | undefined {
  let current = name;

  while (isQualifiedName(current)) {
    current = current.left;
  }

  while (isPropertyAccessExpression(current)) {
    current = current.expression;
  }

  return isIdentifier(current) ? current.text : undefined;
}

function referencedNames(statement: Statement): string[] {
  const names: string[] = [];

  function visit(node: Node) {
    let reference: EntityName | Node | undefined;

    if (isTypeReferenceNode(node)) {
      reference = node.typeName;
    } else if (isExpressionWithTypeArguments(node)) {
      reference = node.expression;
    } else if (isTypeQueryNode(node)) {
      reference = node.exprName;
    }

    const name = reference === undefined ? undefined : leftmost(reference);

    if (name !== undefined) {
      names.push(name);
    }

    forEachChild(node, visit);
  }

  visit(statement);

  return names;
}

function indexStatements(source: SourceFile): Map<string, number[]> {
  const index = new Map<string, number[]>();

  source.statements.forEach((statement, position) => {
    for (const name of declaredNames(statement)) {
      index.set(name, [...(index.get(name) ?? []), position]);
    }
  });

  return index;
}

export function createApiDeclarationCollector(source: SourceFile) {
  const index = indexStatements(source);

  function collectClosure(roots: readonly string[]): Set<number> {
    const picked = new Set<number>();

    const queue = [...roots];

    const visited = new Set<string>();

    for (const root of roots) {
      if (!index.has(root)) {
        throw new Error(`lib.dom.d.ts declares no "${root}"`);
      }
    }

    while (queue.length > 0) {
      const name = queue.pop();

      if (name === undefined || visited.has(name)) {
        continue;
      }

      visited.add(name);

      for (const position of index.get(name) ?? []) {
        picked.add(position);

        const statement = source.statements[position];

        if (statement !== undefined) {
          queue.push(...referencedNames(statement));
        }
      }
    }

    return picked;
  }

  return { collectClosure };
}
