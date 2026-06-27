import React, { useState } from "react";
import { 
  Search, Folder, FolderOpen, ChevronRight, ChevronDown, FileCode, FileJson, 
  FileText, Settings, ShieldAlert, CheckCircle2, FileCode2, Info
} from "lucide-react";
import { CodeScopeAnalysis } from "../../types";

interface FileTreeProps {
  activeProject: CodeScopeAnalysis;
  projectSource: 'sample' | 'uploaded';
  uploadedZipFiles: Array<{ name: string; size: number; content?: string }>;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  fileSearchQuery: string;
  setFileSearchQuery: (query: string) => void;
  appliedSecurityFixes?: Record<string, boolean>;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: Record<string, TreeNode>;
  size?: number;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  let colorClass = "text-slate-400";
  let IconComponent = FileCode;

  if (filename === 'package.json' || filename === 'composer.json' || filename === 'pom.xml') {
    IconComponent = Settings;
    colorClass = "text-cyan-400";
  } else if (ext === 'json') {
    IconComponent = FileJson;
    colorClass = "text-yellow-500";
  } else if (ext === 'java') {
    IconComponent = CoffeeIcon;
    colorClass = "text-amber-500";
  } else if (ext === 'php') {
    IconComponent = FileCode2;
    colorClass = "text-purple-400";
  } else if (ext === 'ts' || ext === 'tsx') {
    IconComponent = FileCode2;
    colorClass = "text-blue-400";
  } else if (ext === 'js' || ext === 'jsx') {
    IconComponent = FileCode2;
    colorClass = "text-yellow-400";
  } else if (ext === 'md') {
    IconComponent = FileText;
    colorClass = "text-emerald-400";
  }

  return <IconComponent className={`h-3.5 w-3.5 shrink-0 ${colorClass}`} />;
};

// Custom Coffee cup icon for Java since Coffee is not in standard Lucide import sometimes or to be safe
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" x2="6" y1="2" y2="4" />
    <line x1="10" x2="10" y1="2" y2="4" />
    <line x1="14" x2="14" y1="2" y2="4" />
  </svg>
);

const isFileSelected = (nodePath: string, selected: string) => {
  if (!selected) return false;
  if (nodePath === selected) return true;
  const cleanPath = nodePath.replace(/\\/g, '/');
  const cleanSelected = selected.replace(/\\/g, '/');
  return cleanPath.endsWith('/' + cleanSelected) || cleanSelected.endsWith('/' + cleanPath);
};

export const FileTree: React.FC<FileTreeProps> = ({
  activeProject,
  projectSource,
  uploadedZipFiles,
  selectedFile,
  setSelectedFile,
  fileSearchQuery,
  setFileSearchQuery,
  appliedSecurityFixes = {},
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: prev[path] === false ? true : false
    }));
  };

  // Determine list of files based on active project type
  let filesList: Array<{ path: string; size?: number }> = [];

  if (activeProject.projectName.includes("Spring")) {
    filesList = [
      { path: "src/main/java/com/ecommerce/orders/OrderService.java" },
      { path: "src/main/java/com/ecommerce/orders/OrderController.java" },
      { path: "src/main/java/com/ecommerce/orders/OrderRepository.java" },
      { path: "src/main/java/com/ecommerce/products/ProductController.java" },
      { path: "src/main/java/com/ecommerce/products/ProductService.java" },
      { path: "src/main/java/com/ecommerce/config/WebSecurityConfig.java" },
      { path: "src/main/java/com/ecommerce/config/WebMvcConfig.java" },
      { path: "pom.xml" }
    ];
  } else if (activeProject.projectName.includes("Laravel")) {
    filesList = [
      { path: "app/Http/Controllers/PostController.php" },
      { path: "app/Http/Controllers/CommentController.php" },
      { path: "app/Models/Post.php" },
      { path: "app/Models/Comment.php" },
      { path: "resources/views/posts/show.blade.php" },
      { path: "composer.json" }
    ];
  } else if (activeProject.projectName.includes("Express")) {
    filesList = [
      { path: "src/controllers/UserController.ts" },
      { path: "src/repositories/UserRepository.ts" },
      { path: "src/services/OrderService.ts" },
      { path: "package.json" }
    ];
  } else if (projectSource === 'uploaded' && uploadedZipFiles.length > 0) {
    filesList = uploadedZipFiles.slice(0, 50).map(f => ({ path: f.name, size: f.size }));
  }

  // Build the tree
  const buildTree = (files: Array<{ path: string; size?: number }>): TreeNode => {
    const root: TreeNode = { name: 'root', path: '', type: 'directory', children: {} };
    
    files.forEach(file => {
      const parts = file.path.split(/[/\\]/);
      let current = root;
      let currentPath = '';
      
      parts.forEach((part, i) => {
        if (!part) return;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = i === parts.length - 1;
        
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'directory',
            children: {},
            size: isLast ? file.size : undefined
          };
        }
        current = current.children[part];
      });
    });
    
    return root;
  };

  const getSecurityIssueForFile = (filepath: string): { severity: string; isFixed: boolean } | null => {
    if (!filepath || !activeProject?.security) return null;
    const lowerFile = filepath.toLowerCase().replace(/\\/g, '/');
    const issue = activeProject.security.find(issue => {
      const issueFile = issue.file.toLowerCase().replace(/\\/g, '/');
      return lowerFile.endsWith(issueFile) || issueFile.endsWith(lowerFile);
    });
    if (!issue) return null;
    
    // Find the actual file key that was remediated in appliedSecurityFixes
    // (could be stored as full path or just the filename)
    const isFixed = Object.keys(appliedSecurityFixes).some(key => {
      if (!appliedSecurityFixes[key]) return false;
      const cleanKey = key.toLowerCase().replace(/\\/g, '/');
      return lowerFile.endsWith(cleanKey) || cleanKey.endsWith(lowerFile);
    });

    return { severity: issue.severity, isFixed };
  };

  const filterTree = (node: TreeNode, query: string): TreeNode | null => {
    if (node.type === 'file') {
      return node.name.toLowerCase().includes(query.toLowerCase()) ? node : null;
    }

    const filteredChildren: Record<string, TreeNode> = {};
    let hasMatchingChild = false;

    Object.entries(node.children).forEach(([key, child]) => {
      const filteredChild = filterTree(child, query);
      if (filteredChild) {
        filteredChildren[key] = filteredChild;
        hasMatchingChild = true;
      }
    });

    if (hasMatchingChild) {
      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  const rootTree = buildTree(filesList);
  const filteredTree = fileSearchQuery ? filterTree(rootTree, fileSearchQuery) : rootTree;

  const renderNode = (node: TreeNode, depth: number) => {
    if (node.path === '') {
      return Object.values(node.children)
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .map(child => renderNode(child, depth));
    }

    const isDir = node.type === 'directory';
    // If search query is active, expand folders by default. Otherwise check collapsed states
    const isExpanded = fileSearchQuery ? true : (expandedFolders[node.path] !== false);
    const isSelected = isFileSelected(node.path, selectedFile);
    const security = getSecurityIssueForFile(node.path);

    if (isDir) {
      return (
        <div key={node.path} className="select-none">
          <button
            onClick={() => toggleFolder(node.path)}
            className="w-full flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-800/40 rounded-md text-[13px] text-slate-300 font-sans transition-colors cursor-pointer group"
            style={{ paddingLeft: `${depth * 12 + 6}px` }}
          >
            <span className="text-slate-500 group-hover:text-slate-350 transition-colors">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </span>
            <span className="text-slate-450 group-hover:text-slate-250 transition-colors">
              {isExpanded ? (
                <FolderOpen className="h-3.5 w-3.5 text-indigo-400/80 fill-indigo-500/10" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-indigo-400/80 fill-indigo-500/5" />
              )}
            </span>
            <span className="truncate text-slate-300 group-hover:text-slate-200 transition-colors">{node.name}</span>
          </button>
          
          {isExpanded && (
            <div className="relative">
              {/* Indentation guide lines */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-800/60 group-hover:bg-slate-700/40 transition-colors"
                style={{ left: `${depth * 12 + 13}px` }}
              />
              {Object.values(node.children)
                .sort((a, b) => {
                  if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          key={node.path}
          onClick={() => setSelectedFile(node.path)}
          className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-xs font-mono transition-all group relative cursor-pointer ${
            isSelected 
              ? "bg-indigo-650/20 text-white border-l-2 border-indigo-500 bg-gradient-to-r from-indigo-500/10 to-transparent" 
              : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
          }`}
          style={{ paddingLeft: `${depth * 12 + 20}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            {getFileIcon(node.name)}
            <span className={`truncate ${isSelected ? "font-semibold text-slate-200" : "font-normal"}`}>
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 shrink-0">
            {security && (
              security.isFixed ? (
                <span className="flex items-center" title="Vulnerability resolved">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </span>
              ) : (
                <span 
                  className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold font-sans ${
                    security.severity.toLowerCase() === 'high' 
                      ? 'bg-red-500/15 text-red-400 border border-red-500/25' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  }`}
                  title={`${security.severity} severity issue`}
                >
                  <ShieldAlert className="h-3 w-3 shrink-0" />
                  <span>{security.severity.charAt(0).toUpperCase()}</span>
                </span>
              )
            )}
            
            {node.size !== undefined && (
              <span className="text-[9px] opacity-40 font-sans group-hover:opacity-85 transition-opacity">
                {node.size > 1024 ? `${(node.size / 1024).toFixed(0)}K` : `${node.size}B`}
              </span>
            )}

            {!security && node.size === undefined && (
              <span className="text-[8px] opacity-30 uppercase group-hover:opacity-80 transition-opacity font-sans">
                {node.name.split('.').pop()?.substring(0, 3)}
              </span>
            )}
          </div>
        </button>
      );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:col-span-4 flex flex-col h-[525px] shadow-2xl relative overflow-hidden group/tree">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none transition-all duration-700 group-hover/tree:bg-indigo-500/10" />

      {/* Title block */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          <span className="text-xs font-bold text-slate-355 tracking-wider uppercase">Workspace Explorer</span>
        </div>
        <span className="text-[10px] text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-medium">
          {projectSource === 'sample' ? 'Sample Project' : 'Uploaded ZIP'}
        </span>
      </div>

      {/* Project name bar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 mb-3 flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-indigo-400 shrink-0" />
        <div className="text-left truncate min-w-0">
          <div className="text-[11px] font-bold text-slate-200 truncate leading-tight">
            {activeProject.projectName}
          </div>
          <div className="text-[9px] text-slate-500 truncate leading-none mt-0.5">
            {projectSource === 'sample' ? 'demo-repository' : 'extracted-files'}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3 shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Filter workspace files..."
          value={fileSearchQuery}
          onChange={(e) => setFileSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-8.5 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
        />
        {fileSearchQuery && (
          <button
            onClick={() => setFileSearchQuery("")}
            className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center font-bold cursor-pointer"
            title="Clear filter"
          >
            ×
          </button>
        )}
      </div>

      {/* Files Tree Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
        {filteredTree && Object.keys(filteredTree.children).length > 0 ? (
          renderNode(filteredTree, 0)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
            <Info className="h-6 w-6 text-slate-700 mb-1.5" />
            <span className="text-xs font-semibold text-slate-400">No files found</span>
            <span className="text-[10px] text-slate-600 mt-1 max-w-[160px]">
              Try widening your filter terms or select another project.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
