import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanRust(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. Unsafe blocks
  if (/\bunsafe\s*\{/.test(lineText)) {
    issues.push({
      id: `rust-sec-unsafe-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Rust: Unsafe Block Usage Detected',
      description: 'The use of unsafe blocks disables compiler safety guarantees (raw pointers dereferencing, mutable static access), risking memory corruption.',
      snippet: lineText.trim(),
      suggestion: 'Re-architect functionality using safe wrappers, RC pointers, or Cell abstractions unless strictly necessary for custom FFIs.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- unsafe { *ptr = 10; }\n+ my_safe_cell.set(10);`,
    });
  }

  // 2. Dangerous raw unwraps
  if (/\.(?:unwrap|expect)\s*\(/.test(lineText) && !lineText.includes('test')) {
    issues.push({
      id: `rust-qual-unwrap-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'Potential Panic: Explicit Option/Result unwrap()',
      description: 'Using unwrap() or expect() forces thread panics and crashes process threads if the value is None or Err at runtime.',
      snippet: lineText.trim(),
      suggestion: 'Handle possible error results gracefully using matches, let-else statements, or match structures to guarantee resilience.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- let file = File::open(p).unwrap();\n+ let file = File::open(p).map_err(|e| CustomError::Io(e))?;`,
    });
  }

  // 3. Unfinished macro structures
  if (/\b(?:panic|todo|unimplemented)!\s*\(/.test(lineText)) {
    issues.push({
      id: `rust-qual-todo-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'info',
      title: 'Development Macro Found (todo! / panic!)',
      description: 'Leaving placeholders or abrupt assertion failures in code can abruptly interrupt execution blocks in production servers.',
      snippet: lineText.trim(),
      suggestion: 'Implement appropriate, professional error fallback flows and remove all panic paths from live routes.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- todo!()\n+ return Err(MyError::Unimplemented);`,
    });
  }

  // 4. Raw indexing of vectors or arrays (leads to out-of-bounds panic)
  if (/\b\w+\[\w+\]/.test(lineText) && !lineText.includes('static') && !lineText.includes('const') && !lineText.includes('test') && !/^[ \t]*\/\//.test(lineText)) {
    issues.push({
      id: `rust-qual-indexing-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'info',
      title: 'Potential Panic: Direct vector or array index slicing',
      description: 'Accessing indexes directly using square brackets (e.g. data[index]) will crash the running thread with a panic if the requested index exceeds the slice boundary.',
      snippet: lineText.trim(),
      suggestion: 'Utilize the .get() method which returns a safe Option object to handle missing entries gracefully.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- let item = list[index];\n+ let item = list.get(index).ok_or(MyError::OutOfBounds)?;`,
    });
  }

  // 5. Silent ignored Results
  if (/\blet\s+_\s*=\s*\w+/.test(lineText) && !lineText.includes('unwrap') && !lineText.includes('expect')) {
    if (/(?:open|write|send|recv|exec|query|execute|remove|delete)/i.test(lineText)) {
      issues.push({
        id: `rust-qual-silent-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'quality',
        severity: 'warning',
        title: 'Unchecked Return: Silent ignored Result',
        description: 'Ignoring the returning Result object of security-sensitive or IO-heavy operations (e.g., let _ = write_file()) ignores potential network or permissions anomalies silently.',
        snippet: lineText.trim(),
        suggestion: 'Perform proper error diagnostics using match structures or standard bubble-up operators (?) to ensure system failures are reported.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- let _ = file.write_all(data);\n+ file.write_all(data)?;`,
      });
    }
  }

  return issues;
}
