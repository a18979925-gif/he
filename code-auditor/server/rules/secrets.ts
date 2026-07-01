import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanSecrets(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. AWS API Access Keys
  if (/(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/.test(lineText)) {
    issues.push({
      id: `sec-cred-aws-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Hardcoded AWS Access Key Credential',
      description: 'Found a plaintext AWS programmatic Access Key ID. Attackers can leverage leaked tokens to hijack cloud compute nodes.',
      snippet: lineText.trim().replace(/(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/, 'AKIAXXXXXXXXXXXXXXXX'),
      suggestion: 'Remove secrets from code files. Store credential credentials dynamically using env variables, AWS IAM Roles, or Secret Manager.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- const key = "AKIAID84620015947230";\n+ const key = process.env.AWS_ACCESS_KEY_ID;`,
    });
  }

  // 2. Slack Webhook URLs
  if (/https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9_]{8}\/B[A-Z0-9_]{8}\/[A-Za-z0-9_]{24}/.test(lineText)) {
    issues.push({
      id: `sec-cred-slack-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Slack Webhook URL Exposure',
      description: 'Exposing Slack integration webhook hooks permits unsolicited external parties to trigger notifications, messages, or phishing links.',
      snippet: lineText.trim().replace(/\/services\/T[A-Z0-9_]{8}\/B[A-Z0-9_]{8}\/[A-Za-z0-9_]{24}/, '/services/TXXXXX/BXXXXX/XXXXXX'),
      suggestion: 'Extract Slack notification webhooks into private environment variables or secrets.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- const webhookUrl = "https://hooks.slack.com/services/T123/B456/789";\n+ const webhookUrl = process.env.SLACK_WEBHOOK_URL;`,
    });
  }

  // 3. Private SSH Cryptographic Keys
  if (lineText.includes('-----BEGIN PRIVATE KEY-----') || lineText.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    issues.push({
      id: `sec-cred-privatekey-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Exposed Plaintext Private Certificate',
      description: 'Hardcoding asymmetric private keys allows trivial authentication bypasses, SSH hijacks, or transport encryption compromises.',
      snippet: '-----BEGIN PRIVATE KEY----- [MASKED_BY_SCANNER]',
      suggestion: 'Remove certificate definitions from codebase assets and dynamic payloads immediately.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- const pkey = "-----BEGIN PRIVATE KEY-----...";\n+ const pkey = fs.readFileSync(process.env.PRIVATE_KEY_PATH);`,
    });
  }

  // 4. Generic high-entropy secret assignments
  if (/\b(?:api_key|secret|password|db_pass|access_token|bearer)\s*[:=]\s*['"][a-zA-Z0-9\-_=]{16,}['"]/i.test(lineText)) {
    // Avoid triggering on environment setups / mock files / examples
    if (!lineText.includes('process.env') && !lineText.includes('import.meta') && !filePath.includes('analyzer.ts') && !filePath.includes('secrets.ts')) {
      issues.push({
        id: `sec-cred-generic-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'security',
        severity: 'critical',
        title: 'Plaintext API Secret Token Assignment',
        description: 'Plaintext secret, password, or bearer dynamic authentication keys are stored statically. This makes code compromises lethal.',
        snippet: lineText.trim().replace(/(['"])[a-zA-Z0-9\-_=]{12,}(['"])/, '$1[MASKED_SECRET]$2'),
        suggestion: 'Reference runtime configuration settings and store actual secrets in protected secret environments.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- const apiSecret = "sk_live_51Mxxxxxxxxxxxxxxx";\n+ const apiSecret = process.env.THIRD_PARTY_SECRET;`,
      });
    }
  }

  return issues;
}
