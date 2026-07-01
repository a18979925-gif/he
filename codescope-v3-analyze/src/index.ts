import { scanFolder } from "./scanner";
import { generateReport } from "./report";

const target = process.argv[2];

if (!target) {
  console.log("Usage: node dist/index.js <file-or-folder>");
  process.exit(1);
}

const result = scanFolder(target);
const report = generateReport(result);

console.log(JSON.stringify(report, null, 2));
