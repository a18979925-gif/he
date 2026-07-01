import * as ts from "typescript";
import { forEachChildRecursive } from "./tsAstHelper.js";
import { SecurityIssue } from "../src/types.js";

export function sweepSecurity(sourceFile: ts.SourceFile, file: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const userControlledVars = new Set<string>();

  // Gather user-controlled inputs
  forEachChildRecursive(sourceFile, node => {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const initText = node.initializer.getText(sourceFile);
      if (
        initText.includes("req.query") ||
        initText.includes("req.body") ||
        initText.includes("req.params") ||
        initText.includes("req.headers")
      ) {
        if (ts.isIdentifier(node.name)) {
          userControlledVars.add(node.name.text);
        } else if (ts.isObjectBindingPattern(node.name)) {
          node.name.elements.forEach(el => {
            if (ts.isIdentifier(el.name)) {
              userControlledVars.add(el.name.text);
            }
          });
        }
      }
    }
  });

  // Run security checks
  forEachChildRecursive(sourceFile, node => {
    // 1. Hardcoded Secrets
    if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) {
        const val = node.initializer.text;
        const varName = node.name.getText(sourceFile);
        const varNameLower = varName.toLowerCase();
        const isSecret = varNameLower.includes("key") || varNameLower.includes("secret") || varNameLower.includes("token") || varNameLower.includes("password");
        
        if (isSecret && val.length > 5) {
          const isPlaceholder = val.includes("YOUR_") || val.includes("PLACEHOLDER") || val.toLowerCase().includes("mock");
          if (!isPlaceholder && !val.startsWith("process.env")) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            issues.push({
              category: "Hardcoded Cryptographic Token",
              file,
              line: line + 1,
              severity: "Critical",
              description: `Hardcoded key, secret, or token literal detected in variable '${varName}'.`,
              solution: `Load the credential dynamically from process.env.${varName.toUpperCase()} instead.`,
              oldCode: node.getText(sourceFile),
              newCode: `const ${varName} = process.env.${varName.toUpperCase()}!;`
            });
          }
        }
      }
    }

    // 2. SQL Injection
    if (ts.isCallExpression(node)) {
      const callText = node.expression.getText(sourceFile);
      const isQueryCall = callText.includes("query") || 
                          callText.includes("execute") || 
                          callText.includes("db.") || 
                          callText.includes("conn.") ||
                          callText.includes("prisma.$queryRaw") ||
                          callText.includes("db.raw");

      if (isQueryCall) {
        node.arguments.forEach(arg => {
          let hasInterpolation = false;
          const vars = new Set<string>();

          if (ts.isTemplateExpression(arg)) {
            hasInterpolation = true;
            arg.templateSpans.forEach(span => {
              const exprText = span.expression.getText(sourceFile);
              vars.add(exprText);
            });
          } else if (ts.isBinaryExpression(arg) && arg.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            hasInterpolation = true;
            const collect = (binNode: ts.Node) => {
              if (ts.isIdentifier(binNode)) {
                vars.add(binNode.text);
              } else if (ts.isPropertyAccessExpression(binNode)) {
                vars.add(binNode.getText(sourceFile));
              } else if (ts.isBinaryExpression(binNode)) {
                collect(binNode.left);
                collect(binNode.right);
              }
            };
            collect(arg);
          }

          if (hasInterpolation) {
            const vulnerable = Array.from(vars).filter(v => {
              const vl = v.toLowerCase();
              return userControlledVars.has(v) || 
                     v.startsWith("req.") || 
                     vl.includes("query") || 
                     vl.includes("body") || 
                     vl.includes("param") ||
                     vl.includes("input");
            });

            if (vulnerable.length > 0) {
              const { line } = sourceFile.getLineAndCharacterOfPosition(arg.getStart(sourceFile));
              issues.push({
                category: "SQL Injection Susceptibility",
                file,
                line: line + 1,
                severity: "Critical",
                description: `SQL Injection Susceptibility: user input '${vulnerable.join(", ")}' is dynamically concatenated in database query.`,
                solution: "Use parameterized queries (e.g. db.query('SELECT * FROM users WHERE id = ?', [id])) or SQL allowlists instead of string interpolation.",
                oldCode: arg.getText(sourceFile),
                newCode: `/* Use prepared statements with parameters placeholder instead */`
              });
            }
          }
        });
      }
    }
  });

  return issues;
}
