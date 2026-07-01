import React from 'react';
import { BarChart2, Shield, Activity, FileText } from 'lucide-react';

interface MetricsChartProps {
  metrics: {
    linesCount: number;
    emptyLinesCount: number;
    commentLinesCount: number;
    cyclomaticComplexity: number;
    nestingDepthMax: number;
    functionsCount: number;
    densityScore: 'Excellent' | 'Moderate' | 'Heavy';
  } | null;
}

export default function MetricsChart({ metrics }: MetricsChartProps) {
  if (!metrics) {
    return (
      <div className="bg-gray-50 border border-gray-150/80 rounded-xl p-4 text-center text-xs text-gray-400">
        Analyze a file or folder to inspect advanced complexity & safety metrics.
      </div>
    );
  }

  // Calculate percentage ratios
  const total = metrics.linesCount || 1;
  const codeCount = Math.max(0, total - metrics.emptyLinesCount - metrics.commentLinesCount);
  const codePct = Math.round((codeCount / total) * 100);
  const commentPct = Math.round((metrics.commentLinesCount / total) * 100);
  const emptyPct = Math.round((metrics.emptyLinesCount / total) * 100);

  // Determine cyclomatic rating
  let complexityRating = 'Low Risk';
  let ratingColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (metrics.cyclomaticComplexity > 15) {
    complexityRating = 'Critical Risk';
    ratingColor = 'text-rose-600 bg-rose-50 border-rose-100';
  } else if (metrics.cyclomaticComplexity > 8) {
    complexityRating = 'Moderate Risk';
    ratingColor = 'text-amber-600 bg-amber-50 border-amber-100';
  }

  return (
    <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-3xs text-left">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={15} className="text-blue-500" />
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Advanced Code Metrics</h4>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Metric 1 */}
        <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-lg">
          <span className="text-[10px] text-gray-400 font-medium block">Cyclomatic Complexity</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-gray-800">{metrics.cyclomaticComplexity}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${ratingColor}`}>
              {complexityRating}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-lg">
          <span className="text-[10px] text-gray-400 font-medium block">Maximum Nesting Depth</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-gray-800">{metrics.nestingDepthMax}</span>
            <span className="text-[9px] text-gray-400 font-medium">levels deep</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-lg">
          <span className="text-[10px] text-gray-400 font-medium block">Functions Count</span>
          <span className="text-lg font-black text-gray-800 mt-0.5 block">{metrics.functionsCount}</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-lg">
          <span className="text-[10px] text-gray-400 font-medium block">Density Rating</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-gray-700 capitalize">{metrics.densityScore}</span>
            <span className="text-[9px] text-gray-400 font-medium">({codePct}% code)</span>
          </div>
        </div>
      </div>

      {/* Code vs comment breakdown bar */}
      <div className="space-y-1">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Line Breakdown</span>
        <div className="h-2 w-full rounded-full overflow-hidden flex bg-gray-100">
          <div className="bg-blue-500 h-full" style={{ width: `${codePct}%` }} title={`Code: ${codeCount} lines`} />
          <div className="bg-emerald-400 h-full" style={{ width: `${commentPct}%` }} title={`Comments: ${metrics.commentLinesCount} lines`} />
          <div className="bg-gray-200 h-full" style={{ width: `${emptyPct}%` }} title={`Blank: ${metrics.emptyLinesCount} lines`} />
        </div>
        <div className="flex justify-between text-[8px] text-gray-400 font-mono pt-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Code: {codeCount} ({codePct}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Comments: {metrics.commentLinesCount} ({commentPct}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <span>Blank: {metrics.emptyLinesCount} ({emptyPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
