import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanDevops(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. Dockerfile running as ROOT explicitly
  if (filePath.toLowerCase().endsWith('dockerfile') || filePath.includes('Dockerfile')) {
    if (/^\s*USER\s+root\b/i.test(lineText)) {
      issues.push({
        id: `devops-sec-root-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'security',
        severity: 'warning',
        title: 'Dockerfile Privilege Escalation: Running as root',
        description: 'Executing processes in containers as root compromises the hosting runtime if container escape vulnerabilities are exploited.',
        snippet: lineText.trim(),
        suggestion: 'Create a restricted application user and bind execution scopes to that user using USER directive.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- USER root\n+ RUN groupadd -r app && useradd -r -g app appuser\n+ USER appuser`,
      });
    }

    // 2. Base image using latest/unpinned tag
    if (/^\s*FROM\s+[^:]+\s*(?:$|#|:latest\b)/i.test(lineText)) {
      issues.push({
        id: `devops-qual-tag-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'quality',
        severity: 'info',
        title: 'Dockerfile Quality: Unpinned base image tag',
        description: 'Using generic or :latest base image designations yields non-reproducible container builds and silent breaking upgrades.',
        snippet: lineText.trim(),
        suggestion: 'Specify explicit semantic version tags or immutable SHA digest checksums for baseline images.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- FROM node:latest\n+ FROM node:20.11-alpine`,
      });
    }

    // 3. Exposed sensitive database ports
    if (/^\s*EXPOSE\s+(?:5432|3306|27017|6379|5984|9200)\b/i.test(lineText)) {
      issues.push({
        id: `devops-sec-port-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'security',
        severity: 'warning',
        title: 'Network Exposure: Insecure database port exposure',
        description: 'Exposing default database ports (e.g. PostgreSQL 5432, Redis 6379) directly inside a Dockerfile makes them targets for external port scans if bound publicly.',
        snippet: lineText.trim(),
        suggestion: 'Remove raw EXPOSE clauses for backend data stores. Keep database routing internal inside private Docker network bridges.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- EXPOSE 5432\n+ # Managed internally via private Docker bridge networks`,
      });
    }
  }

  // 4. Kubernetes / Compose Privileged mode
  if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
    if (/\bprivileged\s*:\s*true\b/i.test(lineText)) {
      issues.push({
        id: `devops-sec-priv-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'security',
        severity: 'critical',
        title: 'Kubernetes/Compose Hazard: Privileged Container Mode active',
        description: 'Running containers in privileged mode provides full device and kernel access of the underlying host machine, rendering breakouts trivial.',
        snippet: lineText.trim(),
        suggestion: 'Disable privileged mode and requests specific fine-grained Capabilities (e.g. CAP_NET_ADMIN) if needed.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- privileged: true\n+ securityContext:\n+   allowPrivilegeEscalation: false`,
      });
    }

    // 5. Insecure Kubernetes / Compose: Wildcard host bindings
    if (/\bports\s*:\s*-\s*["']?0\.0\.0\.0:/.test(lineText)) {
      issues.push({
        id: `devops-sec-binding-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'security',
        severity: 'warning',
        title: 'Network Security: Wildcard IP Binding (0.0.0.0)',
        description: 'Binding containers explicitly to 0.0.0.0 maps services directly to all network interfaces, including public internet addresses.',
        snippet: lineText.trim(),
        suggestion: 'Bind ports locally to loopback adapters (127.0.0.1) unless public ingress is explicitly required.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- - "0.0.0.0:8080:8080"\n+ - "127.0.0.1:8080:8080"`,
      });
    }
  }

  return issues;
}
