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
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer transition-all ${
            isSelected
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {isFolder ? (
              <span className="text-gray-400">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            ) : (
              <span className="w-3.5" />
            )}
            
            {isFolder ? (
              isOpen ? (
                <FolderOpen size={16} className="text-blue-500 shrink-0" />
              ) : (
                <Folder size={16} className="text-blue-400 shrink-0" />
              )
            ) : (
              <FileCode size={16} className={`${isSelected ? 'text-blue-500' : 'text-gray-400'} shrink-0`} />
            )}
            
            <span className="text-xs truncate">{node.name}</span>
          </div>

          {totalIssues > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 shrink-0 ${
              isFolder 
                ? 'bg-gray-200 text-gray-700' 
                : issues.some(i => i.filePath === node.path && i.severity === 'critical')
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {!isFolder && <AlertTriangle size={10} />}
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
