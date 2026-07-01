export function analyzeGo(code: string, file: string) {
  const issues: any[] = [];

  if (code.includes("panic(")) {
    issues.push({
      type: "panic_usage",
      severity: "high",
      file
    });
  }

  if (code.includes("append(") && code.includes("for ")) {
    issues.push({
      type: "slice_growth_risk",
      severity: "medium",
      file
    });
  }

  return { file, issues };
}
