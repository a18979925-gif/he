import { ShieldAlert, CheckCircle, Flame, FileText, Code2, AlertTriangle, Layers, Info, Sparkles } from 'lucide-react';
import { AnalysisReport, AuditIssue } from '../types';

interface ReportDashboardProps {
  report: AnalysisReport;
  onSelectCategory: (category: 'all' | 'security' | 'quality' | 'refactor') => void;
  onSelectIssue: (issue: AuditIssue) => void;
  activeCategory: 'all' | 'security' | 'quality' | 'refactor';
}

export default function ReportDashboard({
  report,
  onSelectCategory,
  onSelectIssue,
  activeCategory,
}: ReportDashboardProps) {
  const { summary, issues } = report;

  // Calculate generic health rating score based on issue counts and severity
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          summary.issuesCount.security * 12 -
          summary.issuesCount.quality * 5 -
          summary.issuesCount.refactor * 3 -
          summary.criticalCount * 15
      )
    )
  );

  let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let scoreText = 'A+ Highly Secure & Robust';
  if (score < 50) {
    scoreColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    scoreText = 'Severe Vulnerabilities Found';
  } else if (score < 80) {
    scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    scoreText = 'Moderate Health Risk';
  }

  // Get top critical / warning issues
  const priorityIssues = issues
    .filter((issue) => issue.severity === 'critical' || issue.severity === 'warning')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Plan and Workspace Header Banner */}
      <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-100 tracking-tight">Raport audytu: {summary.fileName}</h3>
            {summary.plan === 'super' ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md shadow-indigo-500/10">
                <Sparkles size={9} className="text-indigo-400 animate-pulse fill-indigo-400/50" /> Super Skan AI (5 PLN)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Skan Podstawowy (1 PLN)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ukończono {new Date(summary.createdAt).toLocaleString('pl-PL')}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300 bg-slate-950/50 border border-slate-800 px-4 py-2 rounded-xl shrink-0 self-start sm:self-auto shadow-inner">
          <div className="text-left">
            <span className="text-[9px] text-slate-500 block font-semibold uppercase tracking-wider">Skanowane pliki</span>
            <span className="font-bold text-slate-200">{summary.fileCount}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-left">
            <span className="text-[9px] text-slate-500 block font-semibold uppercase tracking-wider">Wykryte języki</span>
            <span className="font-bold text-slate-200">{summary.languages.join(', ')}</span>
          </div>
        </div>
      </div>      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Health score card */}
        <div id="health-card" className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all duration-300 hover:border-slate-700">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Health Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black tracking-tight text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{score}</span>
              <span className="text-xs text-slate-500 font-bold">/100</span>
            </div>
          </div>
          <div className={`mt-4 px-3 py-1.5 rounded-xl border text-xs font-bold text-center shadow-md ${scoreColor}`}>
            {scoreText}
          </div>
        </div>

        {/* Security Metric Card */}
        <div
          id="security-metric"
          onClick={() => onSelectCategory('security')}
          className={`group p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            activeCategory === 'security'
              ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-900/20 ring-1 ring-rose-500/30'
              : 'bg-slate-900/40 border-slate-800 hover:border-rose-500/30 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security Risks</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 group-hover:scale-105 transition-all">
              <ShieldAlert size={16} />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-2 tracking-tight">{summary.issuesCount.security}</div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <Flame size={12} className="text-rose-500 animate-pulse" />
            {summary.criticalCount} Critical vulnerabilities
          </p>
        </div>

        {/* Quality Metric Card */}
        <div
          id="quality-metric"
          onClick={() => onSelectCategory('quality')}
          className={`group p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            activeCategory === 'quality'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-900/20 ring-1 ring-amber-500/30'
              : 'bg-slate-900/40 border-slate-800 hover:border-amber-500/30 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Code Smells</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:scale-105 transition-all">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-2 tracking-tight">{summary.issuesCount.quality}</div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Complexity & dead code smells</p>
        </div>

        {/* Refactoring Opportunities Card */}
        <div
          id="refactor-metric"
          onClick={() => onSelectCategory('refactor')}
          className={`group p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            activeCategory === 'refactor'
              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-900/20 ring-1 ring-indigo-500/30'
              : 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Refactors</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
              <Layers size={16} />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-2 tracking-tight">{summary.issuesCount.refactor}</div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Architectural suggestion patches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core breakdown analysis */}
        <div id="breakdown-section" className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
            <FileText size={16} className="text-indigo-400" />
            File Statistics & Insights
          </h3>
          
          <div className="grid grid-cols-3 gap-4 py-3 bg-slate-950/50 rounded-xl px-4 border border-slate-800/80 shadow-inner">
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Total Scanned Files</div>
              <div className="text-xl font-black text-slate-200 mt-1">{summary.fileCount}</div>
            </div>
            <div className="text-center border-x border-slate-800/80">
              <div className="text-xs text-slate-500 font-medium">Primary Languages</div>
              <div className="text-xs font-bold text-indigo-400 mt-2 break-all px-1">
                {summary.languages.join(', ') || 'None'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Total Audit Issues</div>
              <div className="text-xl font-black text-slate-200 mt-1">{issues.length}</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-medium">Security (OWASP Top-10 & Secrets)</span>
                <span className="font-bold text-rose-400">{summary.issuesCount.security} findings</span>
              </div>
              <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (summary.issuesCount.security / (issues.length || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-medium">Quality (Smells & Complexity)</span>
                <span className="font-bold text-amber-400">{summary.issuesCount.quality} findings</span>
              </div>
              <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (summary.issuesCount.quality / (issues.length || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-medium">Refactoring Suggestions</span>
                <span className="font-bold text-indigo-400">{summary.issuesCount.refactor} findings</span>
              </div>
              <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (summary.issuesCount.refactor / (issues.length || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Action Items */}
        <div id="action-items" className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
            <Code2 size={16} className="text-amber-400" />
            Priority Fix Queue
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {priorityIssues.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-10 flex flex-col items-center gap-3">
                <CheckCircle size={32} className="text-emerald-500/80" />
                <span className="font-medium">No critical code issues flagged.<br/>Your code looks great!</span>
              </div>
            ) : (
              priorityIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="p-3 border border-slate-800 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 hover:border-indigo-500/40 cursor-pointer transition-all space-y-1.5 text-left group"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${
                        issue.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px] group-hover:text-slate-400">
                      {issue.filePath.split('/').pop()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-300 transition-colors">{issue.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{issue.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
