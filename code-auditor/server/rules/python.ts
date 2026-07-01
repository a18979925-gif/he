import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanPython(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. SQL Injection (e.g., execute("... %s" % var) or execute(f"... {var}"))
  if (/\bexecute\s*\(\s*(?:f['"].*\{.*\}|['"].*%s.*['"]\s*%\s*\w+|\w+\s*\+\s*\w+)/i.test(lineText) && (lineText.includes('SELECT') || lineText.includes('INSERT') || lineText.includes('UPDATE') || lineText.includes('DELETE'))) {
    issues.push({
      id: `py-sec-sqli-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SQL Injection: String formatting in query execution',
      description: 'Using raw Python string formatting or f-strings to interpolate untrusted variables directly into database execute statements leads to SQL injection vulnerabilities.',
      snippet: lineText.trim(),
      suggestion: 'Utilize parameterized query interfaces provided by db-api drivers, passing variables as a tuple parameter.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")\n+ cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`,
    });
  }

  // 2. Command Injection via subprocess/os.system with shell=True
  if ((/subprocess\.(?:Popen|run|call|check_output)\s*\(/.test(lineText) && /shell\s*=\s*True/.test(lineText)) || /\bos\.system\s*\(/.test(lineText)) {
    issues.push({
      id: `py-sec-cmdi-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Command Injection: OS shell command invocation',
      description: 'Invoking dynamic shell commands via shell=True or os.system executes inputs directly inside a system shell process, permitting arbitrary remote execution.',
      snippet: lineText.trim(),
      suggestion: 'Avoid executing commands in a shell context. Pass command arguments as a list with shell=False (default behavior in subprocess).',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- subprocess.run(f"ping {ip_address}", shell=True)\n+ subprocess.run(["ping", "-c", "1", ip_address], shell=False)`,
    });
  }

  // 3. Unsafe YAML Deserialization (yaml.load instead of safe_load)
  if (/\byaml\.load\s*\([^,)]*\)/.test(lineText) && !lineText.includes('SafeLoader') && !lineText.includes('safe_load')) {
    issues.push({
      id: `py-sec-yaml-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Insecure Deserialization: yaml.load detected',
      description: 'Using standard yaml.load enables parsing of custom objects that can execute arbitrary Python methods during loader construction.',
      snippet: lineText.trim(),
      suggestion: 'Migrate parser calls strictly to yaml.safe_load, which forbids execution of arbitrary class constructor hooks.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- config = yaml.load(user_yaml)\n+ config = yaml.safe_load(user_yaml)`,
    });
  }

  // 4. Input injection in eval / exec
  if (/\b(?:eval|exec)\s*\(/.test(lineText) && /(?:input|request|param|data|text)/.test(lineText)) {
    issues.push({
      id: `py-sec-eval-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Unsafe Dynamic Execution: eval/exec on user input',
      description: 'Evaluating dynamic code from user inputs executes raw scripts within the process thread, exposing full runtime compromise.',
      snippet: lineText.trim(),
      suggestion: 'Utilize ast.literal_eval for parsing primitive structural strings safely, or use formal structured formats like JSON.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- result = eval(user_expression)\n+ import ast\n+ result = ast.literal_eval(user_expression)`,
    });
  }

  // 5. Hardcoded debugging mode in web apps (e.g. Flask/Django debug=True)
  if (/\bdebug\s*=\s*True\b/i.test(lineText)) {
    issues.push({
      id: `py-qual-debug-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'Production Configuration Hazard: Debug Mode Active',
      description: 'Leaving server debug mode active in production displays sensitive system tracebacks and interactive debug consoles to visitors.',
      snippet: lineText.trim(),
      suggestion: 'Bind debug switches dynamically to runtime environment configurations.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- app.run(debug=True)\n+ app.run(debug=os.environ.get("FLASK_DEBUG", "False").lower() == "true")`,
    });
  }

  // 6. Insecure Deserialization via pickle
  if (/\bpickle\.(?:loads|load)\s*\(/.test(lineText)) {
    issues.push({
      id: `py-sec-pickle-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Insecure Deserialization: pickle usage',
      description: 'Loading arbitrary pickle byte arrays executes class constructors instantly on processing, exposing the application to total remote execution control.',
      snippet: lineText.trim(),
      suggestion: 'Utilize secure serialization structures like json, msgpack, or protobuf to manage persistent objects.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- data = pickle.loads(user_input)\n+ import json\n+ data = json.loads(user_input)`,
    });
  }

  // 7. Mutable default argument values
  if (/\bdef\s+\w+\s*\(.*=\s*(?:\[\]|\{\})\s*/.test(lineText)) {
    issues.push({
      id: `py-qual-mutable-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'Python Anti-pattern: Mutable Default Argument',
      description: 'Defining lists [] or dicts {} as default arguments binds them permanently to the method prototype, causing mutated inputs to persist across multiple function invocations.',
      snippet: lineText.trim(),
      suggestion: 'Bind defaults to None and instantiate fresh lists or dictionaries safely inside the function body.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- def append_to(value, target=[]):\n+ def append_to(value, target=None):\n+     if target is None:\n+         target = []`,
    });
  }

  // 8. Loose SSL certificate verification
  if (/\bverify\s*=\s*False\b/i.test(lineText) && (lineText.includes('requests.get') || lineText.includes('requests.post') || lineText.includes('requests.request'))) {
    issues.push({
      id: `py-sec-ssl-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Transport Layer Security: verify=False disabled',
      description: 'Disabling HTTPS certificate verification leaves outbound request threads completely open to interception or DNS spoofing via Man-In-The-Middle (MITM) hijacking.',
      snippet: lineText.trim(),
      suggestion: 'Enable SSL checks using trusted system trust stores.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- response = requests.get(url, verify=False)\n+ response = requests.get(url, verify=True)`,
    });
  }

  return issues;
}
