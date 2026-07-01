import * as ts from "typescript";

export function createSourceFile(fileName: string, content: string): ts.SourceFile {
  return ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true);
}

export function forEachChildRecursive(node: ts.Node, callback: (node: ts.Node) => void) {
  function walk(n: ts.Node) {
    callback(n);
    ts.forEachChild(n, walk);
  }
  walk(node);
}
