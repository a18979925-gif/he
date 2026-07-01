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
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
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
  let ratingColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (metrics.cyclomaticComplexity > 15) {
    complexityRating = 'Critical Risk';
    ratingColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (metrics.cyclomaticComplexity > 8) {
    complexityRating = 'Moderate Risk';
    ratingColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl text-left">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={15} className="text-indigo-400" />
        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Advanced Code Metrics</h4>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Metric 1 */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 font-medium block">Cyclomatic Complexity</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-slate-100">{metrics.cyclomaticComplexity}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${ratingColor}`}>
              {complexityRating}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 font-medium block">Maximum Nesting Depth</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-slate-100">{metrics.nestingDepthMax}</span>
            <span className="text-[9px] text-slate-500 font-medium">levels deep</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 font-medium block">Functions Count</span>
          <span className="text-lg font-black text-slate-100 mt-0.5 block">{metrics.functionsCount}</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 font-medium block">Density Rating</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-slate-300 capitalize">{metrics.densityScore}</span>
            <span className="text-[9px] text-slate-500 font-medium">({codePct}% code)</span>
          </div>
        </div>
      </div>

      {/* Code vs comment breakdown bar */}
      <div className="space-y-1">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Line Breakdown</span>
        <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-800 shadow-inner">
          <div className="bg-indigo-500 h-full" style={{ width: `${codePct}%` }} title={`Code: ${codeCount} lines`} />
          <div className="bg-emerald-500 h-full" style={{ width: `${commentPct}%` }} title={`Comments: ${metrics.commentLinesCount} lines`} />
          <div className="bg-slate-600 h-full" style={{ width: `${emptyPct}%` }} title={`Blank: ${metrics.emptyLinesCount} lines`} />
        </div>
        <div className="flex justify-between text-[8px] text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Code: {codeCount} ({codePct}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Comments: {metrics.commentLinesCount} ({commentPct}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span>Blank: {metrics.emptyLinesCount} ({emptyPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
