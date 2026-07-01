import * as ts from "typescript";

export function analyzeTS(code: string, file: string) {
  const issues: any[] = [];
  
  try {
    const sourceFile = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true
    );

    const userControlledVars = new Set<string>();

    // Helper: traverse nodes recursively
    function traverse(node: ts.Node) {
      // 1. Detect user-controlled variables (sources of SQLi / security risks)
      if (ts.isVariableDeclaration(node) && node.initializer) {
        const initText = node.initializer.getText(sourceFile);
        if (
          initText.includes("req.query") ||
          initText.includes("req.body") ||
          initText.includes("req.params") ||
          initText.includes("req.headers") ||
          initText.includes("input")
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

      // 2. Hardcoded secret heuristic rule
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
                type: "hardcoded_secret",
                severity: "critical",
                file,
                line: line + 1,
                description: `Hardcoded API key, token, or secret value detected in variable '${varName}'.`,
                solution: `Load the credential dynamically from process.env.${varName.toUpperCase()} instead.`
              });
            }
          }
        }
      }

      // 3. SQL Injection check
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
                  type: "sql_injection_risk",
                  severity: "critical",
                  file,
                  line: line + 1,
                  description: `SQL Injection Susceptibility: user input '${vulnerable.join(", ")}' is dynamically concatenated in database query.`,
                  solution: "Use parameterized queries (e.g. db.query('SELECT * FROM users WHERE id = ?', [id])) or SQL allowlists instead of string interpolation."
                });
              }
            }
          });
        }
      }

      // 4. NPE (Null Pointer Exception) Risk
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
              type: "npe_risk",
              severity: "high",
              file,
              line: line + 1,
              description: `Null Pointer Exception Risk: unsafe nested property access '${text}' without optional chaining.`,
              solution: `Change property chain access to safe optional chaining (e.g., '${text.replace(/\./g, "?.")}') or add guard checks.`
            });
          }
        }
      }

      // 5. Code Smells: Empty catch, excess parameters
      if (ts.isCatchClause(node)) {
        const bodyText = node.block.getText(sourceFile).trim();
        if (bodyText === "{\n}" || bodyText === "{}") {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          issues.push({
            type: "empty_catch_block",
            severity: "low",
            file,
            line: line + 1,
            description: "Empty catch block silently ignores errors, hindering system visibility.",
            solution: "Log the exception error or rethrow it to prevent obscuring issues."
          });
        }
      }

      if (ts.isFunctionDeclaration(node) && node.parameters.length > 4) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        issues.push({
          type: "excess_parameters",
          severity: "medium",
          file,
          line: line + 1,
          description: `Function '${node.name?.getText(sourceFile) || "anonymous"}' has too many parameters (${node.parameters.length}).`,
          solution: "Consolidate parameters list into a single structured options object."
        });
      }

      ts.forEachChild(node, traverse);
    }

    traverse(sourceFile);

    // Compute Cognitive Complexity
    let cognitiveComplexity = 0;
    function calculateComplexity(n: ts.Node, depth: number) {
      let currentDepth = depth;
      let inc = 0;
      if (
        ts.isIfStatement(n) ||
        ts.isForStatement(n) ||
        ts.isForInStatement(n) ||
        ts.isForOfStatement(n) ||
        ts.isWhileStatement(n) ||
        ts.isCatchClause(n) ||
        ts.isConditionalExpression(n)
      ) {
        inc = 1 + depth;
        currentDepth++;
      } else if (ts.isSwitchStatement(n)) {
        inc = 1;
        currentDepth++;
      }
      cognitiveComplexity += inc;
      ts.forEachChild(n, child => calculateComplexity(child, currentDepth));
    }
    calculateComplexity(sourceFile, 0);

    if (cognitiveComplexity > 8) {
      issues.push({
        type: "high_cognitive_complexity",
        severity: "medium",
        file,
        line: 1,
        description: `High cognitive complexity score (${cognitiveComplexity}) detected in file.`,
        solution: "Refactor logic blocks into smaller standalone subcomponents."
      });
    }

  } catch (err) {
    // Parsing error fallback
  }

  return { file, issues };
}
