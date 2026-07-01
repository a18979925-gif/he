import * as ts from "typescript";
import { forEachChildRecursive } from "./tsAstHelper.js";
import { SecurityIssue } from "../src/types.js";

// Map performance issues to a unified structure
export function sweepPerformance(sourceFile: ts.SourceFile, file: string): any[] {
  const issues: any[] = [];

  forEachChildRecursive(sourceFile, node => {
    // Nested Loops check
    if (
      ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isWhileStatement(node)
    ) {
      let depth = 0;
      let curr: ts.Node = node.parent;
      while (curr) {
        if (
          ts.isForStatement(curr) ||
          ts.isForInStatement(curr) ||
          ts.isForOfStatement(curr) ||
          ts.isWhileStatement(curr)
        ) {
          depth++;
        }
        curr = curr.parent;
      }

      if (depth >= 1) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        issues.push({
          issue: "Highly Nested Quadratic Iteration Complexity",
          file,
          line: line + 1,
          severity: "Medium",
          description: `Nested loop iterations detected (depth: ${depth + 1}), risking O(N^2) complexity.`,
          suggestedOptimization: "Use Map index lookup instead of nested search to improve scalability.",
          oldCode: node.getText(sourceFile).split("\n")[0],
          newCode: "// Use Map index lookup instead of nested search"
        });
      }
    }

    // N+1 Query inside loop
    if (ts.isCallExpression(node)) {
      const text = node.expression.getText(sourceFile);
      const isQueryCall = (text.includes("query") || 
                           text.includes("execute") || 
                           text.includes("db.") || 
                           text.includes("conn.") ||
                           text.includes("find") ||
                           text.includes("findOne") ||
                           text.includes("prisma.")) &&
                          !text.includes("querySelector") &&
                          !text.includes("document.");

      if (isQueryCall) {
        let insideLoop = false;
        let curr: ts.Node = node.parent;
        while (curr) {
          if (
            ts.isForStatement(curr) ||
            ts.isForInStatement(curr) ||
            ts.isForOfStatement(curr) ||
            ts.isWhileStatement(curr) ||
            (ts.isCallExpression(curr) && (
              curr.expression.getText(sourceFile).endsWith(".map") ||
              curr.expression.getText(sourceFile).endsWith(".forEach")
            ))
          ) {
            insideLoop = true;
            break;
          }
          curr = curr.parent;
        }

        if (insideLoop) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          issues.push({
            issue: "N+1 Database Query Pattern",
            file,
            line: line + 1,
            severity: "High",
            description: `N+1 query pattern detected: Database query '${text}' invoked inside an iteration loop.`,
            suggestedOptimization: "Refactor loading mechanics to perform database JOINs or load in batches.",
            oldCode: node.getText(sourceFile),
            newCode: "// Pre-load data in batches outside loop"
          });
        }
      }
    }
  });

  return issues;
}
