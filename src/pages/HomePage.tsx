import React from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { SettingsDrawer } from "../components/layout/SettingsDrawer";

// Tabs
import { DashboardTab } from "../components/DashboardTab";
import { ArchitectureTab } from "../components/ArchitectureTab";
import { DependencyTab } from "../components/DependencyTab";
import { CodeHelperTab } from "../components/CodeHelperTab";
import { RuntimeTab } from "../components/RuntimeTab";
import { ApiTab } from "../components/ApiTab";
import { DatabaseTab } from "../components/DatabaseTab";
import { SqlTerminalTab } from "../components/SqlTerminalTab";
import { FilesTab } from "../components/FilesTab";
import { AnalysisTab } from "../components/AnalysisTab";
import { SecurityTab } from "../components/SecurityTab";
import { PerformanceTab } from "../components/PerformanceTab";
import { RefactorTab } from "../components/RefactorTab";
import { ReportsTab } from "../components/ReportsTab";
import { DiagnosticsTab } from "../components/DiagnosticsTab";
import { ComplianceTab } from "../components/ComplianceTab";
import { LogsStreamTab } from "../components/LogsStreamTab";
import { GitInsightsTab } from "../components/GitInsightsTab";
import { BenchmarkTab } from "../components/BenchmarkTab";
import { DeadCodeTab } from "../components/DeadCodeTab";
import { TimelineTab } from "../components/TimelineTab";

import { CodeScopeAnalysis, EndpointItem, DBTable, SecurityIssue, RefactoringSuggestion } from "../types";

interface HomePageProps {
  // App Core States
  activeProject: CodeScopeAnalysis;
  projectSource: 'sample' | 'uploaded';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveProject: (project: CodeScopeAnalysis | null) => void;
  handleZipUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  
  // Settings State
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  settingsSeverity: string;
  setSettingsSeverity: (sev: string) => void;
  settingsArchMatch: number;
  setSettingsArchMatch: (match: number) => void;

  // Tab 2 Architecture Explorer State
  selectedArchLayer: string | null;
  setSelectedArchLayer: (layer: string | null) => void;

  // Tab 3 Dependency Explorer State
  symbolSearchQuery: string;
  setSymbolSearchQuery: (query: string) => void;
  selectedDepNode: string;
  setSelectedDepNode: (node: string) => void;

  // Tab 4 Runtime Simulator State
  fetchSandboxConfig: () => Promise<void>;
  handleSandboxReset: () => Promise<void>;
  sandboxDbState: Record<string, Array<Record<string, any>>>;
  sandboxLogs: any[];
  activeSandboxTable: string;
  setActiveSandboxTable: (tbl: string) => void;
  expandedLogIndex: number | null;
  setExpandedLogIndex: (idx: number | null) => void;

  // Tab 5 API Inspector Swagger State
  selectedEndpoint: EndpointItem | null;
  setSelectedEndpoint: (ep: EndpointItem | null) => void;
  swaggerRequestBody: string;
  setSwaggerRequestBody: (body: string) => void;
  executeSwaggerTryIt: () => Promise<void>;
  isSwaggerExecuting: boolean;
  simulatedExecutionTrace: string[];
  swaggerResponse: { status: number; headers: string; body: string } | null;
  setSwaggerResponse: (res: any) => void;
  setSimulatedExecutionTrace: (t: any) => void;

  // Tab 6 Database ERD State
  selectedTable: DBTable | null;
  setSelectedTable: (table: DBTable | null) => void;

  // Tab 7 Code Explorer State
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
  uploadedZipFiles: Array<{ name: string; size: number; content?: string }>;
  sampleCodeOverrides?: Record<string, string>;

  // Tab 9 Security State
  selectedSecurityIssue: SecurityIssue | null;
  setSelectedSecurityIssue: (issue: SecurityIssue | null) => void;
  securityFixed: boolean;
  setSecurityFixed: (fixed: boolean) => void;

  // Tab 12 Executive Reports State
  triggerDownloadReport: (format: 'markdown' | 'json' | 'html') => void;

  // Tab 13 Code Helper State
  helperSubTab: string;
  setHelperSubTab: (tab: string) => void;
  selectedHelperSecurity: SecurityIssue | null;
  setSelectedHelperSecurity: (issue: SecurityIssue | null) => void;
  selectedHelperRefactor: RefactoringSuggestion | null;
  setSelectedHelperRefactor: (ref: RefactoringSuggestion | null) => void;
  helperSearchQuery: string;
  setHelperSearchQuery: (query: string) => void;
  simulatedDiffApplied: boolean;
  setSimulatedDiffApplied: (applied: boolean) => void;

  // Tab 14 SQL Terminal Playground State
  sqlQuery: string;
  setSqlQuery: (q: string) => void;
  handleExecuteSQLQuery: (queryToRun?: string) => Promise<void>;
  sqlLoading: boolean;
  sqlResults: Array<Record<string, any>> | null;
  sqlAffectedRows: number;
  sqlError: string;

  // Copy Feedback
  copyFeedback: string | null;
  copyTextToClipboard: (text: string, label: string) => void;
  onFixIssue: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
}

export const HomePage: React.FC<HomePageProps> = (props) => {
  const renderActiveTabContent = () => {
    switch (props.activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            activeProject={props.activeProject}
            projectSource={props.projectSource}
            setActiveTab={props.setActiveTab}
          />
        );
      case "architecture":
        return (
          <ArchitectureTab
            activeProject={props.activeProject}
            selectedArchLayer={props.selectedArchLayer}
            setSelectedArchLayer={props.setSelectedArchLayer}
            setSelectedFile={props.setSelectedFile}
            setActiveTab={props.setActiveTab}
          />
        );
      case "dependency":
        return (
          <DependencyTab
            activeProject={props.activeProject}
            symbolSearchQuery={props.symbolSearchQuery}
            setSymbolSearchQuery={props.setSymbolSearchQuery}
            selectedDepNode={props.selectedDepNode}
            setSelectedDepNode={props.setSelectedDepNode}
          />
        );
      case "code-helper":
        return (
          <CodeHelperTab
            activeProject={props.activeProject}
            helperSubTab={props.helperSubTab}
            setHelperSubTab={props.setHelperSubTab}
            selectedHelperSecurity={props.selectedHelperSecurity}
            setSelectedHelperSecurity={props.setSelectedHelperSecurity}
            selectedHelperRefactor={props.selectedHelperRefactor}
            setSelectedHelperRefactor={props.setSelectedHelperRefactor}
            helperSearchQuery={props.helperSearchQuery}
            setHelperSearchQuery={props.setHelperSearchQuery}
            simulatedDiffApplied={props.simulatedDiffApplied}
            setSimulatedDiffApplied={props.setSimulatedDiffApplied}
            copyFeedback={props.copyFeedback}
            setCopyFeedback={() => {}}
            onFixIssue={props.onFixIssue}
          />
        );
      case "runtime":
        return (
          <RuntimeTab
            activeProject={props.activeProject}
            fetchSandboxConfig={props.fetchSandboxConfig}
            handleSandboxReset={props.handleSandboxReset}
            sandboxDbState={props.sandboxDbState}
            sandboxLogs={props.sandboxLogs}
            activeSandboxTable={props.activeSandboxTable}
            setActiveSandboxTable={props.setActiveSandboxTable}
            expandedLogIndex={props.expandedLogIndex}
            setExpandedLogIndex={props.setExpandedLogIndex}
            copyFeedback={props.copyFeedback}
            copyTextToClipboard={props.copyTextToClipboard}
          />
        );
      case "api":
        return (
          <ApiTab
            activeProject={props.activeProject}
            selectedEndpoint={props.selectedEndpoint}
            setSelectedEndpoint={props.setSelectedEndpoint}
            swaggerRequestBody={props.swaggerRequestBody}
            setSwaggerRequestBody={props.setSwaggerRequestBody}
            executeSwaggerTryIt={props.executeSwaggerTryIt}
            isSwaggerExecuting={props.isSwaggerExecuting}
            simulatedExecutionTrace={props.simulatedExecutionTrace}
            swaggerResponse={props.swaggerResponse}
            setSwaggerResponse={props.setSwaggerResponse}
            setSimulatedExecutionTrace={props.setSimulatedExecutionTrace}
          />
        );
      case "database":
        return (
          <DatabaseTab
            activeProject={props.activeProject}
            selectedTable={props.selectedTable}
            setSelectedTable={props.setSelectedTable}
          />
        );
      case "sql-terminal":
        return (
          <SqlTerminalTab
            sqlQuery={props.sqlQuery}
            setSqlQuery={props.setSqlQuery}
            handleExecuteSQLQuery={props.handleExecuteSQLQuery}
            sqlLoading={props.sqlLoading}
            sqlResults={props.sqlResults}
            sqlAffectedRows={props.sqlAffectedRows}
            sqlError={props.sqlError}
            activeProject={props.activeProject}
          />
        );
      case "files":
        return (
          <FilesTab
            activeProject={props.activeProject}
            projectSource={props.projectSource}
            uploadedZipFiles={props.uploadedZipFiles}
            selectedFile={props.selectedFile}
            setSelectedFile={props.setSelectedFile}
            fileSearchQuery={props.fileSearchQuery}
            setFileSearchQuery={props.setFileSearchQuery}
            codeSearchQuery={props.codeSearchQuery}
            setCodeSearchQuery={props.setCodeSearchQuery}
            appliedSecurityFixes={props.appliedSecurityFixes}
            setAppliedSecurityFixes={props.setAppliedSecurityFixes}
            diffViewActive={props.diffViewActive}
            setDiffViewActive={props.setDiffViewActive}
            copyFeedback={props.copyFeedback}
            copyTextToClipboard={props.copyTextToClipboard}
            sampleCodeOverrides={props.sampleCodeOverrides}
          />
        );
      case "diagnostics":
        return (
          <DiagnosticsTab
            activeProject={props.activeProject}
            onFixIssue={props.onFixIssue}
            setActiveTab={props.setActiveTab}
            setSelectedFile={props.setSelectedFile}
          />
        );
      case "analysis":
        return <AnalysisTab activeProject={props.activeProject} />;
      case "security":
        return (
          <SecurityTab
            activeProject={props.activeProject}
            selectedSecurityIssue={props.selectedSecurityIssue}
            setSelectedSecurityIssue={props.setSelectedSecurityIssue}
            securityFixed={props.securityFixed}
            setSecurityFixed={props.setSecurityFixed}
            onFixIssue={props.onFixIssue}
          />
        );
      case "performance":
        return <PerformanceTab activeProject={props.activeProject} onFixIssue={props.onFixIssue} />;
      case "complexity":
        return <RefactorTab activeProject={props.activeProject} />;
      case "reports":
        return (
          <ReportsTab
            activeProject={props.activeProject}
            triggerDownloadReport={props.triggerDownloadReport}
          />
        );
      case "compliance":
        return <ComplianceTab activeProject={props.activeProject} />;
      case "logs-stream":
        return <LogsStreamTab activeProject={props.activeProject} onFixIssue={props.onFixIssue} />;
      case "git-insights":
        return <GitInsightsTab activeProject={props.activeProject} />;
      case "benchmark":
        return <BenchmarkTab activeProject={props.activeProject} />;
      case "dead-code":
        return <DeadCodeTab activeProject={props.activeProject} />;
      case "timeline":
        return <TimelineTab activeProject={props.activeProject} />;
      default:
        return (
          <DashboardTab
            activeProject={props.activeProject}
            projectSource={props.projectSource}
            setActiveTab={props.setActiveTab}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar
        activeProject={props.activeProject}
        projectSource={props.projectSource}
        activeTab={props.activeTab}
        setActiveTab={props.setActiveTab}
        showSettings={props.showSettings}
        setShowSettings={props.setShowSettings}
      />
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {props.showSettings && (
          <SettingsDrawer
            settingsSeverity={props.settingsSeverity}
            setSettingsSeverity={props.setSettingsSeverity}
            settingsArchMatch={props.settingsArchMatch}
            setSettingsArchMatch={props.setSettingsArchMatch}
            setShowSettings={props.setShowSettings}
          />
        )}
        {renderActiveTabContent()}
      </main>
    </div>
  );
};
