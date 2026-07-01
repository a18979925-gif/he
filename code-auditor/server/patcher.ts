/**
 * Formats a clean unified-diff suggestion block for visual representation in DiffViewer
 */
export function buildUnifiedDiff(
  lineNum: number,
  originalText: string,
  remediatedText: string
): string {
  const origTrimmed = originalText.trim();
  const remTrimmed = remediatedText.trim();
  
  return [
    `@@ -${lineNum},1 +${lineNum},1 @@`,
    `-${origTrimmed ? ' ' + origTrimmed : ''}`,
    `+${remTrimmed ? ' ' + remTrimmed : ''}`
  ].join('\n');
}
