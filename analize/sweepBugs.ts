import * as ts from "typescript";
import { forEachChildRecursive } from "./tsAstHelper.js";

export function sweepBugs(sourceFile: ts.SourceFile, file: string): any[] {
  const issues: any[] = [];

  forEachChildRecursive(sourceFile, node => {
    // 1. Unsafe comparisons (Self comparisons like x === x or property errors)
    if (ts.isBinaryExpression(node)) {
      const leftText = node.left.getText(sourceFile);
      const rightText = node.right.getText(sourceFile);
      const op = node.operatorToken.kind;

      if (
        (op === ts.SyntaxKind.EqualsEqualsToken ||
         op === ts.SyntaxKind.EqualsEqualsEqualsToken ||
         op === ts.SyntaxKind.ExclamationEqualsToken ||
         op === ts.SyntaxKind.ExclamationEqualsEqualsToken) &&
        leftText === rightText &&
        !leftText.includes("typeof") && 
        !leftText.includes("NaN")
      ) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        issues.push({
          category: "Logic Bugs / Self-Comparison",
          file,
          line: line + 1,
          severity: "High",
          description: `Self-comparison detected: variable '${leftText}' compared against itself.`,
          solution: "Check variables list to compare against expected threshold or correct property reference.",
          oldCode: node.getText(sourceFile),
          newCode: `/* verify comparison variables */`
        });
      }
    }

    // 2. Empty catch blocks
    if (ts.isCatchClause(node)) {
      const bodyText = node.block.getText(sourceFile).trim();
      if (bodyText === "{\n}" || bodyText === "{}") {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        issues.push({
          category: "Logic Bugs / Generic exception catching",
          file,
          line: line + 1,
          severity: "Low",
          description: "Empty catch block silently swallows exceptions, blocking diagnostics.",
          solution: "Log or rethrow the exception handler explicitly.",
          oldCode: node.parent.getText(sourceFile),
          newCode: `catch (error) {\n  console.error(error);\n}`
        });
      }
    }

    // 3. Unsafe nested property access (NPE Risk)
    if (ts.isPropertyAccessExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression)) {
        let curr: ts.Node = node;
        let hasOptional = false;
        let rootName = "";
        let depth = 0;
        
        while (ts.isPropertyAccessExpression(curr) || ts.isPropertyAccessChain(curr)) {
          depth++;
          if (ts.isPropertyAccessChain(curr) || (curr as any).questionDotToken) {
            hasOptional = true;
            break;
          }
          if (ts.isIdentifier(curr.expression)) {
            rootName = curr.expression.text;
          }
          curr = curr.expression;
        }

        const text = node.getText(sourceFile);
        const skippedRoots = ["process", "console", "Math", "req", "res", "next", "fs", "path", "ts", "Object", "Array", "JSON", "this"];
        
        if (!hasOptional && depth >= 2 && !skippedRoots.includes(rootName) && !text.includes("module.exports")) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          issues.push({
            category: "Logic Bugs / Null Pointer Exception Risk",
            file,
            line: line + 1,
            severity: "High",
            description: `Null Pointer Exception Risk: unsafe nested property access '${text}' without optional chaining.`,
            solution: `Change property chain access to safe optional chaining (e.g., '${text.replace(/\./g, "?.")}') or add guard checks.`,
            oldCode: node.getText(sourceFile),
            newCode: text.replace(/\./g, "?.")
          });
        }
      }
    }
  });

  return issues;
}
