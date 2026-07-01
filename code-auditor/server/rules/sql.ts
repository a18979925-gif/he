import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanSql(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. GRANT ALL PRIVILEGES — Overly Permissive Grants
  if (/\bGRANT\s+ALL\s+PRIVILEGES\b/i.test(lineText)) {
    issues.push({
      id: `sql-sec-grant-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Overly Permissive Grant: GRANT ALL PRIVILEGES',
      description: 'Granting ALL PRIVILEGES gives the target user or role unrestricted access including the ability to alter schemas, drop tables, and manage other users. This violates the principle of least privilege and significantly widens the blast radius of a compromised account.',
      snippet: lineText.trim(),
      suggestion: 'Replace ALL PRIVILEGES with the minimal set of permissions the role actually requires (e.g., SELECT, INSERT, UPDATE on specific tables).',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- GRANT ALL PRIVILEGES ON mydb.* TO 'app_user'@'%';\n+ GRANT SELECT, INSERT, UPDATE ON mydb.orders TO 'app_user'@'%';`,
    });
  }

  // 2. SELECT * — Performance: Fetches unnecessary columns
  if (/\bSELECT\s+\*/i.test(lineText) && !/^\s*--/.test(lineText)) {
    issues.push({
      id: `sql-perf-selectall-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'performance',
      severity: 'warning',
      title: 'Unqualified SELECT *: Fetches All Columns',
      description: 'Using SELECT * retrieves every column from the target table, increasing network payload, memory consumption, and I/O overhead. It also makes queries fragile — schema changes (added or reordered columns) silently alter result sets and can break downstream consumers.',
      snippet: lineText.trim(),
      suggestion: 'Explicitly enumerate only the columns your application actually needs in the SELECT list.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- SELECT * FROM users WHERE active = 1;\n+ SELECT id, username, email FROM users WHERE active = 1;`,
    });
  }

  // 3. DROP TABLE / DROP DATABASE without IF EXISTS — Destructive Operations
  if (/\bDROP\s+(?:TABLE|DATABASE)\b/i.test(lineText) && !/\bIF\s+EXISTS\b/i.test(lineText) && !/^\s*--/.test(lineText)) {
    issues.push({
      id: `sql-qual-drop-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'critical',
      title: 'Destructive Operation Without Safety Guard: DROP without IF EXISTS',
      description: 'Executing DROP TABLE or DROP DATABASE without the IF EXISTS guard will raise a fatal error if the target object does not exist, potentially aborting migration scripts or deployment pipelines mid-execution and leaving the database in a partially-migrated state.',
      snippet: lineText.trim(),
      suggestion: 'Add the IF EXISTS clause to make the statement idempotent and safe for repeated execution.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- DROP TABLE legacy_sessions;\n+ DROP TABLE IF EXISTS legacy_sessions;`,
    });
  }

  // 4. PASSWORD() / MD5() for password hashing — Weak Cryptography
  if (/\b(?:PASSWORD|MD5)\s*\(/i.test(lineText) && !/^\s*--/.test(lineText)) {
    issues.push({
      id: `sql-sec-weakhash-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Weak Cryptographic Hash: PASSWORD() or MD5() Used for Credentials',
      description: 'The PASSWORD() and MD5() functions produce fast, unsalted hashes that are trivially brute-forced with modern GPUs and rainbow tables. Neither function is suitable for protecting user credentials or any sensitive data at rest.',
      snippet: lineText.trim(),
      suggestion: 'Hash passwords in the application layer using a dedicated key-derivation function such as bcrypt, scrypt, or Argon2 before storing the result in the database.',
      diff: `@@ -${lineNum},1 +${lineNum},2 @@\n- INSERT INTO users (name, pass) VALUES ('admin', MD5('secret'));\n+ -- Hash the password in application code using bcrypt/argon2 before insert\n+ INSERT INTO users (name, pass) VALUES ('admin', '$2b$12$...');`,
    });
  }

  // 5. Missing WHERE clause on UPDATE or DELETE — Dangerous Mass Modification
  if (/\b(?:UPDATE\s+\w+\s+SET\b|DELETE\s+FROM\s+\w+)\s*;/i.test(lineText) && !/\bWHERE\b/i.test(lineText) && !/^\s*--/.test(lineText)) {
    const isDelete = /\bDELETE\b/i.test(lineText);
    issues.push({
      id: `sql-sec-nowhere-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: `Dangerous Mass ${isDelete ? 'Deletion' : 'Update'}: Missing WHERE Clause`,
      description: `Executing ${isDelete ? 'DELETE FROM' : 'UPDATE ... SET'} without a WHERE clause affects every row in the table. In production this typically results in catastrophic data loss or corruption that may be unrecoverable without backups.`,
      snippet: lineText.trim(),
      suggestion: 'Add an explicit WHERE clause to constrain the scope of the operation, or wrap the statement in a transaction with a LIMIT and manual verification step.',
      diff: isDelete
        ? `@@ -${lineNum},1 +${lineNum},1 @@\n- DELETE FROM sessions;\n+ DELETE FROM sessions WHERE expired_at < NOW();`
        : `@@ -${lineNum},1 +${lineNum},1 @@\n- UPDATE users SET active = 0;\n+ UPDATE users SET active = 0 WHERE last_login < DATE_SUB(NOW(), INTERVAL 1 YEAR);`,
    });
  }

  // 6. CREATE USER with plaintext password — Credential Exposure
  if (/\bCREATE\s+USER\b/i.test(lineText) && /\bIDENTIFIED\s+BY\s+['"][^'"]+['"]/i.test(lineText) && !/^\s*--/.test(lineText)) {
    issues.push({
      id: `sql-sec-plainpw-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Credential Exposure: Plaintext Password in CREATE USER',
      description: 'Embedding plaintext passwords directly in SQL scripts exposes credentials in version control history, CI/CD logs, query logs, and binary log replication streams. Any actor with read access to these sources can retrieve the credential.',
      snippet: lineText.trim(),
      suggestion: 'Reference passwords from environment variables or a secrets manager at deployment time. If the DDL must be stored in source control, use a placeholder and substitute it via a secure templating mechanism.',
      diff: `@@ -${lineNum},1 +${lineNum},2 @@\n- CREATE USER 'deploy'@'%' IDENTIFIED BY 'SuperSecret123';\n+ -- Password injected from secrets manager at deploy time\n+ CREATE USER 'deploy'@'%' IDENTIFIED BY ?;`,
    });
  }

  // 7. EXECUTE IMMEDIATE / dynamic SQL — SQL Injection vector
  if (/\b(?:EXECUTE\s+IMMEDIATE|EXEC\s*\(|sp_executesql)\b/i.test(lineText) && !/^\s*--/.test(lineText)) {
    issues.push({
      id: `sql-sec-dynsql-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SQL Injection Vector: Dynamic SQL Execution',
      description: 'EXECUTE IMMEDIATE, EXEC(), and sp_executesql construct and run SQL statements from string values at runtime. When any part of the string originates from user input or external parameters without bind-variable substitution, attackers can inject arbitrary SQL commands.',
      snippet: lineText.trim(),
      suggestion: 'Use parameterized queries with bind variables instead of string concatenation. If dynamic SQL is unavoidable, use sp_executesql with explicit parameter declarations and validate all interpolated identifiers against a strict allowlist.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- EXECUTE IMMEDIATE 'SELECT * FROM ' || table_name;\n+ EXECUTE IMMEDIATE 'SELECT * FROM employees WHERE id = :1' USING emp_id;`,
    });
  }

  // 8. ORDER BY with numeric column index — Fragile Query
  if (/\bORDER\s+BY\s+\d+\b/i.test(lineText) && !/^\s*--/.test(lineText)) {
    issues.push({
      id: `sql-qual-orderidx-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'Fragile Query: ORDER BY Numeric Column Index',
      description: 'Using numeric positional indices in ORDER BY (e.g., ORDER BY 1, 3) creates an implicit coupling to the SELECT column order. Adding, removing, or reordering columns in the SELECT list silently changes which column is sorted, producing incorrect results without any error.',
      snippet: lineText.trim(),
      suggestion: 'Replace numeric indices with explicit column names or aliases to make the sort order self-documenting and resilient to SELECT list changes.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- SELECT name, created_at, status FROM orders ORDER BY 2;\n+ SELECT name, created_at, status FROM orders ORDER BY created_at;`,
    });
  }

  return issues;
}
