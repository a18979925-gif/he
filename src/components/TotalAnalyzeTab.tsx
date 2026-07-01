import React, { useState, useEffect } from 'react';
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
import FileTree from './FileTree';
import ReportDashboard from './ReportDashboard';
import UploadSection from './UploadSection';
import DiffViewer from './DiffViewer';
import AiRemediationChat from './AiRemediationChat';
import MetricsChart from './MetricsChart';
import { AnalysisReport, AnalysisSummary, AuditIssue } from '../types';

export default function TotalAnalyzeTab() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [historicalSummaries, setHistoricalSummaries] = useState<AnalysisSummary[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'files'>('dashboard');
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
        setActiveSubTab('dashboard');
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
    setActiveSubTab('dashboard');
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
    setActiveSubTab('files');
    // Align category filter so the selected issue isn't hidden
    setActiveCategoryFilter('all');
  };

  return (
    <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-800 text-slate-100 shadow-xl overflow-hidden min-h-[680px]">
      {/* Premium UI Polish Status Header */}
      <div className="flex justify-between items-center bg-slate-900/35 border border-slate-800/80 px-4 py-2.5 rounded-xl mb-4 hover:scale-[1.002] transition-transform duration-300">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-sans">Module: AST-Inferred Source Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] bg-slate-950 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-850 select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Oracle Connected
        </div>
      </div>

      {/* Upper Navigation Tab Header */}
      <header className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            Total Analyze <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-400 font-extrabold uppercase border border-indigo-500/30">Stronger AI Scanner</span>
          </h1>
          <p className="text-[10px] text-slate-400">Deep Heuristics & Google Gemini Review Auditor</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {report && (
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-805 text-xs">
              <button
                onClick={() => setActiveSubTab('dashboard')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'dashboard'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid size={13} />
                Overview
              </button>
              <button
                onClick={() => setActiveSubTab('files')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'files'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode size={13} />
                Files & Findings ({unifiedIssues.length})
              </button>
            </div>
          )}

          <div className="flex gap-2 shrink-0">
            {report && (
              <button
                onClick={downloadMarkdownReport}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border border-slate-800 shadow-sm"
                title="Export Full Audit Report to Markdown"
              >
                <Download size={13} />
                Export
              </button>
            )}

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md active:scale-98"
            >
              <PlusCircle size={14} />
              Scan ZIP
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[580px]">
        {/* Left Sidebar Pane */}
        <aside className="w-full lg:w-72 bg-slate-950/40 border-r border-slate-850 flex flex-col shrink-0">
          {/* File Trees Section if report exists */}
          {report ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-slate-850">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">ZIP Workspace</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 font-mono text-slate-400 border border-slate-800">
                    {report.summary.fileName}
                  </span>
                </div>
                {/* Search / Filter query bar */}
                <div className="relative mt-2">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search findings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-950 font-sans"
                  />
                </div>
              </div>

              {/* Recursive File Hierarchy tree */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[300px] lg:max-h-none">
                <FileTree
                  tree={report.tree}
                  onSelectFile={(path) => {
                    setSelectedFilePath(path);
                    setActiveSubTab('files');
                  }}
                  selectedPath={selectedFilePath}
                  issues={unifiedIssues}
                />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center flex-1 space-y-3 py-12">
              <Upload size={36} className="text-slate-700 stroke-1" />
              <p className="font-sans">No active workspace loaded.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white text-[11px] font-bold rounded-md transition-colors"
              >
                Upload & Scrape Now
              </button>
            </div>
          )}

          {/* Past Audits list pinned at the bottom */}
          <div className="border-t border-slate-850 p-4 bg-slate-950/20">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
              <History size={12} />
              Recent Scans ({historicalSummaries.length})
            </div>
            
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {historicalSummaries.length === 0 ? (
                <div className="text-[10px] text-slate-650 py-4 text-center font-sans">
                  No historical audits recorded.
                </div>
              ) : (
                historicalSummaries.map((sum) => (
                  <div
                    key={sum.id}
                    onClick={() => loadReport(sum.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all space-y-1.5 ${
                      report?.summary.id === sum.id
                        ? 'bg-slate-900 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-300 truncate max-w-[120px] font-sans">{sum.fileName}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{new Date(sum.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>{sum.fileCount} files</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
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
        <main className="flex-1 bg-slate-900/20 p-6 overflow-y-auto flex flex-col min-w-0">
          {report ? (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Category Filter Toggle bar */}
              <div className="bg-slate-950 px-4 py-2 border border-slate-855 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'security', 'quality', 'refactor'] as const).map((cat) => {
                    let btnClass = 'text-slate-400 hover:text-white border-transparent';
                    let label = cat.charAt(0).toUpperCase() + cat.slice(1);
                    if (cat === 'all') label = 'All Categories';

                    if (activeCategoryFilter === cat) {
                      if (cat === 'security') btnClass = 'bg-rose-950/40 text-rose-450 font-bold border-rose-900/50 shadow-inner';
                      else if (cat === 'quality') btnClass = 'bg-amber-950/40 text-amber-450 font-bold border-amber-900/50 shadow-inner';
                      else if (cat === 'refactor') btnClass = 'bg-indigo-950/40 text-indigo-400 font-bold border-indigo-900/50 shadow-inner';
                      else btnClass = 'bg-slate-800 text-white font-bold border-slate-700 shadow-inner';
                    }

                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-all cursor-pointer ${btnClass}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5 font-mono">
                  <BookOpen size={12} className="text-indigo-400" />
                  {filteredGlobalIssues.length} issues matching filters
                </div>
              </div>

              {activeSubTab === 'dashboard' ? (
                /* Report summary screen */
                <ReportDashboard
                  report={report}
                  onSelectCategory={(cat) => {
                    setActiveCategoryFilter(cat);
                    setActiveSubTab('files');
                  }}
                  onSelectIssue={handleSelectIssueFromDashboard}
                  activeCategory={activeCategoryFilter}
                />
              ) : (
                /* Files & Code findings detail screen */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                  {/* File code preview box */}
                  <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-850 p-5 flex flex-col min-h-[480px]">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-3 shrink-0">
                      <div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900/40 font-mono font-bold uppercase">
                          {selectedFile?.language || 'Code File'}
                        </span>
                        <h2 className="text-xs font-mono font-bold text-slate-200 mt-1.5 break-all">
                          {selectedFilePath}
                        </h2>
                      </div>
                    </div>

                    {selectedFile ? (
                      <div className="flex-1 font-mono text-xs rounded-lg border border-slate-800 overflow-auto bg-slate-950 text-slate-100 p-4 max-h-[600px] whitespace-pre select-text text-left">
                        {selectedFile.content.split('\n').map((lineText, idx) => {
                          const lineNum = idx + 1;
                          const lineIssue = filteredIssuesForSelectedFile.find((i) => i.line === lineNum);
                          let highlightClass = '';
                          if (lineIssue) {
                            highlightClass =
                              lineIssue.severity === 'critical'
                                ? 'bg-rose-950/40 border-l-4 border-rose-500 text-rose-200 font-semibold'
                                : 'bg-amber-950/20 border-l-4 border-amber-500 text-amber-200 font-semibold';
                          }

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (lineIssue) setSelectedIssueId(lineIssue.id);
                              }}
                              className={`py-0.5 px-2 hover:bg-slate-900/60 flex gap-4 transition-colors ${
                                lineIssue ? 'cursor-pointer' : ''
                              } ${highlightClass}`}
                            >
                              <span className="text-[10px] select-none text-slate-650 w-6 text-right shrink-0 font-mono">
                                {lineNum}
                              </span>
                              <span className="break-all font-mono">{lineText}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-500 py-12">
                        Please select a code file from the workspace explorer hierarchy.
                      </div>
                    )}
                  </div>

                  {/* Findings detail right column list */}
                  <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-1">
                    {/* Advanced Metrics Visualization Panel */}
                    <MetricsChart metrics={selectedFile?.metrics || null} />

                    <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider text-left font-mono">
                      Detailed Findings ({filteredIssuesForSelectedFile.length})
                    </h3>

                    {filteredIssuesForSelectedFile.length === 0 ? (
                      <div className="bg-slate-950/40 p-8 rounded-xl border border-slate-850 text-center text-xs text-slate-500 font-sans">
                        No findings matching current filters found in this file.
                      </div>
                    ) : (
                      filteredIssuesForSelectedFile.map((issue) => {
                        const isExpanded = selectedIssueId === issue.id;

                        let severityBadge = 'bg-rose-950/30 text-rose-450 border-rose-900/40';
                        if (issue.severity === 'warning') severityBadge = 'bg-amber-950/30 text-amber-455 border-amber-905/40';
                        else if (issue.severity === 'info') severityBadge = 'bg-indigo-950/30 text-indigo-400 border-indigo-900/40';

                        let categoryIcon = <Lightbulb size={13} className="text-indigo-400" />;
                        if (issue.category === 'security') {
                          categoryIcon = <ShieldAlert size={13} className="text-rose-500" />;
                        } else if (issue.category === 'quality') {
                          categoryIcon = <AlertTriangle size={13} className="text-amber-500" />;
                        }

                        return (
                          <div
                            key={issue.id}
                            id={`issue-${issue.id}`}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className={`bg-slate-950/70 border rounded-xl p-4 cursor-pointer text-left transition-all ${
                              isExpanded
                                ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20 bg-slate-950'
                                : 'border-slate-850 hover:bg-slate-900/30'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                {categoryIcon}
                                {issue.category}
                              </span>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${severityBadge} font-mono`}>
                                {issue.severity}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-200">
                              Line {issue.line}: {issue.title}
                            </h4>

                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                              {issue.description}
                            </p>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-slate-855 space-y-3">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Trigger Snippet</span>
                                  <pre className="mt-1.5 bg-slate-950 text-[10px] p-2 rounded-lg font-mono text-slate-300 border border-slate-800 overflow-x-auto">
                                    {issue.snippet}
                                  </pre>
                                </div>

                                {issue.suggestion && (
                                  <div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Remediation Suggestion</span>
                                    <p className="text-[11px] text-slate-350 mt-1.5 bg-amber-950/10 p-2.5 rounded-lg border border-amber-900/30 leading-relaxed font-sans">
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
                                <div onClick={(e) => e.stopPropagation()} className="pt-2">
                                  <AiRemediationChat issue={issue} />
                                </div>
                              </div>
                            )}

                            {!isExpanded && (
                              <div className="mt-3.5 text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5 justify-end font-sans">
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-5 my-12 py-16">
              <div className="w-16 h-16 bg-indigo-950 text-indigo-400 rounded-2xl flex items-center justify-center shadow-md border border-indigo-900/40">
                <Code size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight font-sans">
                Welcome to Total Analyze
              </h2>
              <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-md">
                Analyze your project repositories for potential OWASP security leaks, hardcoded credentials, code smells, cyclomatic complexity, and dead code instantly. Uses localized static heuristic checks combined with an advanced Gemini Review Engine.
              </p>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-3xl w-full border border-slate-800 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-full transition-colors cursor-pointer"
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
