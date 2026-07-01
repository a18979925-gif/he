import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanTypeScript(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. dangerouslySetInnerHTML
  if (lineText.includes('dangerouslySetInnerHTML')) {
    issues.push({
      id: `ts-sec-xss-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Potential XSS: dangerouslySetInnerHTML detected',
      description: 'Rendering un-sanitized dynamic HTML bypasses React\'s default protection against Cross-Site Scripting (XSS).',
      snippet: lineText.trim(),
      suggestion: 'Sanitize content using a trusted library (e.g. DOMPurify) before inserting, or use standard safe text content.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- <div dangerouslySetInnerHTML={{ __html: userContent }} />\n+ <div className="purified-content">{DOMPurify.sanitize(userContent)}</div>`,
    });
  }

  // 2. eval / Function constructor
  if (/\beval\s*\(/.test(lineText) || /new\s+Function\s*\(/.test(lineText)) {
    issues.push({
      id: `ts-sec-eval-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Remote Code Execution (RCE): eval() usage',
      description: 'Executing strings as code runs with full system permissions in Node, or context scope in browsers. This allows trivial code injection.',
      snippet: lineText.trim(),
      suggestion: 'Parse structured JSON data using JSON.parse, or use dynamic safe object lookup indices.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- eval(userInputString);\n+ const targetAction = routeHandlers[userInputString];`,
    });
  }

  // 3. Weak password/cryptography hashing
  if (/\b(?:md5|sha1)\s*\(/.test(lineText) || /createHash\s*\(\s*['"](?:md5|sha1)['"]/.test(lineText)) {
    issues.push({
      id: `ts-sec-crypto-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Cryptographically Weak Hash Function',
      description: 'MD5 and SHA-1 have known collision vulnerabilities and must not be used for encryption, secure tokens, or sensitive user passwords.',
      snippet: lineText.trim(),
      suggestion: 'Utilize SHA-256/SHA-512, bcrypt, or native crypto.scrypt for credential hashing and password derivations.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- const hashed = crypto.createHash('md5').update(password).digest('hex');\n+ const hashed = await bcrypt.hash(password, 10);`,
    });
  }

  // 4. Stale/Infinite useEffect dependency loops
  if (/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{/i.test(lineText) && lineText.includes('[]')) {
    issues.push({
      id: `ts-qual-effect-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'Stale Closure: Empty useEffect Dependency Array',
      description: 'Using [] for effects referencing external values traps state variables inside stale closures, preventing UI updates.',
      snippet: lineText.trim(),
      suggestion: 'Explicitly specify all dependency variables referenced inside the body of the useEffect hook.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- useEffect(() => { console.log(userId); }, []);\n+ useEffect(() => { console.log(userId); }, [userId]);`,
    });
  }

  // 5. Direct DOM manipulation in React
  if (/(?:document\.getElementById|document\.querySelector|document\.body)\b/.test(lineText) && !filePath.includes('main.tsx')) {
    issues.push({
      id: `ts-qual-dom-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'info',
      title: 'React Quality: Direct DOM Mutation',
      description: 'Manipulating elements directly on the document object breaks React\'s virtual-DOM synchronization, resulting in stale UI hierarchies.',
      snippet: lineText.trim(),
      suggestion: 'Use standard React useRef hooks to reference nodes or state triggers instead of raw DOM query selectors.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- document.getElementById("my-input").focus();\n+ inputRef.current?.focus();`,
    });
  }

  // 6. SQL Injection in raw backticks
  if (/\b(?:query|execute)\s*\(\s*`.*?\$\{.*?\}.*?`\s*\)/i.test(lineText) && (lineText.includes('SELECT') || lineText.includes('INSERT') || lineText.includes('UPDATE') || lineText.includes('DELETE'))) {
    issues.push({
      id: `ts-sec-sqli-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SQL Injection: Dynamic raw SQL interpolation',
      description: 'Interpolating variables directly inside raw query backticks can allow unauthenticated users to modify core database queries.',
      snippet: lineText.trim(),
      suggestion: 'Use parameterized queries (?) or bound arrays inside database adapter driver requests.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- db.query(\`SELECT * FROM users WHERE id = \${userId}\`);\n+ db.query('SELECT * FROM users WHERE id = ?', [userId]);`,
    });
  }

  // 7. Wildcard CORS exposure
  if (/Access-Control-Allow-Origin.*\*|origin.*\*|allowOrigin.*\*/i.test(lineText) && lineText.includes('*')) {
    issues.push({
      id: `ts-sec-cors-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'CORS Configuration: Wildcard Origin Allowed',
      description: 'Setting CORS origins to the "*" wildcard lets any external web domain read request payloads and intercept credentials.',
      snippet: lineText.trim(),
      suggestion: 'Set the Access-Control-Allow-Origin header strictly to trusted development or production API domain coordinates.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- origin: '*'\n+ origin: process.env.ALLOWED_CLIENT_URL`,
    });
  }

  // 8. Leak of process trace details in express error responses
  if (/\bres\.status\(500\)\.json\(\s*\{\s*(?:err|error|message)\s*:\s*(?:err|e)(?:\.stack)?\s*\}\s*\)/.test(lineText)) {
    issues.push({
      id: `ts-sec-leak-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Information Exposure: Stacktrace Leaked in API Response',
      description: 'Transmitting raw JavaScript error stacktraces or database messages in HTTP response payloads assists attackers in cataloging system weaknesses.',
      snippet: lineText.trim(),
      suggestion: 'Log errors internally on server consoles or tracking systems, and return a clean generic error string to external visitors.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- res.status(500).json({ error: err.stack });\n+ console.error(err);\n+ res.status(500).json({ error: "An internal server error occurred." });`,
    });
  }

  // 9. React: Direct State Mutation
  if (/\b(?:state|items|records)\.(?:push|splice|shift|unshift)\b/.test(lineText)) {
    if (!lineText.includes('setState') && !lineText.includes('setItems') && !lineText.includes('draft')) {
      issues.push({
        id: `ts-qual-mutate-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'quality',
        severity: 'warning',
        title: 'React Quality: State Array Direct Mutation',
        description: 'Mutating React local state arrays in-place using push/splice fails to produce clean shallow comparisons, blocking proper reactive renders.',
        snippet: lineText.trim(),
        suggestion: 'Create shallow clones using array spread operators or apply functional state setters instead.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- state.push(newItem);\n+ setState(prev => [...prev, newItem]);`,
      });
    }
  }

  return issues;
}
