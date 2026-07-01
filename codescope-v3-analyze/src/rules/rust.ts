export function analyzeRust(code: string, file: string) {
  const issues: any[] = [];

  if (code.includes("unwrap()")) {
    issues.push({
      type: "unsafe_unwrap",
      severity: "high",
      file
    });
  }

  if (code.includes("loop") && code.includes(".find")) {
    issues.push({
      type: "possible_n2_pattern",
      severity: "medium",
      file
    });
  }

  return { file, issues };
}
