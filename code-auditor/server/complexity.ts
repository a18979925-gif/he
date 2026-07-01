export interface CodeComplexity {
  linesCount: number;
  emptyLinesCount: number;
  commentLinesCount: number;
  cyclomaticComplexity: number;
  nestingDepthMax: number;
  functionsCount: number;
  densityScore: 'Excellent' | 'Moderate' | 'Heavy';
}

/**
 * Parses files to determine code quality metrics, nesting, and complexity.
 */
export function calculateComplexity(content: string): CodeComplexity {
  const lines = content.split(/\r?\n/);
  const linesCount = lines.length;
  let emptyLinesCount = 0;
  let commentLinesCount = 0;
  let cyclomaticComplexity = 1; // Base complexity is 1
  let nestingDepthMax = 0;
  let currentNesting = 0;
  let functionsCount = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Empty check
    if (!trimmed) {
      emptyLinesCount++;
      return;
    }

    // Comment checks
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('#')) {
      commentLinesCount++;
    }

    // Function detectors
    if (
      /\b(?:function|fn|def)\b/.test(trimmed) ||
      /\b(?:const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(trimmed) ||
      /\bfunc\s+(?:\([^)]+\)\s+)?\w+\(/.test(trimmed)
    ) {
      functionsCount++;
    }

    // Nesting depth check (curly brackets tracking)
    for (let char of line) {
      if (char === '{') {
        currentNesting++;
        if (currentNesting > nestingDepthMax) {
          nestingDepthMax = currentNesting;
        }
      } else if (char === '}') {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    }

    // Cyclomatic logic triggers
    const controlKeywords = [
      /\bif\b/,
      /\belse\s+if\b/,
      /\bfor\b/,
      /\bwhile\b/,
      /\bcatch\b/,
      /\bcase\b/,
      /&&/,
      /\|\|/,
      /\bmap_err\b/,
    ];

    controlKeywords.forEach((regex) => {
      if (regex.test(trimmed)) {
        cyclomaticComplexity++;
      }
    });
  });

  // Calculate density
  const codeDensity = (linesCount - emptyLinesCount - commentLinesCount) / (linesCount || 1);
  let densityScore: CodeComplexity['densityScore'] = 'Excellent';
  if (codeDensity > 0.85) {
    densityScore = 'Heavy';
  } else if (codeDensity > 0.6) {
    densityScore = 'Moderate';
  }

  return {
    linesCount,
    emptyLinesCount,
    commentLinesCount,
    cyclomaticComplexity,
    nestingDepthMax,
    functionsCount,
    densityScore,
  };
}
