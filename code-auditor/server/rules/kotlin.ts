import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanKotlin(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  if (lineText.includes("setJavaScriptEnabled(true)")) {
    issues.push({
      id: `kt-sec-webview-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'WebView JavaScript Enabled',
      description: 'Enabling JavaScript execution inside Android WebViews exposes the application to XSS attacks.',
      snippet: lineText.trim(),
      suggestion: 'Only enable JavaScript if absolutely necessary and protect with strict Content Security Policies.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- webView.settings.javaScriptEnabled = true\n+ webView.settings.javaScriptEnabled = false`,
    });
  }

  return issues;
}
