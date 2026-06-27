import { runCodebaseAnalysis } from "../../analize";

console.log("🚀 Running CodeScope Analysis Engine Tests...");

const mockFiles = [
  {
    name: "src/controllers/UserController.ts",
    size: 200,
    content: `
      import { UserService } from "../services/UserService";
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

  console.log("\n🎉 All tests passed successfully!");
  process.exit(0);
} catch (error: any) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
