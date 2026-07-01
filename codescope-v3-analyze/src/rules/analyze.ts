import { analyzeTS } from "./ts";
import { analyzeRust } from "./rust";
import { analyzeGo } from "./go";

import * as fs from "fs";

export function analyzeFile(file: string) {
  const content = fs.readFileSync(file, "utf-8");

  if (file.endsWith(".ts") || file.endsWith(".tsx")) {
    return analyzeTS(content, file);
  }

  if (file.endsWith(".rs")) {
    return analyzeRust(content, file);
  }

  if (file.endsWith(".go")) {
    return analyzeGo(content, file);
  }

  return { file, issues: [] };
}
