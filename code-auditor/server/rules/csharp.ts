import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanCSharp(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  if (lineText.includes("SqlCommand") && lineText.includes("+")) {
    issues.push({
      id: `cs-sec-sqli-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SQL Injection in C# SqlCommand',
      description: 'Concatenating raw input into a SQL Command string creates SQL Injection vulnerabilities.',
      snippet: lineText.trim(),
      suggestion: 'Use parameterized queries using command.Parameters.AddWithValue().',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- var cmd = new SqlCommand("SELECT * FROM Users WHERE Name = '" + input + "'");\n+ var cmd = new SqlCommand("SELECT * FROM Users WHERE Name = @Name");\n+ cmd.Parameters.AddWithValue("@Name", input);`,
    });
  }

  return issues;
}
