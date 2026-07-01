import { useState } from 'react';
import { Folder, FolderOpen, FileCode, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode, AuditIssue } from '../types';

interface FileTreeProps {
  tree: FileNode[];
  onSelectFile: (path: string) => void;
  selectedPath: string | null;
  issues: AuditIssue[];
}

export default function FileTree({ tree, onSelectFile, selectedPath, issues }: FileTreeProps) {
  // Map of issue counts by file path for convenient badge lookups
  const issuesByPath = issues.reduce((acc, issue) => {
    acc[issue.filePath] = (acc[issue.filePath] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recursive tree item component
  function TreeItem({ node, depth }: { node: FileNode; depth: number; key?: string }) {
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === 'directory';
    const isSelected = selectedPath === node.path;
    
    // Count total issues in this node or any children recursively
    const countNodeIssues = (n: FileNode): number => {
      if (n.type === 'file') {
        return issuesByPath[n.path] || 0;
      }
      return (n.children || []).reduce((sum, child) => sum + countNodeIssues(child), 0);
    };

    const totalIssues = countNodeIssues(node);

    const handleNodeClick = () => {
      if (isFolder) {
        setIsOpen(!isOpen);
      } else {
        onSelectFile(node.path);
      }
    };

    return (
      <div className="select-none">
        <div
          onClick={handleNodeClick}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer transition-all duration-150 ${
            isSelected
              ? 'bg-indigo-500/15 text-indigo-300 border-l-2 border-indigo-500 rounded-r-md font-bold shadow-[0_0_15px_rgba(99,102,241,0.05)]'
              : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {isFolder ? (
              <span className="text-slate-500 group-hover:text-slate-350 transition-colors">
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
            ) : (
              <span className="w-3" />
            )}
            
            {isFolder ? (
              isOpen ? (
                <FolderOpen size={14} className="text-indigo-400 shrink-0 fill-indigo-500/10" />
              ) : (
                <Folder size={14} className="text-indigo-500 shrink-0 fill-indigo-500/5" />
              )
            ) : (
              <FileCode size={14} className={`${isSelected ? 'text-indigo-400' : 'text-slate-500'} shrink-0`} />
            )}
            
            <span className="text-xs truncate font-mono">{node.name}</span>
          </div>

          {totalIssues > 0 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 shrink-0 transition-colors ${
              isFolder 
                ? 'bg-slate-950 text-slate-400 border border-slate-850' 
                : issues.some(i => i.filePath === node.path && i.severity === 'critical')
                  ? 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
            }`}>
              {!isFolder && <AlertTriangle size={9} />}
              {totalIssues}
            </span>
          )}
        </div>

        {isFolder && isOpen && node.children && (
          <div className="mt-0.5">
            {node.children.map((child, index) => (
              <TreeItem key={child.path + index} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-6">
          No files indexed.
        </div>
      ) : (
        tree.map((node, index) => (
          <TreeItem key={node.path + index} node={node} depth={0} />
        ))
      )}
    </div>
  );
}
