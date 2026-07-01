export function generateReport(scanOutput: { results: any[], dependencyGraph: any }) {
  const { results, dependencyGraph } = scanOutput;
  const flatIssues = results.flatMap(r => r.issues || []);

  const bySeverity = {
    critical: flatIssues.filter(i => i.severity === "critical"),
    high: flatIssues.filter(i => i.severity === "high"),
    medium: flatIssues.filter(i => i.severity === "medium"),
    low: flatIssues.filter(i => i.severity === "low")
  };

  return {
    summary: {
      files: results.length,
      issues: flatIssues.length,
      critical: bySeverity.critical.length,
      high: bySeverity.high.length,
      medium: bySeverity.medium.length,
      low: bySeverity.low.length
    },
    results,
    bySeverity,
    dependencyGraph
  };
}
