import { runCodebaseAnalysis } from "../../analize";
import { executeSQL } from "../../runtime";

console.log("🚀 Running CodeScope Analysis Engine Tests...");

const mockFiles = [
  {
    name: "src/controllers/UserController.ts",
    size: 200,
    content: `
      import { UserService } from "@/services/UserService";
      export class UserController {
        constructor(private userService: UserService) {}
      }
    `
  },
  {
    name: "src/services/UserService.ts",
    size: 150,
    content: `
      export class UserService {}
    `
  }
];

try {
  const result = runCodebaseAnalysis(mockFiles, "Test Project");
  
  // Assertion 1: Project name match
  if (result.projectName !== "Test Project") {
    throw new Error(`Project name mismatch: expected "Test Project", got "${result.projectName}"`);
  }
  console.log("✅ Test 1 Passed: Project Name matches.");

  // Assertion 2: Language detection (TypeScript)
  const hasTs = result.projectDNA.languages.some(l => l.name === "TypeScript");
  if (!hasTs) {
    throw new Error(`TypeScript was not detected in Project DNA`);
  }
  console.log("✅ Test 2 Passed: TypeScript detected successfully.");

  // Assertion 3: Architecture detection
  if (!result.architecture.style) {
    throw new Error("Architecture style was not resolved");
  }
  console.log(`✅ Test 3 Passed: Architecture Style detected as "${result.architecture.style}".`);

  // Assertion 4: Dependency Graph Alias Import Resolution
  const hasEdge = result.dependencyGraph.edges.some(e => e.source.endsWith("UserController.ts") && e.target.endsWith("UserService.ts"));
  if (!hasEdge) {
    throw new Error(`Alias import "@/" was not resolved in dependency graph`);
  }
  console.log("✅ Test 4 Passed: Alias import resolved successfully.");

  // Assertion 5: SQL Emulator support for IN, ORDER BY and LIMIT
  const mockDb = {
    users: [
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob", age: 25 },
      { id: 3, name: "Charlie", age: 35 },
      { id: 4, name: "David", age: 20 }
    ]
  };

  // Test 5a: WHERE IN
  const inRes = executeSQL("SELECT name FROM users WHERE id IN (1, 3)", mockDb);
  if (inRes.rows.length !== 2 || inRes.rows[0].name !== "Alice" || inRes.rows[1].name !== "Charlie") {
    throw new Error(`SQL Emulator WHERE IN failure: ${JSON.stringify(inRes)}`);
  }
  console.log("✅ Test 5a Passed: SQL WHERE IN query executed correctly.");

  // Test 5b: ORDER BY & LIMIT
  const sortRes = executeSQL("SELECT name FROM users ORDER BY age DESC LIMIT 2", mockDb);
  if (sortRes.rows.length !== 2 || sortRes.rows[0].name !== "Charlie" || sortRes.rows[1].name !== "Alice") {
    throw new Error(`SQL Emulator ORDER BY & LIMIT failure: ${JSON.stringify(sortRes)}`);
  }
  console.log("✅ Test 5b Passed: SQL ORDER BY & LIMIT query executed correctly.");

  console.log("\n🎉 All tests passed successfully!");
  process.exit(0);
} catch (error: any) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
