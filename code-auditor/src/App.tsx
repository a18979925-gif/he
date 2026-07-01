import { useState, useEffect } from 'react';
import {
  FileCode,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  History,
  Upload,
  Search,
  BookOpen,
  X,
  PlusCircle,
  Code,
  Flame,
  LayoutGrid,
  ChevronRight,
  Info,
  Download,
  Sparkles
} from 'lucide-react';
import FileTree from './components/FileTree';
import ReportDashboard from './components/ReportDashboard';
import UploadSection from './components/UploadSection';
import DiffViewer from './components/DiffViewer';
import AiRemediationChat from './components/AiRemediationChat';
import MetricsChart from './components/MetricsChart';
import { AnalysisReport, AnalysisSummary, AuditIssue } from './types';

export default function App() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [historicalSummaries, setHistoricalSummaries] = useState<AnalysisSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'files'>('dashboard');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'security' | 'quality' | 'refactor'>('all');
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all historical scans on boot
  const fetchHistoricalScans = async () => {
    try {
      const res = await fetch('/api/analysis/list');
      if (res.ok) {
        const data = await res.json();
        setHistoricalSummaries(data);
      }
    } catch (err) {
      console.error('Failed to retrieve past audit summaries:', err);
    }
  };

  useEffect(() => {
    fetchHistoricalScans();
  }, []);

  // Fetch detailed report when user selects a historical summary item
  const loadReport = async (analysisId: string) => {
    try {
      const res = await fetch(`/api/analysis/${analysisId}`);
      if (res.ok) {
        const reportData: AnalysisReport = await res.json();
        setReport(reportData);
        setActiveTab('dashboard');
        // Pre-select first file from tree if available
        if (reportData.files && reportData.files.length > 0) {
          setSelectedFilePath(reportData.files[0].path);
        }
        setShowUploadModal(false);
      }
    } catch (err) {
      console.error('Failed to load full report payload:', err);
    }
  };

  const handleAnalysisCompleted = (newReport: AnalysisReport) => {
    setReport(newReport);
    setActiveTab('dashboard');
    if (newReport.files && newReport.files.length > 0) {
      setSelectedFilePath(newReport.files[0].path);
    }
    fetchHistoricalScans(); // Refresh list
    setShowUploadModal(false);
  };

  // Convert the new engine schema back into the normalized AuditIssue array for the UI
  const unifiedIssues: AuditIssue[] = report ? [
    ...(report.security || []).map(s => ({
      id: `sec-${s.line}-${s.file}`,
      filePath: s.file,
      line: s.line,
      category: 'security' as const,
      severity: (s.severity?.toLowerCase() as any) || 'warning',
      title: s.category,
      description: s.description,
      snippet: s.oldCode || '',
      suggestion: s.solution || s.newCode || ''
    })),
    ...(report.performance || []).map(p => ({
        id: `perf-${p.line}-${p.file}`,
        filePath: p.file,
        line: p.line,
        category: 'quality' as const,
        severity: (p.severity?.toLowerCase() as any) || 'warning',
        title: p.issue,
        description: p.description,
        snippet: p.suggestedOptimization || '',
    })),
    ...(report.refactoring || []).map(r => ({
        id: `ref-${r.loc}-${r.file}`,
        filePath: r.file,
        line: 1, // Fallback as loc represents line count not line number
        category: 'refactor' as const,
        severity: (r.risk?.toLowerCase() as any) || 'info',
        title: 'Refactor Required',
        description: r.suggestion,
        snippet: `Complexity: ${r.complexity}\nBenefit: ${r.benefit}`,
    }))
  ] : [];

  // Export full reports as clean Markdown files
  const downloadMarkdownReport = () => {
    if (!report || !report.summary) return;
    
    const summary = report.summary;
    let md = `# Security & Quality Audit Report: ${summary.fileName || report.projectName}\n`;
    md += `Generated on: ${summary.createdAt ? new Date(summary.createdAt).toLocaleString() : 'Now'}\n`;
    md += `File Count: ${summary.fileCount || report.files?.length || 0} | Scanned Files: ${summary.scannedFileCount || report.files?.length || 0}\n\n`;
    md += `## Summary of Findings\n`;
    md += `- **Critical Vulnerabilities**: ${summary.criticalCount || 0}\n`;
    md += `- **Security Concerns**: ${summary.issuesCount?.security || report.security?.length || 0}\n`;
    md += `- **Code Quality Smells**: ${summary.issuesCount?.quality || report.performance?.length || 0}\n`;
    md += `- **Refactoring Suggestions**: ${summary.issuesCount?.refactor || report.refactoring?.length || 0}\n\n`;
    
    md += `## Detailed Vulnerabilities & Issues\n\n`;
    unifiedIssues.forEach((issue, index) => {
      md += `### ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n`;
      md += `- **File**: \`${issue.filePath}\` (Line ${issue.line})\n`;
      md += `- **Category**: ${issue.category}\n`;
      md += `- **Description**: ${issue.description}\n`;
      md += `\n**Vulnerable Code Snippet**:\n\`\`\`\n${issue.snippet}\n\`\`\`\n`;
      if (issue.suggestion) {
        md += `\n**Remediation Suggestion**:\n${issue.suggestion}\n`;
      }
      if (issue.diff) {
        md += `\n**Proposed Patch Diff**:\n\`\`\`diff\n${issue.diff}\n\`\`\`\n`;
      }
      md += `\n---\n\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${(summary.fileName || report.projectName).replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to retrieve selected file's content
  const selectedFile = report?.files?.find((f) => f.path === selectedFilePath);

  // Issues matching the currently selected file and active filters
  const filteredIssuesForSelectedFile = unifiedIssues.filter((issue) => {
    if (issue.filePath !== selectedFilePath) return false;
    if (activeCategoryFilter !== 'all' && issue.category !== activeCategoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.title?.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        issue.snippet?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter global issues based on tab category choice
  const filteredGlobalIssues = unifiedIssues.filter((issue) => {
    if (activeCategoryFilter !== 'all' && issue.category !== activeCategoryFilter) return false;
    return true;
  });

  // Jump straight to file preview when clicking on a priority issue from dashboard
  const handleSelectIssueFromDashboard = (issue: AuditIssue) => {
    setSelectedFilePath(issue.filePath);
    setSelectedIssueId(issue.id);
    setActiveTab('files');
    // Align category filter so the selected issue isn't hidden
    setActiveCategoryFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans text-gray-800 antialiased">
      {/* Upper Navigation Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-xs">
            <Code size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
              Code Auditor <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold uppercase">Heuristic & AI</span>
            </h1>
            <p className="text-[10px] text-gray-500">Security & Quality Code Scanner</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {report && (
            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-100 text-xs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-gray-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={13} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-all ${
                  activeTab === 'files'
                    ? 'bg-white text-gray-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <FileCode size={13} />
                Files & Findings ({unifiedIssues.length})
              </button>
            </div>
          )}

          {report && (
            <button
              onClick={downloadMarkdownReport}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border border-gray-200/80 shadow-2xs"
              title="Export Full Audit Report to Markdown"
            >
              <Download size={13} />
              Export Report
            </button>
          )}

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle size={14} />
            Scan New ZIP
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Pane */}
        <aside className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
          {/* File Trees Section if report exists */}
          {report ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ZIP Workspace</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 font-mono text-gray-500">
                    {report.summary.fileName}
                  </span>
                </div>
                {/* Search / Filter query bar */}
                <div className="relative mt-2">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search findings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Recursive File Hierarchy tree */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <FileTree
                  tree={report.tree}
                  onSelectFile={(path) => {
                    setSelectedFilePath(path);
                    setActiveTab('files');
                  }}
                  selectedPath={selectedFilePath}
                  issues={unifiedIssues}
                />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-400 flex flex-col items-center justify-center flex-1 space-y-3">
              <Upload size={36} className="text-gray-300 stroke-1" />
              <p>No active workspace loaded.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-bold rounded-md transition-colors"
              >
                Upload & Scrape Now
              </button>
            </div>
          )}

          {/* Past Audits list pinned at the bottom */}
          <div className="border-t border-gray-100 p-4 bg-gray-50/50">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <History size={12} />
              Recent Scans ({historicalSummaries.length})
            </div>
            
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {historicalSummaries.length === 0 ? (
                <div className="text-[10px] text-gray-400 py-4 text-center">
                  No historical audits recorded.
                </div>
              ) : (
                historicalSummaries.map((sum) => (
                  <div
                    key={sum.id}
                    onClick={() => loadReport(sum.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all space-y-1 ${
                      report?.summary.id === sum.id
                        ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-gray-700 truncate max-w-[120px]">{sum.fileName}</span>
                      <span className="text-[9px] text-gray-400">{new Date(sum.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-gray-400">
                      <span>{sum.fileCount} files</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        {sum.issuesCount.security}
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        {sum.issuesCount.quality}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Primary View Workspace */}
        <main className="flex-1 bg-gray-50/30 p-6 overflow-y-auto flex flex-col">
          {report ? (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Category Filter Toggle bar */}
              <div className="bg-white px-4 py-2 border border-gray-100 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex gap-1">
                  {(['all', 'security', 'quality', 'refactor'] as const).map((cat) => {
                    let btnClass = 'text-gray-500 hover:text-gray-900';
                    let label = cat.charAt(0).toUpperCase() + cat.slice(1);
                    if (cat === 'all') label = 'All Categories';

                    if (activeCategoryFilter === cat) {
                      if (cat === 'security') btnClass = 'bg-rose-50 text-rose-700 font-bold border-rose-100';
                      else if (cat === 'quality') btnClass = 'bg-amber-50 text-amber-700 font-bold border-amber-100';
                      else if (cat === 'refactor') btnClass = 'bg-blue-50 text-blue-700 font-bold border-blue-100';
                      else btnClass = 'bg-gray-100 text-gray-800 font-bold border-gray-200';
                    }

                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={`px-3 py-1 text-xs rounded-lg border border-transparent transition-all ${btnClass}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1">
                  <BookOpen size={12} className="text-blue-500" />
                  Showing {filteredGlobalIssues.length} issues total
                </div>
              </div>

              {activeTab === 'dashboard' ? (
                /* Report summary screen */
                <ReportDashboard
                  report={report}
                  onSelectCategory={(cat) => {
                    setActiveCategoryFilter(cat);
                    setActiveTab('files');
                  }}
                  onSelectIssue={handleSelectIssueFromDashboard}
                  activeCategory={activeCategoryFilter}
                />
              ) : (
                /* Files & Code findings detail screen */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                  {/* File code preview box */}
                  <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 p-5 flex flex-col min-h-[480px]">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-3">
                      <div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono font-bold uppercase">
                          {selectedFile?.language || 'Code File'}
                        </span>
                        <h2 className="text-xs font-mono font-bold text-gray-800 mt-1 break-all">
                          {selectedFilePath}
                        </h2>
                      </div>
                    </div>

                    {selectedFile ? (
                      <div className="flex-1 font-mono text-xs rounded-lg border border-gray-150 overflow-auto bg-slate-950 text-slate-100 p-4 max-h-[600px] whitespace-pre select-text text-left">
                        {selectedFile.content.split('\n').map((lineText, idx) => {
                          const lineNum = idx + 1;
                          // Check if an issue matches this line
                          const lineIssue = filteredIssuesForSelectedFile.find((i) => i.line === lineNum);
                          let highlightClass = '';
                          if (lineIssue) {
                            highlightClass =
                              lineIssue.severity === 'critical'
                                ? 'bg-rose-500/20 border-l-4 border-rose-500 text-rose-100'
                                : 'bg-amber-500/10 border-l-4 border-amber-500 text-amber-100';
                          }

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (lineIssue) setSelectedIssueId(lineIssue.id);
                              }}
                              className={`py-0.5 px-2 hover:bg-slate-800/50 flex gap-4 transition-colors ${
                                lineIssue ? 'cursor-pointer' : ''
                              } ${highlightClass}`}
                            >
                              <span className="text-[10px] select-none text-slate-500 w-6 text-right shrink-0">
                                {lineNum}
                              </span>
                              <span className="break-all">{lineText}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-xs text-gray-400">
                        Please select a code file from the workspace explorer hierarchy.
                      </div>
                    )}
                  </div>

                  {/* Findings detail right column list */}
                  <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-1">
                    {/* Advanced Metrics Visualization Panel */}
                    <MetricsChart metrics={selectedFile?.metrics || null} />

                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider text-left">
                      Detailed Findings in Selected File ({filteredIssuesForSelectedFile.length})
                    </h3>

                    {filteredIssuesForSelectedFile.length === 0 ? (
                      <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-xs text-gray-400">
                        No findings matching current filters found in this file.
                      </div>
                    ) : (
                      filteredIssuesForSelectedFile.map((issue) => {
                        const isExpanded = selectedIssueId === issue.id;

                        let severityBadge = 'bg-rose-100 text-rose-700';
                        if (issue.severity === 'warning') severityBadge = 'bg-amber-100 text-amber-700';
                        else if (issue.severity === 'info') severityBadge = 'bg-blue-100 text-blue-700';

                        let categoryIcon = <Lightbulb size={13} className="text-blue-500" />;
                        if (issue.category === 'security') {
                          categoryIcon = <ShieldAlert size={13} className="text-rose-600" />;
                        } else if (issue.category === 'quality') {
                          categoryIcon = <AlertTriangle size={13} className="text-amber-500" />;
                        }

                        return (
                          <div
                            key={issue.id}
                            id={`issue-${issue.id}`}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className={`bg-white border rounded-xl p-4 cursor-pointer text-left transition-all ${
                              isExpanded
                                ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                                : 'border-gray-150 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {categoryIcon}
                                {issue.category}
                              </span>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${severityBadge}`}>
                                {issue.severity}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-gray-900">
                              Line {issue.line}: {issue.title}
                            </h4>

                            <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                              {issue.description}
                            </p>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                <div>
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Trigger Snippet</span>
                                  <pre className="mt-1 bg-gray-50 text-[10px] p-2 rounded-lg font-mono text-gray-700 border border-gray-100 overflow-x-auto">
                                    {issue.snippet}
                                  </pre>
                                </div>

                                {issue.suggestion && (
                                  <div>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Remediation Suggestion</span>
                                    <p className="text-[11px] text-gray-700 mt-1 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/60 leading-relaxed">
                                      {issue.suggestion}
                                    </p>
                                  </div>
                                )}

                                {issue.diff && (
                                  <div className="pt-1">
                                    <DiffViewer diffText={issue.diff} />
                                  </div>
                                )}

                                {/* Live interactive AI assistant chat session for this issue */}
                                <div onClick={(e) => e.stopPropagation()}>
                                  <AiRemediationChat issue={issue} />
                                </div>
                              </div>
                            )}

                            {!isExpanded && (
                              <div className="mt-2 text-[10px] text-blue-500 font-semibold flex items-center gap-0.5 justify-end">
                                Expand remediation patch <ChevronRight size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Intro / empty landing screen asking to upload code ZIP */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-5 my-12">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs">
                <Code size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Welcome to Code Auditor
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Analyze your project repositories for potential OWASP security leaks, hardcoded credentials, code smells, cyclomatic complexity, and dead code instantly. Uses localized static heuristic checks combined with an advanced Gemini Review Engine.
              </p>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Upload size={14} />
                Audit code from ZIP folder
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Upload Dialog Drawer Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-gray-100 shadow-xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <div className="p-6 overflow-y-auto">
              <UploadSection onAnalysisCompleted={handleAnalysisCompleted} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
