import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanGo(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. SQL Injection raw string concatenation or Sprintf formatting
  if (/(?:SELECT|INSERT|UPDATE|DELETE|FROM).*\+.*\b(?:req|query|input|param|id|name)\b/i.test(lineText) || /fmt\.Sprintf\(.*SELECT.*%s/i.test(lineText)) {
    issues.push({
      id: `go-sec-sqli-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SQL Injection: Dynamic string building',
      description: 'Assembling SQL query statements dynamically using string concatenation or format strings exposes the database to serious SQL injections.',
      snippet: lineText.trim(),
      suggestion: 'Use query parameter placeholders supported by Go database drivers (e.g. $1 or ?) and pass parameters safely.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- db.Query(fmt.Sprintf("SELECT * FROM users WHERE name = '%s'", name))\n+ db.Query("SELECT * FROM users WHERE name = ?", name)`,
    });
  }

  // 2. OS Command Injection
  if (/exec\.Command\s*\(\s*(?:req|input|param|args|filename|path)\b/i.test(lineText) || /exec\.Command\s*\(\s*["']sh["']\s*,\s*["']-c["']/i.test(lineText)) {
    issues.push({
      id: `go-sec-cmdi-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Command Execution Injection Hazard',
      description: 'Invoking operating system shell interpreters or commands using untrusted inputs allows remote arbitrary shell commands execution.',
      snippet: lineText.trim(),
      suggestion: 'Execute fixed binaries without the shell interpreter, or restrict executable parameter bounds strictly using structured allowlists.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- cmd := exec.Command("bash", "-c", userInput)\n+ cmd := exec.Command("./process-bin", "--target", safeId)`,
    });
  }

  // 3. Unbounded HTTP clients
  if (/&http\.Client\{\}/.test(lineText) || /http\.DefaultClient/.test(lineText)) {
    issues.push({
      id: `go-qual-client-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'HTTP Client Missing Connect Timeouts',
      description: 'Default HTTP clients in Go have an infinite timeout. Under slow networks or persistent stalls, this consumes all worker pool descriptors.',
      snippet: lineText.trim(),
      suggestion: 'Construct standard HTTP Clients explicitly defining healthy Timeout thresholds (e.g., 10 seconds).',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- resp, err := http.Get(targetUrl)\n+ client := &http.Client{Timeout: 15 * time.Second}\n+ resp, err := client.Get(targetUrl)`,
    });
  }

  // 4. Goroutine Loop capture
  if (/go\s+func\s*\(\s*\)\s*\{/i.test(lineText) && (lineText.includes('v') || lineText.includes('k') || lineText.includes('val') || lineText.includes('item'))) {
    issues.push({
      id: `go-qual-goroutine-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'critical',
      title: 'Goroutine Loop Variable Concurrency Race',
      description: 'Initiating goroutines inside loop boundaries which capture the loop index or element variable natively can cause race anomalies where routines execute only the last value.',
      snippet: lineText.trim(),
      suggestion: 'Pass loop iteration variables directly into goroutine parameter signatures, or explicitly shadow variables inside scope boundaries.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- go func() { handle(item) }()\n+ go func(i string) { handle(i) }(item)`,
    });
  }

  // 5. Weak pseudorandom generation in security-critical code
  if (/\bmath\/rand\b/.test(lineText) || /rand\.(?:Int|Float|Read)\s*\(/.test(lineText)) {
    issues.push({
      id: `go-sec-rand-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Insecure Randomness: Use of math/rand',
      description: 'The math/rand package generates mathematically predictable pseudo-random sequences. It must never be used for security-sensitive tokens, cookies, session keys, or cryptography keys.',
      snippet: lineText.trim(),
      suggestion: 'Use crypto/rand instead for cryptographically strong random operations.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- import "math/rand"\n+ import "crypto/rand"`,
    });
  }

  // 6. Direct panic invocation
  if (/\bpanic\s*\([^)]*\)/.test(lineText) && !lineText.includes('recover') && !filePath.includes('_test.go')) {
    issues.push({
      id: `go-qual-panic-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'Go Quality: Dynamic panic() usage',
      description: 'Triggering standard panic crashes the current Go worker runtime execution thread, preventing normal server-side error recovery.',
      snippet: lineText.trim(),
      suggestion: 'Return explicit descriptive error objects (error interfaces) from the method call hierarchy instead of aborting processes.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- panic("illegal transaction step")\n+ return fmt.Errorf("illegal transaction step")`,
    });
  }

  // 7. Deferring lock releases inside loops
  if (/\bdefer\s+\w+\.Unlock\s*\(\s*\)/.test(lineText) && (lineText.includes('for ') || lineText.includes('range '))) {
    issues.push({
      id: `go-qual-deferloop-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'critical',
      title: 'Concurrency Leak: Mutex unlock deferred in loop body',
      description: 'Executing defer statements inside loops delays resource releases until the surrounding parent function scope terminates, causing severe thread-blocking deadlocks.',
      snippet: lineText.trim(),
      suggestion: 'Avoid deferring locks inside loop blocks. Release mutexes manually using m.Unlock() before iterating or extract block targets to a single-purpose submethod.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- mu.Lock()\n- defer mu.Unlock()\n+ func process() {\n+     mu.Lock()\n+     defer mu.Unlock()\n+ }`,
    });
  }

  return issues;
}
