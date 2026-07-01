import React from "react";
import { Search, CheckCircle, Copy, X, Terminal, FileCode, ShieldAlert } from "lucide-react";
import { CodeScopeAnalysis, SecurityIssue } from "../types";
import { FileTree } from "./files/FileTree";
import { CodeViewer } from "./files/CodeViewer";
import { SecurityPanel } from "./files/SecurityPanel";
import { DiffViewer } from "./files/DiffViewer";
import { MOCK_FILES, getFallbackContent } from "../data/mockFiles";

interface FilesTabProps {
  activeProject: CodeScopeAnalysis;
  projectSource: 'sample' | 'uploaded';
  uploadedZipFiles: Array<{ name: string; size: number; content?: string }>;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  fileSearchQuery: string;
  setFileSearchQuery: (query: string) => void;
  codeSearchQuery: string;
  setCodeSearchQuery: (query: string) => void;
  appliedSecurityFixes: Record<string, boolean>;
  setAppliedSecurityFixes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  diffViewActive: Record<string, boolean>;
  setDiffViewActive: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  copyFeedback: string | null;
  copyTextToClipboard: (text: string, label: string) => void;
  sampleCodeOverrides?: Record<string, string>;
  activeFixIssue?: any;
  setActiveFixIssue?: (issue: any) => void;
  onFixIssue?: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
  onSaveFile?: (filePath: string, content: string) => Promise<void>;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  activeProject,
  projectSource,
  uploadedZipFiles,
  selectedFile,
  setSelectedFile,
  fileSearchQuery,
  setFileSearchQuery,
  codeSearchQuery,
  setCodeSearchQuery,
  appliedSecurityFixes,
  setAppliedSecurityFixes,
  diffViewActive,
  setDiffViewActive,
  copyFeedback,
  copyTextToClipboard,
  sampleCodeOverrides,
  activeFixIssue,
  setActiveFixIssue,
  onFixIssue,
  onSaveFile,
}) => {
  const getSecurityIssueForFile = (filepath: string): SecurityIssue | null => {
    if (!filepath || !activeProject?.security) return null;
    const lowerFile = filepath.toLowerCase().replace(/\\/g, '/');
    return activeProject.security.find(issue => {
      const issueFile = issue.file.toLowerCase().replace(/\\/g, '/');
      return lowerFile.endsWith(issueFile) || issueFile.endsWith(lowerFile);
    }) || null;
  };

  const getFileContent = (filepath: string): string => {
    if (sampleCodeOverrides && sampleCodeOverrides[filepath]) {
      return sampleCodeOverrides[filepath];
    }

    if (projectSource === 'uploaded' && uploadedZipFiles.length > 0) {
      const match = uploadedZipFiles.find(f => f.name === filepath);
      if (match && match.content) return match.content;
    }

    const matchKey = Object.keys(MOCK_FILES).find(
      key => filepath === key || filepath.endsWith("/" + key) || filepath.endsWith("\\" + key)
    );
    if (matchKey) {
      return MOCK_FILES[matchKey];
    }

    return getFallbackContent(filepath);
  };

  const countMatches = React.useCallback((text: string, highlight: string): number => {
    if (!highlight.trim()) return 0;
    try {
      const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = text.match(new RegExp(escaped, "gi"));
      return matches ? matches.length : 0;
    } catch (e) {
      return 0;
    }
  }, []);

  const currentFileIssue = activeFixIssue || (selectedFile ? getSecurityIssueForFile(selectedFile) : null);
  const isFixApplied = selectedFile ? (appliedSecurityFixes[selectedFile] || false) : false;
  const isDiffActive = selectedFile ? (diffViewActive[selectedFile] || false) : false;

  const originalContent = React.useMemo(() => {
    return selectedFile ? getFileContent(selectedFile) : "";
  }, [selectedFile, sampleCodeOverrides, projectSource, uploadedZipFiles]);

  const securedContent = React.useMemo(() => {
    if (currentFileIssue && currentFileIssue.oldCode && currentFileIssue.newCode) {
      return originalContent.replace(currentFileIssue.oldCode, currentFileIssue.newCode);
    }
    return originalContent;
  }, [originalContent, currentFileIssue]);

  const fileContentToDisplay = isFixApplied ? securedContent : originalContent;

  const getFileName = (filepath: string) => {
    if (!filepath) return "";
    return filepath.substring(filepath.lastIndexOf("/") + 1).substring(filepath.lastIndexOf("\\") + 1);
  };

  const renderBreadcrumbs = (filepath: string) => {
    if (!filepath) return null;
    const parts = filepath.split(/[/\\]/);
    return (
      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono select-none px-4 py-1.5 bg-slate-950/20 border-b border-slate-900 overflow-x-auto whitespace-nowrap scrollbar-none">
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

        <span className="hover:text-slate-400 transition-colors">workspace</span>
        {parts.map((part, idx) => {
          const isLast = idx === parts.length - 1;
          return (
            <React.Fragment key={idx}>
              <span className="text-slate-700">/</span>
              <span className={isLast ? "text-indigo-400 font-semibold" : "text-slate-450 hover:text-slate-350 transition-colors"}>
                {part}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left" id="files-tab-view">
      {/* Premium Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-100 bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
          Workspace Explorer & Code Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          State-of-the-art interactive coding workspace to audit, patch, and analyze source file syntax trees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side Workspace tree */}
        <FileTree
          activeProject={activeProject}
          projectSource={projectSource}
          uploadedZipFiles={uploadedZipFiles}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          fileSearchQuery={fileSearchQuery}
          setFileSearchQuery={setFileSearchQuery}
          appliedSecurityFixes={appliedSecurityFixes}
        />

        {/* Right Side Source Code Viewer */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 lg:col-span-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-sm h-[525px] relative">
          
          {/* Editor Container Header */}
          <div className="bg-slate-900 border-b border-slate-800/90 h-11 flex items-center justify-between text-white shrink-0 select-none">
            {/* macOS Style Window Controls & Tabs */}
            <div className="flex items-center gap-3 pl-3 h-full">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dfa224]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]"></span>
              </div>
              
              <span className="h-4 w-[1px] bg-slate-800"></span>

              {/* Active Tab */}
              {selectedFile ? (
                <div className="bg-slate-950/80 border-t-2 border-t-indigo-500 border-r border-slate-850 h-full px-4 flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="truncate max-w-[130px] font-mono" title={selectedFile}>
                    {getFileName(selectedFile)}
                  </span>
                  <button 
                    onClick={() => setSelectedFile("")}
                    className="hover:bg-slate-800 text-slate-500 hover:text-slate-350 p-0.5 rounded transition-all cursor-pointer"
                    title="Close file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-full px-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>No active file</span>
                </div>
              )}
            </div>

            {/* Header Right Actions */}
            {selectedFile && (
              <div className="pr-3">
                <button
                  onClick={() => copyTextToClipboard(fileContentToDisplay, "Code copied")}
                  className="hover:bg-slate-805 hover:text-emerald-450 hover:border-slate-700 text-slate-400 text-xs flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 transition-all cursor-pointer font-sans font-medium"
                >
                  {copyFeedback === "Code copied" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copy Code
                </button>
              </div>
            )}
          </div>

          {/* Breadcrumbs */}
          {selectedFile && renderBreadcrumbs(selectedFile)}

          {/* Inline Find & Highlight Bar */}
          {selectedFile && (
            <div className="bg-slate-950/40 border-b border-slate-900/60 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shrink-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Find/highlight matching symbols..."
                  value={codeSearchQuery}
                  onChange={(e) => setCodeSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 pl-8.5 pr-8 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500/60 transition-all font-sans"
                />
                {codeSearchQuery && (
                  <button
                    onClick={() => setCodeSearchQuery("")}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 w-4 h-4 rounded-full flex items-center justify-center font-bold cursor-pointer"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="text-slate-500 text-[10px] font-mono shrink-0 flex items-center gap-3">
                {codeSearchQuery ? (
                  <span className="bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/20 font-semibold">
                    {countMatches(fileContentToDisplay, codeSearchQuery)} matches
                  </span>
                ) : (
                  <span className="text-slate-600 italic font-sans">Type keyword to highlight lines</span>
                )}
                <span>LOC: {fileContentToDisplay.split("\n").length}</span>
              </div>
            </div>
          )}

          {/* Security Banner Panel */}
          <SecurityPanel
            selectedFile={selectedFile}
            currentFileIssue={currentFileIssue}
            isFixApplied={isFixApplied}
            isDiffActive={isDiffActive}
            setAppliedSecurityFixes={setAppliedSecurityFixes}
            setDiffViewActive={setDiffViewActive}
          />

          {/* Code editor body or Diff View */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {isDiffActive && currentFileIssue ? (
              <DiffViewer
                originalContent={originalContent}
                securedContent={securedContent}
                currentFileIssue={currentFileIssue}
                codeSearchQuery={codeSearchQuery}
              />
            ) : (
              <CodeViewer
                selectedFile={selectedFile}
                fileContentToDisplay={fileContentToDisplay}
                codeSearchQuery={codeSearchQuery}
                currentFileIssue={currentFileIssue}
                isFixApplied={isFixApplied}
                onFixIssue={onFixIssue}
                setActiveFixIssue={setActiveFixIssue}
                onSaveFile={onSaveFile}
              />
            )}
          </div>

          {/* Status Bar */}
          <div className="bg-slate-900 border-t border-slate-800/90 h-8 px-4 flex items-center justify-between text-[10px] font-sans text-slate-500 shrink-0 select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]"></span>
                main
              </span>
              <span className="hidden sm:inline">UTF-8</span>
              <span className="hidden sm:inline">
                {selectedFile 
                  ? (selectedFile.endsWith('.java') 
                    ? 'Java' 
                    : selectedFile.endsWith('.php') 
                      ? 'PHP' 
                      : selectedFile.endsWith('.ts') || selectedFile.endsWith('.tsx') 
                        ? 'TypeScript' 
                        : 'JSON') 
                  : 'Plain Text'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {selectedFile && (
                <>
                  <span>Lines: {fileContentToDisplay.split("\n").length}</span>
                  <span className="h-3.5 w-[1px] bg-slate-800"></span>
                  {currentFileIssue ? (
                    isFixApplied ? (
                      <span className="text-emerald-450 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        Remediated
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                        Vulnerable
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-slate-500" />
                      Clean
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
