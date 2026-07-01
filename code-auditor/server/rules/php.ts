import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanPhp(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. eval / assert RCE
  if (/\b(eval|assert)\s*\(/.test(lineText)) {
    issues.push({
      id: `php-sec-eval-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Potential RCE: Dynamic Code Execution',
      description: 'Using eval() or assert() with dynamic variables can allow arbitrary PHP code execution.',
      snippet: lineText.trim(),
      suggestion: 'Avoid dynamic code execution. Use safe callbacks or configuration arrays instead.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- eval($userInput);\n+ // Use safe structured parsing`,
    });
  }

  // 2. Direct SQL Interpolation
  if (/\$(?:GET|POST|REQUEST|COOKIE)\[.*\]/i.test(lineText) && (lineText.includes('SELECT') || lineText.includes('INSERT') || lineText.includes('UPDATE') || lineText.includes('DELETE'))) {
    issues.push({
      id: `php-sec-sqli-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SQL Injection: Direct Input Interpolation',
      description: 'Using raw request inputs directly inside query strings leads to SQL Injection vulnerabilities.',
      snippet: lineText.trim(),
      suggestion: 'Utilize PDO prepared statements with parameter binding.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- $db->query("SELECT * FROM users WHERE name = " . $_GET['name']);\n+ $stmt = $pdo->prepare("SELECT * FROM users WHERE name = :name");\n+ $stmt->execute(['name' => $_GET['name']]);`,
    });
  }

  return issues;
}
