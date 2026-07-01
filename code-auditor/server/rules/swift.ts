import crypto from 'crypto';
import { AuditIssue } from '../../src/types';

export function scanSwift(filePath: string, lineText: string, lineNum: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. UserDefaults storing sensitive data (passwords, tokens, keys)
  if (/UserDefaults\b/.test(lineText) && /\b(?:password|token|secret|apiKey|api_key|accessToken|access_token|privateKey|private_key|credential)\b/i.test(lineText)) {
    issues.push({
      id: `swift-sec-storage-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'Insecure Storage: Sensitive Data in UserDefaults',
      description: 'UserDefaults stores data in an unencrypted plist file on disk. Passwords, tokens, and cryptographic keys stored here can be trivially extracted from device backups or a jailbroken filesystem.',
      snippet: lineText.trim(),
      suggestion: 'Use the iOS Keychain Services API (via Security framework or a wrapper like KeychainAccess) to store sensitive credentials securely.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- UserDefaults.standard.set(token, forKey: "authToken")\n+ try { let keychain = Keychain(service: "com.app.auth"); keychain["authToken"] = token }`,
    });
  }

  // 2. NSAllowsArbitraryLoads = true — App Transport Security Bypass
  if (/NSAllowsArbitraryLoads/i.test(lineText) && /true|YES/i.test(lineText)) {
    issues.push({
      id: `swift-sec-ats-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'App Transport Security Bypass: Arbitrary Loads Enabled',
      description: 'Setting NSAllowsArbitraryLoads to true disables App Transport Security globally, allowing the app to make plaintext HTTP connections. This exposes all network traffic to interception via man-in-the-middle attacks.',
      snippet: lineText.trim(),
      suggestion: 'Remove NSAllowsArbitraryLoads or set it to false. Use NSExceptionDomains to whitelist only the specific domains that genuinely require HTTP.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- <key>NSAllowsArbitraryLoads</key><true/>\n+ <key>NSAllowsArbitraryLoads</key><false/>`,
    });
  }

  // 3. try! / force unwrap (!) — Crash Risk
  if (/\btry\s*!/.test(lineText)) {
    issues.push({
      id: `swift-qual-try-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'quality',
      severity: 'warning',
      title: 'Crash Risk: Force-try (try!) Will Crash on Failure',
      description: 'Using try! converts a throwing call into a fatal runtime trap. If the operation fails for any reason (corrupt data, missing file, network error), the app will crash immediately with no opportunity for recovery.',
      snippet: lineText.trim(),
      suggestion: 'Use do/catch for proper error handling, or try? when a nil result on failure is acceptable.',
      diff: `@@ -${lineNum},1 +${lineNum},2 @@\n- let data = try! JSONDecoder().decode(Model.self, from: rawData)\n+ guard let data = try? JSONDecoder().decode(Model.self, from: rawData) else { return }\n+ // handle decoded data`,
    });
  }

  // Force unwrap on non-declaration lines (heuristic: contains `!` used as unwrap, not `!=` or `!==` or booleans)
  if (/\w+\s*!\s*\./.test(lineText) || /\bas\s*!\s/.test(lineText)) {
    if (!/!=/.test(lineText) && !/IBOutlet/.test(lineText) && !/IBAction/.test(lineText)) {
      issues.push({
        id: `swift-qual-unwrap-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'quality',
        severity: 'warning',
        title: 'Crash Risk: Force Unwrap (!) on Optional Value',
        description: 'Force unwrapping an optional with ! triggers a fatal error if the value is nil. This is a leading cause of production crashes in Swift applications.',
        snippet: lineText.trim(),
        suggestion: 'Use optional binding (if let / guard let), optional chaining (?.), or nil-coalescing (??) for safe unwrapping.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- let name = user!.name\n+ let name = user?.name ?? "Unknown"`,
      });
    }
  }

  // 4. UIPasteboard.general reading sensitive data — Clipboard Hijacking
  if (/UIPasteboard\.general/.test(lineText)) {
    issues.push({
      id: `swift-sec-clipboard-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Clipboard Hijacking: UIPasteboard.general Access',
      description: 'Reading from or writing to the system-wide pasteboard exposes sensitive data (passwords, tokens, personal information) to every other app on the device. Malicious apps routinely monitor the clipboard for credentials.',
      snippet: lineText.trim(),
      suggestion: 'Use app-specific local pasteboards with expiration, or avoid clipboard for sensitive data entirely. Consider UIPasteboard.withUniqueName() for inter-component transfers.',
      diff: `@@ -${lineNum},1 +${lineNum},2 @@\n- let sensitive = UIPasteboard.general.string\n+ let localBoard = UIPasteboard.withUniqueName()\n+ localBoard.setItems([[UIPasteboard.typeAutomatic: data]], options: [.expirationDate: Date().addingTimeInterval(60)])`,
    });
  }

  // 5. CC_MD5 / CC_SHA1 — Weak Hashing
  if (/\b(?:CC_MD5|CC_SHA1)\b/.test(lineText)) {
    issues.push({
      id: `swift-sec-hash-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Weak Cryptographic Hash: CC_MD5/CC_SHA1 Detected',
      description: 'MD5 and SHA-1 have known collision vulnerabilities and are considered broken for cryptographic purposes. Attackers can generate hash collisions to forge signatures, tamper with integrity checks, or crack password hashes.',
      snippet: lineText.trim(),
      suggestion: 'Use SHA-256 or SHA-512 via the CryptoKit framework (SHA256.hash(data:)) or CommonCrypto CC_SHA256 for hashing. For passwords, use bcrypt or Argon2.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- CC_MD5(data, CC_LONG(data.count), &digest)\n+ let digest = SHA256.hash(data: data)`,
    });
  }

  // Also detect Insecure.MD5 / Insecure.SHA1 from CryptoKit
  if (/\bInsecure\s*\.\s*(?:MD5|SHA1)\b/.test(lineText)) {
    issues.push({
      id: `swift-sec-insecurehash-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Weak Cryptographic Hash: CryptoKit Insecure Hash Used',
      description: 'CryptoKit explicitly marks MD5 and SHA1 under the Insecure namespace because they are cryptographically broken. Using them for authentication, integrity, or security defeats the purpose of hashing.',
      snippet: lineText.trim(),
      suggestion: 'Replace with SHA256.hash(data:) or SHA512.hash(data:) from CryptoKit for secure hashing operations.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- let hash = Insecure.MD5.hash(data: inputData)\n+ let hash = SHA256.hash(data: inputData)`,
    });
  }

  // 6. URLSession with disabled certificate validation — SSL Pinning Bypass
  if (/didReceive\s+challenge.*URLAuthenticationChallenge/.test(lineText) || /\.cancelAuthenticationChallenge/.test(lineText) || /\.useCredential.*URLCredential\s*\(\s*trust\s*:/.test(lineText) || /serverTrust\b/.test(lineText) && /completionHandler\s*\(\s*\.useCredential/.test(lineText)) {
    issues.push({
      id: `swift-sec-ssl-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'critical',
      title: 'SSL Pinning Bypass: Certificate Validation Disabled',
      description: 'Blindly trusting all server certificates or accepting any URLAuthenticationChallenge without proper validation disables TLS certificate pinning. This allows attackers to intercept encrypted traffic using a proxy with a self-signed certificate.',
      snippet: lineText.trim(),
      suggestion: 'Validate the server trust against pinned certificates or public keys. Use SecTrustEvaluateWithError() and compare against known certificate hashes.',
      diff: `@@ -${lineNum},1 +${lineNum},3 @@\n- completionHandler(.useCredential, URLCredential(trust: serverTrust))\n+ guard SecTrustEvaluateWithError(serverTrust, nil) else {\n+   completionHandler(.cancelAuthenticationChallenge, nil); return\n+ }`,
    });
  }

  // Also detect URLSessionDelegate with .performDefaultHandling disabled
  if (/SecTrustEvaluate\b/.test(lineText) && !/SecTrustEvaluateWithError/.test(lineText)) {
    issues.push({
      id: `swift-sec-ssleval-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Deprecated SSL Trust Evaluation: SecTrustEvaluate',
      description: 'SecTrustEvaluate is deprecated and has known edge cases where it can return success even for invalid certificates. The modern replacement provides stricter validation semantics.',
      snippet: lineText.trim(),
      suggestion: 'Migrate to SecTrustEvaluateWithError() which provides clearer error handling and stricter certificate validation.',
      diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- SecTrustEvaluate(serverTrust, &result)\n+ let isTrusted = SecTrustEvaluateWithError(serverTrust, nil)`,
    });
  }

  // 7. NSLog() / print() with sensitive data in release builds — Information Leakage
  if (/\b(?:NSLog|print)\s*\(/.test(lineText) && /\b(?:password|token|secret|apiKey|api_key|accessToken|credential|ssn|credit.?card|cvv|pin)\b/i.test(lineText)) {
    issues.push({
      id: `swift-sec-log-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'warning',
      title: 'Information Leakage: Sensitive Data in Log Output',
      description: 'NSLog and print statements persist in device system logs accessible via Console.app, Xcode, or forensic tools. Logging passwords, tokens, or PII leaks credentials to anyone with device access or crash log aggregation.',
      snippet: lineText.trim(),
      suggestion: 'Remove sensitive data from log statements entirely. Use os_log with .private privacy level for necessary debug logging, or wrap in #if DEBUG to exclude from release builds.',
      diff: `@@ -${lineNum},1 +${lineNum},3 @@\n- NSLog("User token: \\(token)")\n+ #if DEBUG\n+ os_log("Auth flow completed", log: .default, type: .debug)\n+ #endif`,
    });
  }

  // 8. Jailbreak Detection bypass patterns — Jailbreak Detection Evasion
  if (/\b(?:canOpenURL|fileExists)\s*\(/.test(lineText) && /(?:cydia|sileo|filza|substrate|apt|jailbreak)/i.test(lineText)) {
    issues.push({
      id: `swift-sec-jailbreak-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: lineNum,
      category: 'security',
      severity: 'info',
      title: 'Jailbreak Detection Evasion: Easily Bypassed Check',
      description: 'File-existence and URL-scheme checks for Cydia/Sileo are the most commonly hooked and bypassed jailbreak detection methods. Tools like Liberty Lite, Shadow, and A-Bypass trivially neutralize these checks by hooking FileManager and UIApplication.',
      snippet: lineText.trim(),
      suggestion: 'Layer multiple detection strategies: check for writable system paths, attempt fork(), inspect dyld loaded libraries, and use integrity attestation APIs (DeviceCheck / App Attest). Never rely on a single file-path check.',
      diff: `@@ -${lineNum},1 +${lineNum},4 @@\n- if FileManager.default.fileExists(atPath: "/Applications/Cydia.app") {\n+ func isCompromised() -> Bool {\n+   let suspicious = ["/usr/sbin/frida-server", "/usr/bin/cycript", "/Applications/Cydia.app"]\n+   let fileCheck = suspicious.contains { FileManager.default.fileExists(atPath: $0) }\n+   let writeCheck = (try? "jb".write(toFile: "/private/jb.txt", atomically: true, encoding: .utf8)) != nil`,
    });
  }

  // Also detect hardcoded jailbreak path arrays
  if (/\/Applications\/Cydia\.app|\/Library\/MobileSubstrate|\/usr\/sbin\/sshd|\/private\/var\/lib\/apt/.test(lineText)) {
    if (!/fileExists/.test(lineText) && !/canOpenURL/.test(lineText)) {
      issues.push({
        id: `swift-sec-jbpath-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: lineNum,
        category: 'security',
        severity: 'info',
        title: 'Jailbreak Detection: Hardcoded Detection Path',
        description: 'Hardcoded jailbreak detection paths are well-known and catalogued by bypass tools. These strings are easily identified through static analysis and neutralized at runtime via method swizzling or Substrate hooks.',
        snippet: lineText.trim(),
        suggestion: 'Obfuscate detection strings at compile time, rotate checks dynamically, and supplement with server-side device integrity verification using Apple DeviceCheck or App Attest.',
        diff: `@@ -${lineNum},1 +${lineNum},1 @@\n- "/Applications/Cydia.app"\n+ String(data: Data(base64Encoded: obfuscatedPath)!, encoding: .utf8) ?? ""`,
      });
    }
  }

  return issues;
}
