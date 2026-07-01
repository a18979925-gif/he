import { ShieldAlert, CheckCircle, Flame, FileText, Code2, AlertTriangle, Layers, Info, Sparkles, Server, Database, GitBranch, Key } from 'lucide-react';
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
  const { summary } = report;
  
  // Use new healthScore from engine, fallback to summary-based calculation
  const score = report.healthScore ?? Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          (summary?.issuesCount?.security || 0) * 12 -
          (summary?.issuesCount?.quality || 0) * 5 -
          (summary?.issuesCount?.refactor || 0) * 3 -
          (summary?.criticalCount || 0) * 15
      )
    )
  );

  let scoreColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  let scoreText = 'A+ Highly Secure & Robust';
  if (score < 50) {
    scoreColor = 'text-rose-600 bg-rose-50 border-rose-100';
    scoreText = 'Severe Vulnerabilities Found';
  } else if (score < 80) {
    scoreColor = 'text-amber-600 bg-amber-50 border-amber-100';
    scoreText = 'Moderate Health Risk';
  }

  // Get top critical / warning issues
  // We'll normalize them to the AuditIssue interface for the list
  const priorityIssues: AuditIssue[] = [
    ...(report.security || []).map(s => ({
      id: crypto.randomUUID(),
      filePath: s.file,
      line: s.line,
      category: 'security' as const,
      severity: (s.severity?.toLowerCase() as any) || 'warning',
      title: s.category,
      description: s.description,
      snippet: s.oldCode || '',
    })),
    ...(report.performance || []).map(p => ({
        id: crypto.randomUUID(),
        filePath: p.file,
        line: p.line,
        category: 'quality' as const,
        severity: (p.severity?.toLowerCase() as any) || 'warning',
        title: p.issue,
        description: p.description,
        snippet: p.suggestedOptimization || '',
    }))
  ]
  .filter((issue) => issue.severity === 'critical' || issue.severity === 'warning')
  .slice(0, 5);

  const securityCount = summary?.issuesCount?.security || report.security?.length || 0;
  const qualityCount = summary?.issuesCount?.quality || report.performance?.length || 0;
  const refactorCount = summary?.issuesCount?.refactor || report.refactoring?.length || 0;
  const criticalCount = summary?.criticalCount || report.security?.filter(s => s.severity?.toLowerCase() === 'critical').length || 0;

  return (
    <div className="space-y-6">
      {/* Plan and Workspace Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
        <div className="text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Raport audytu: {summary?.fileName || report.projectName}</h3>
            {summary?.plan === 'super' ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-3xs">
                <Sparkles size={9} className="text-blue-600 animate-pulse fill-blue-100" /> Super Skan AI (5 PLN)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Skan Podstawowy (1 PLN)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ukończono {summary?.createdAt ? new Date(summary.createdAt).toLocaleString('pl-PL') : 'Teraz'}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50/50 border border-slate-100 px-4 py-2 rounded-xl shrink-0 self-start sm:self-auto">
          <div className="text-left">
            <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Skanowane pliki</span>
            <span className="font-bold text-slate-800">{summary?.fileCount || report.files?.length || 0}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-left">
            <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Wykryte języki</span>
            <span className="font-bold text-slate-850">{(summary?.languages || report.projectDNA?.languages?.map(l=>l.name) || []).join(', ') || 'Brak'}</span>
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Health score card */}
        <div id="health-card" className="bg-radial from-slate-50 to-white p-5 rounded-2xl border border-slate-200/65 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Health Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black tracking-tight text-slate-850 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{score}</span>
              <span className="text-xs text-slate-400 font-bold">/100</span>
            </div>
          </div>
          <div className={`mt-4 px-3 py-1.5 rounded-xl border text-xs font-bold text-center shadow-2xs ${scoreColor}`}>
            {scoreText}
          </div>
        </div>

        {/* Security Metric Card */}
        <div
          id="security-metric"
          onClick={() => onSelectCategory('security')}
          className={`group p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
            activeCategory === 'security'
              ? 'bg-rose-50/40 border-rose-300 shadow-sm ring-2 ring-rose-500/10'
              : 'bg-white border-slate-100 hover:border-rose-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Risks</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:scale-105 transition-all">
              <ShieldAlert size={16} />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{securityCount}</div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <Flame size={12} className="text-rose-500 animate-pulse" />
            {criticalCount} Critical vulnerabilities
          </p>
        </div>

        {/* Quality Metric Card */}
        <div
          id="quality-metric"
          onClick={() => onSelectCategory('quality')}
          className={`group p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
            activeCategory === 'quality'
              ? 'bg-amber-50/40 border-amber-300 shadow-sm ring-2 ring-amber-500/10'
              : 'bg-white border-slate-100 hover:border-amber-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code Smells</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:scale-105 transition-all">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{qualityCount}</div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Complexity & dead code smells</p>
        </div>

        {/* Refactoring Opportunities Card */}
        <div
          id="refactor-metric"
          onClick={() => onSelectCategory('refactor')}
          className={`group p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
            activeCategory === 'refactor'
              ? 'bg-blue-50/40 border-blue-300 shadow-sm ring-2 ring-blue-500/10'
              : 'bg-white border-slate-100 hover:border-blue-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refactors</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105 transition-all">
              <Layers size={16} />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{refactorCount}</div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Architectural suggestion patches</p>
        </div>
      </div>
      
      {/* Deep Engine Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Project DNA & Architecture */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-sm">
           <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
             <Server size={16} className="text-indigo-500" />
             Project DNA & Architecture
           </h3>
           {report.architecture && (
             <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm">
                <div className="font-bold text-indigo-900 flex justify-between">
                    <span>Style: {report.architecture.style}</span>
                    <span className="text-indigo-600 text-xs px-2 py-0.5 bg-indigo-100 rounded-full">{report.architecture.confidence}% Confidence</span>
                </div>
                <p className="text-indigo-700 text-xs mt-1">{report.architecture.explanation}</p>
             </div>
           )}
           
           <div className="grid grid-cols-2 gap-3 mt-4">
             {report.projectDNA?.frameworks?.length > 0 && (
               <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Frameworks</div>
                  <div className="flex flex-wrap gap-1">
                    {report.projectDNA.frameworks.map(f => (
                      <span key={f} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">{f}</span>
                    ))}
                  </div>
               </div>
             )}
             {report.projectDNA?.databases?.length > 0 && (
               <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Databases</div>
                  <div className="flex flex-wrap gap-1">
                    {report.projectDNA.databases.map(f => (
                      <span key={f} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">{f}</span>
                    ))}
                  </div>
               </div>
             )}
           </div>
        </div>

        {/* Topology: Endpoints & DB */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-sm">
           <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
             <GitBranch size={16} className="text-teal-500" />
             Topology
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-lg p-3">
                 <div className="flex items-center gap-2 mb-2">
                    <Database size={14} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">Tables ({report.database?.tables?.length || 0})</span>
                 </div>
                 <div className="max-h-32 overflow-y-auto space-y-1">
                    {report.database?.tables?.map(t => (
                       <div key={t.name} className="text-[10px] px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-600 truncate">
                          {t.name}
                       </div>
                    ))}
                 </div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                 <div className="flex items-center gap-2 mb-2">
                    <Server size={14} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">Endpoints ({report.endpoints?.length || 0})</span>
                 </div>
                 <div className="max-h-32 overflow-y-auto space-y-1">
                    {report.endpoints?.map(e => (
                       <div key={e.url} className="text-[10px] px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-600 truncate flex justify-between">
                          <span className="font-bold text-slate-500">{e.method}</span>
                          <span>{e.url}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core breakdown analysis */}
        <div id="breakdown-section" className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
            <FileText size={16} className="text-blue-500" />
            Vulnerability Breakdown
          </h3>
          
          <div className="grid grid-cols-3 gap-4 py-2 bg-gray-50/60 rounded-lg px-4 border border-gray-50">
            <div className="text-center">
              <div className="text-xs text-gray-500">Security / Critical</div>
              <div className="text-xl font-bold text-rose-600 mt-1">{securityCount}</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-xs text-gray-500">Performance / Bugs</div>
              <div className="text-xl font-bold text-amber-600 mt-1">{qualityCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Refactoring</div>
              <div className="text-xl font-bold text-blue-600 mt-1">{refactorCount}</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
             {/* Health Reasons */}
             {report.healthReasons && report.healthReasons.length > 0 && (
                <div className="space-y-2">
                   <h4 className="text-xs font-bold text-slate-600 uppercase">Health Factors</h4>
                   {report.healthReasons.map((r, i) => (
                      <div key={i} className="text-xs p-2 bg-slate-50 border border-slate-100 rounded-md">
                         <strong className="text-slate-800">{r.category} ({r.score}/100): </strong>
                         <span className="text-slate-600">{r.description}</span>
                         <div className="mt-1 text-[10px] text-blue-600 font-medium">Recommendation: {r.recommendation}</div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>

        {/* Priority Action Items */}
        <div id="action-items" className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
            <Code2 size={16} className="text-amber-500" />
            Priority Fix Queue
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {priorityIssues.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-10 flex flex-col items-center gap-2">
                <CheckCircle size={28} className="text-emerald-500" />
                No critical code issues flagged. Your code looks great!
              </div>
            ) : (
              priorityIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-blue-200 cursor-pointer transition-all space-y-1 text-left"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                        issue.severity === 'critical' || issue.severity === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                      {issue.filePath?.split('/').pop()}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{issue.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{issue.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
