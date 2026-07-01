import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanRuby(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  if (/\beval\s*\(/.test(lineText) || lineText.includes("instance_eval") || lineText.includes("class_eval")) {
    issues.push({
      id: `rb-sec-eval-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Ruby Dynamic Code Execution',
      description: 'Using eval variants on untrusted user parameters can allow arbitrary Ruby command execution.',
      snippet: lineText.trim(),
      suggestion: 'Avoid dynamic string execution. Use safe object indexing or mapping functions.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- eval(params[:code])\n+ # Use static/safe methods`,
    });
  }

  return issues;
}
