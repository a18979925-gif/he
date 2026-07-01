import * as ts from "typescript";
import { forEachChildRecursive } from "./tsAstHelper.js";

export function calculateCognitiveComplexity(sourceFile: ts.SourceFile): number {
  let complexity = 0;

  function walk(node: ts.Node, depth: number) {
    let currentDepth = depth;
    let increment = 0;

    if (
      ts.isIfStatement(node) ||
      ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isCatchClause(node) ||
      ts.isConditionalExpression(node)
    ) {
      increment = 1 + depth;
      currentDepth++;
    } else if (ts.isSwitchStatement(node)) {
      increment = 1;
      currentDepth++;
    }

    complexity += increment;
    ts.forEachChild(node, child => walk(child, currentDepth));
  }

  walk(sourceFile, 0);
  return complexity;
}
