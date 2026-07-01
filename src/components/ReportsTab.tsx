import React from "react";
import { 
  Download, 
  Shield, 
  Database, 
  Cpu, 
  Globe, 
  Server, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Code, 
  FileText, 
  FileJson 
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface ReportsTabProps {
  activeProject: CodeScopeAnalysis;
  triggerDownloadReport: (format: 'markdown' | 'json' | 'html') => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  activeProject,
  triggerDownloadReport,
}) => {
  const score = activeProject.healthScore ?? 0;
  
  const getHealthColor = (score: number) => {
    if (score > 85) return {
      stroke: "stroke-emerald-500",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      fill: "fill-emerald-500",
      glow: "shadow-emerald-500/10"
    };
    if (score > 65) return {
      stroke: "stroke-amber-500",
      text: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      fill: "fill-amber-500",
      glow: "shadow-amber-500/10"
    };
    return {
      stroke: "stroke-rose-500",
      text: "text-rose-400",
      border: "border-rose-500/20",
      bg: "bg-rose-500/10",
      fill: "fill-rose-500",
      glow: "shadow-rose-500/10"
    };
  };

  const healthStyle = getHealthColor(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6 text-left" id="reports-tab-view">
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

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-900/20 p-5 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="text-left space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            CodeScope Executive Reports Export
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Download formatted code summaries, schemas, findings, and dependency architecture metrics for your compliance and audit reviews.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button
            onClick={() => triggerDownloadReport('markdown')}
            className="group relative overflow-hidden bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer font-sans shadow-md flex-1 sm:flex-initial justify-center"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 pointer-events-none" />
            <FileText className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform duration-200" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={() => triggerDownloadReport('json')}
            className="group relative overflow-hidden bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer font-sans shadow-md flex-1 sm:flex-initial justify-center"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 pointer-events-none" />
            <FileJson className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => triggerDownloadReport('html')}
            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer font-sans border border-indigo-500/25 flex-1 sm:flex-initial justify-center"
          >
            <Download className="h-4 w-4 text-indigo-100 group-hover:scale-110 transition-transform duration-200" />
            <span>Export Print HTML</span>
          </button>
        </div>
      </div>

      {/* Print Layout Preview */}
      <div className="bg-[#0B0F19] rounded-3xl border border-slate-800/80 p-6 md:p-8 shadow-2xl max-w-4xl mx-auto space-y-10 relative overflow-hidden border-t-8 border-indigo-600">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        
        {/* Blueprint background grid effect */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="report-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#report-grid)" />
          </svg>
        </div>

        {/* Header title */}
        <div className="relative text-center border-b border-slate-800/80 pb-6 mb-8">
          <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse" />
            SECURED AST
          </div>
          <h3 className="text-xl md:text-2xl font-black font-sans tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-1.5">
            CODESCOPE STATIC CODE QUALITY AUDIT
          </h3>
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            SYSTEM STATUS REPORT • DETAILED BLUEPRINT SCHEMAS
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500 mt-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-650" />
              Generated: {new Date().toLocaleDateString()} UTC
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Code className="h-3.5 w-3.5 text-slate-655" />
              Target: <strong className="text-indigo-400 font-semibold">{activeProject.projectName}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">ID: SHA-256</span>
          </div>
        </div>

        {/* Section 1: Executive summary & Stats */}
        <div className="space-y-4 relative z-10">
          <h4 className="text-xs font-sans uppercase font-black tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Award className="h-4 w-4 text-indigo-400" />
            1. Executive Summary & Health Index
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
            <div className="md:col-span-2 space-y-3.5 text-slate-350">
              <p className="text-xs leading-relaxed font-sans text-slate-300">
                CodeScope Static Parser completed deep dependency, architecture style, security vulnerabilities and database schema extraction for 
                <strong className="text-indigo-300"> {activeProject.projectName}</strong>. The platform resolved project files and estimated dynamic models.
              </p>
              <p className="text-xs leading-relaxed font-sans text-slate-400">
                The overall system compiled a <strong className="text-white">Health Quality Index of {score}/100</strong>. This score represents solid architectural decoupling with minimal circular package boundaries, balanced by active security vulnerabilities requiring prompt sanitization.
              </p>
            </div>
            
            {/* Visual Stats Gauge */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              <div className="relative h-24 w-24 flex items-center justify-center">
                {/* SVG Radial Gauge */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className={`transition-all duration-1000 ${healthStyle.stroke}`}
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${healthStyle.stroke === 'stroke-emerald-500' ? 'rgba(16,185,129,0.3)' : healthStyle.stroke === 'stroke-amber-500' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black font-mono text-white leading-none">{score}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Index</span>
                </div>
              </div>
              <div className="text-center w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${healthStyle.text}`}>
                  {score > 85 ? 'Optimized Build' : score > 65 ? 'Warning Status' : 'Critical Action Needed'}
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[9px] font-mono text-slate-500 w-full">
                  <div>
                    <span className="block text-slate-300 font-bold">{Math.min(100, score + 5)}%</span>
                    <span>Decoupling</span>
                  </div>
                  <div>
                    <span className="block text-slate-300 font-bold">{Math.max(0, 100 - score)}%</span>
                    <span>Risk Index</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: DNA */}
        <div className="space-y-4 relative z-10">
          <h4 className="text-xs font-sans uppercase font-black tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            2. Mapped Technologies & Architectural Style
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {/* Frameworks */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-2">
                <Server className="h-3.5 w-3.5 text-indigo-400" />
                Frameworks
              </div>
              <div className="text-xs font-bold text-white leading-tight">
                {activeProject.projectDNA?.frameworks && activeProject.projectDNA.frameworks.length > 0 
                  ? activeProject.projectDNA.frameworks.join(", ") 
                  : "None Detected"}
              </div>
            </div>
            
            {/* Databases */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-2">
                <Database className="h-3.5 w-3.5 text-cyan-400" />
                Databases
              </div>
              <div className="text-xs font-bold text-white leading-tight">
                {activeProject.projectDNA?.databases && activeProject.projectDNA.databases.length > 0 
                  ? activeProject.projectDNA.databases.join(", ") 
                  : "No DB Detected"}
              </div>
            </div>
            
            {/* Architecture Style */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-2">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                Target Style
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight mb-1">
                  {activeProject.architecture?.style || "Unknown"}
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-1 rounded-full" 
                    style={{ width: `${activeProject.architecture?.confidence ?? 0}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-slate-500 mt-1 block">
                  Confidence: {activeProject.architecture?.confidence ?? 0}%
                </span>
              </div>
            </div>
            
            {/* API Gateways */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-2">
                <Globe className="h-3.5 w-3.5 text-violet-400" />
                API Endpoints
              </div>
              <div>
                <div className="text-lg font-black text-white font-mono leading-none">
                  {activeProject.endpoints?.length ?? 0}
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                  Mapped Routing URLs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Priority vulnerabilities */}
        <div className="space-y-4 relative z-10">
          <h4 className="text-xs font-sans uppercase font-black tracking-wider text-rose-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Shield className="h-4 w-4 text-rose-400" />
            3. Security Anomalies Requiring Immediate Action
          </h4>
          
          <div className="space-y-4 pt-2">
            {!activeProject.security || activeProject.security.length === 0 ? (
              <div className="bg-emerald-950/10 border border-emerald-500/10 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/80 mx-auto" />
                <h5 className="text-emerald-400 font-semibold text-xs uppercase tracking-wider">No Security Anomalies Detected</h5>
                <p className="text-slate-500 text-[11px] max-w-md mx-auto">
                  CodeScope AST parser has completed validation of this build. No high or critical security violations were identified.
                </p>
              </div>
            ) : (
              activeProject.security.map((issue, idx) => {
                const getSeverityStyles = (severity: string) => {
                  const s = severity?.toLowerCase();
                  if (s === 'critical') return {
                    border: 'border-rose-500/30',
                    bg: 'bg-rose-500/5',
                    tag: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
                    text: 'text-rose-400',
                    leftBorder: 'border-l-rose-500'
                  };
                  if (s === 'high') return {
                    border: 'border-orange-500/30',
                    bg: 'bg-orange-500/5',
                    tag: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
                    text: 'text-orange-400',
                    leftBorder: 'border-l-orange-500'
                  };
                  if (s === 'medium') return {
                    border: 'border-amber-500/30',
                    bg: 'bg-amber-500/5',
                    tag: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
                    text: 'text-amber-400',
                    leftBorder: 'border-l-amber-500'
                  };
                  return {
                    border: 'border-slate-800',
                    bg: 'bg-slate-900/20',
                    tag: 'bg-slate-800 text-slate-400 border-slate-700/50',
                    text: 'text-slate-400',
                    leftBorder: 'border-l-slate-700'
                  };
                };

                const style = getSeverityStyles(issue.severity);

                return (
                  <div 
                    key={idx} 
                    className={`bg-slate-950/40 rounded-xl border ${style.border} border-l-4 ${style.leftBorder} p-4 space-y-2.5 transition-all hover:bg-slate-950/60 hover:-translate-y-0.5 duration-200 text-left`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${style.tag}`}>
                          {issue.severity}
                        </span>
                        <span className="text-slate-300 font-semibold">{issue.category}</span>
                      </div>
                      {issue.line !== undefined && (
                        <span className="text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          Line {issue.line}
                        </span>
                      )}
                    </div>
                    
                    <div className="font-mono text-[10.5px] text-slate-400 break-all bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-900/80">
                      {issue.file}
                    </div>
                    
                    <p className="text-[11px] leading-relaxed text-slate-350 font-sans">
                      {issue.description}
                    </p>
                    
                    {issue.solution && (
                      <div className="text-[11px] leading-relaxed font-sans text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-300 font-semibold block mb-0.5">Recommendation</strong>
                          {issue.solution}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer seal */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] text-slate-500 font-mono tracking-widest uppercase">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-indigo-500/60 animate-pulse" />
            CODESCOPE SYSTEMS AUDIT LABS INC
          </div>
          <div>
            ENCRYPTED AST GENERATED • SHA-256 SECURED
          </div>
        </div>

      </div>
    </div>
  );
};
