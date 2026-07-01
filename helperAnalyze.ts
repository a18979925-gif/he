import path from "path";

// 1. Language Names mapping from extensions
export const EXTENSION_NAMES: Record<string, string> = {
  ".java": "Java",
  ".php": "PHP",
  ".ts": "TypeScript",
  ".tsx": "TypeScript (React)",
  ".js": "JavaScript",
  ".jsx": "JavaScript (React)",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".cs": "C#",
  ".cpp": "C++",
  ".c": "C",
  ".rb": "Ruby",
  ".kt": "Kotlin",
  ".swift": "Swift",
  ".sh": "Shell Script",
  ".html": "HTML",
  ".css": "CSS",
  ".vue": "Vue",
  ".svelte": "Svelte",
  ".scala": "Scala",
  ".pl": "Perl",
  ".sql": "SQL",
  ".yml": "YAML",
  ".yaml": "YAML",
  ".json": "JSON",
  ".md": "Markdown",
  ".dart": "Dart",
  ".groovy": "Groovy",
  ".ex": "Elixir",
  ".exs": "Elixir",
  ".h": "C/C++ Header"
};

/**
 * Detects languages and their percentages based on the uploaded file sizes.
 */
export function detectLanguages(files: Array<{ name: string; size: number }>) {
  const extensionMap: Record<string, number> = {};
  let totalMappedSize = 0;

  files.forEach(f => {
    const ext = path.extname(f.name).toLowerCase();
    if (ext && EXTENSION_NAMES[ext]) {
      extensionMap[ext] = (extensionMap[ext] || 0) + f.size;
      totalMappedSize += f.size;
    }
  });

  const languages: { name: string; percentage: number }[] = [];
  const rawLangData: Record<string, number> = {};

  Object.entries(extensionMap).forEach(([ext, size]) => {
    const lang = EXTENSION_NAMES[ext];
    if (lang) {
      rawLangData[lang] = (rawLangData[lang] || 0) + size;
    }
  });

  if (totalMappedSize > 0) {
    Object.entries(rawLangData).forEach(([lang, size]) => {
      languages.push({
        name: lang,
        percentage: Math.max(1, Math.round((size / totalMappedSize) * 100))
      });
    });
  } else {
    languages.push({ name: "Unknown Plaintext", percentage: 100 });
  }

  languages.sort((a, b) => b.percentage - a.percentage);
  
  // Normalize percentages to sum up to exactly 100%
  const sum = languages.reduce((acc, curr) => acc + curr.percentage, 0);
  if (sum > 0 && sum !== 100 && languages.length > 0) {
    languages[0].percentage += (100 - sum);
  }

  return languages.filter(l => l.percentage > 0);
}

/**
 * Detects frameworks, databases, infrastructure and auth setups based on file list & contents.
 */
export function detectDNA(files: Array<{ name: string; size: number; content?: string }>) {
  const frameworks = new Set<string>();
  const databases = new Set<string>();
  const infrastructure = new Set<string>();
  const authentication = new Set<string>();

  files.forEach(f => {
    const lowerName = f.name.toLowerCase();

    // Check specific file indicators
    if (lowerName.includes("dockerfile") || lowerName.includes("docker-compose")) {
      infrastructure.add("Docker");
    }
    if (lowerName.includes("k8s") || lowerName.includes("kubernetes") || (lowerName.endsWith(".yaml") && lowerName.includes("deployment"))) {
      infrastructure.add("Kubernetes");
    }
    if (lowerName.includes(".github/workflows")) {
      infrastructure.add("GitHub Actions");
    }
    if (lowerName.includes("gitlab-ci.yml")) {
      infrastructure.add("GitLab CI/CD");
    }
    if (lowerName.includes("jenkinsfile")) {
      infrastructure.add("Jenkins CI");
    }
    if (lowerName.includes("tsconfig.json")) {
      frameworks.add("TypeScript Config");
    }
    if (lowerName.includes("vite.config")) {
      frameworks.add("Vite Bundler");
    }
    if (lowerName.includes("next.config")) {
      frameworks.add("Next.js App Router");
    }
    if (lowerName.includes("nuxt.config")) {
      frameworks.add("Nuxt.js Vue Framework");
    }
    if (lowerName.includes("tailwind.config") || lowerName.includes("postcss.config")) {
      frameworks.add("Tailwind CSS");
    }
    if (lowerName.includes("webpack.config")) {
      frameworks.add("Webpack Compiler");
    }
    if (lowerName.includes("svelte.config")) {
      frameworks.add("SvelteKit Framework");
    }
    if (lowerName.includes("angular.json")) {
      frameworks.add("Angular Web Platform");
    }
    if (lowerName.includes("serverless.yml") || lowerName.includes("serverless.yaml")) {
      infrastructure.add("Serverless Framework");
    }

    if (f.content) {
      const content = f.content.toLowerCase();

      // Node.js package scans
      if (lowerName.includes("package.json")) {
        if (content.includes("express")) frameworks.add("Express.js");
        if (content.includes("nestjs") || content.includes("@nestjs/core")) frameworks.add("NestJS Core");
        if (content.includes("koa")) frameworks.add("Koa.js");
        if (content.includes("fastify")) frameworks.add("Fastify.js");
        if (content.includes("react")) frameworks.add("React UI");
        if (content.includes("vue")) frameworks.add("Vue.js");
        if (content.includes("svelte")) frameworks.add("Svelte/SvelteKit");
        if (content.includes("next")) frameworks.add("Next.js Server");
        if (content.includes("prisma")) frameworks.add("Prisma ORM");
        if (content.includes("mongoose") || content.includes("mongodb")) databases.add("MongoDB");
        if (content.includes("sequelize")) frameworks.add("Sequelize ORM");
        if (content.includes("typeorm")) frameworks.add("TypeORM");
        if (content.includes("drizzle-orm")) frameworks.add("Drizzle ORM");
        if (content.includes("passport")) authentication.add("Passport.js Session Auth");
        if (content.includes("jsonwebtoken") || content.includes("jwt")) authentication.add("JWT Stateless Auth");
        if (content.includes("firebase-admin") || content.includes("firebase")) databases.add("Firebase Firestore");
        if (content.includes("next-auth") || content.includes("@auth/core")) authentication.add("Auth.js / NextAuth");
        if (content.includes("supabase")) databases.add("Supabase (PostgreSQL)");
        if (content.includes("jest")) frameworks.add("Jest Testing Library");
        if (content.includes("cypress")) frameworks.add("Cypress E2E Testing");
        if (content.includes("playwright")) frameworks.add("Playwright Automation");
        if (content.includes("clerk")) authentication.add("Clerk Auth");
        if (content.includes("aws-amplify") || content.includes("cognito")) authentication.add("AWS Cognito Auth");
        if (content.includes("@vercel/")) infrastructure.add("Vercel Serverless Platform");
      }

      // PHP Composer scans
      if (lowerName.includes("composer.json")) {
        if (content.includes("laravel/framework")) frameworks.add("Laravel Engine");
        if (content.includes("symfony/framework-bundle")) frameworks.add("Symfony Framework");
        if (content.includes("wordpress/core")) frameworks.add("WordPress Core");
        if (content.includes("doctrine/orm")) frameworks.add("Doctrine ORM");
      }

      // Python dependencies
      if (lowerName.includes("requirements.txt") || lowerName.includes("pipfile") || lowerName.includes("pyproject.toml")) {
        if (content.includes("django")) frameworks.add("Django MVC");
        if (content.includes("fastapi")) frameworks.add("FastAPI Server");
        if (content.includes("flask")) frameworks.add("Flask Microframework");
        if (content.includes("sqlalchemy")) frameworks.add("SQLAlchemy ORM");
        if (content.includes("psycopg2") || content.includes("postgresql")) databases.add("PostgreSQL");
        if (content.includes("pytest")) frameworks.add("PyTest Automation");
      }

      // Java Maven / Gradle files
      if (lowerName.includes("pom.xml") || lowerName.includes("build.gradle")) {
        if (content.includes("spring-boot") || content.includes("springframework")) frameworks.add("Spring Boot REST Framework");
        if (content.includes("hibernate")) frameworks.add("Hibernate JPA ORM");
        if (content.includes("mybatis")) frameworks.add("MyBatis Data Access");
        if (content.includes("junit")) frameworks.add("JUnit testing scope");
      }

      // Go Mod files
      if (lowerName.includes("go.mod")) {
        if (content.includes("github.com/gin-gonic/gin")) frameworks.add("Gin Web Framework");
        if (content.includes("github.com/gofiber/fiber")) frameworks.add("Fiber Go Framework");
        if (content.includes("github.com/labstack/echo")) frameworks.add("Echo Go Engine");
        if (content.includes("gorm.io/gorm")) frameworks.add("GORM Go ORM");
      }

      // Ruby Gemfiles
      if (lowerName.includes("gemfile")) {
        if (content.includes("rails")) frameworks.add("Ruby on Rails MVC");
        if (content.includes("sinatra")) frameworks.add("Sinatra Engine");
      }

      // Database cues in general content files
      if (content.includes("postgresql") || content.includes("postgres://") || content.includes("pg.")) databases.add("PostgreSQL");
      if (content.includes("mysql") || content.includes("mysql://") || content.includes("mysql.create")) databases.add("MySQL");
      if (content.includes("mongodb") || content.includes("mongodb://") || content.includes("mongoose.connect")) databases.add("MongoDB");
      if (content.includes("sqlite") || content.includes("sqlite://") || content.includes("sqlite3")) databases.add("SQLite");
      if (content.includes("redis")) infrastructure.add("Redis Cache / In-Memory Store");
      if (content.includes("kafka")) infrastructure.add("Apache Kafka Event Stream");
      if (content.includes("rabbitmq")) infrastructure.add("RabbitMQ Messaging Broker");
      if (content.includes("dynamodb") || content.includes("aws-sdk/client-dynamodb")) databases.add("AWS DynamoDB");

      // Authentication patterns
      if (content.includes("jwt") || content.includes("jsonwebtoken") || content.includes("bearer ")) authentication.add("JWT Bearer Token");
      if (content.includes("oauth") || content.includes("oauth2")) authentication.add("OAuth 2.0 Identity Server");
      if (content.includes("session") && (content.includes("cookie") || content.includes("express-session"))) authentication.add("Cookie Session Management");
      if (content.includes("api-key") || content.includes("apikey")) authentication.add("API Token Authentication");
      if (content.includes("bcrypt") || content.includes("argon2")) authentication.add("Secure Password Hashing");
      if (content.includes("auth0")) authentication.add("Auth0 Identity Hub");
      if (content.includes("clerk")) authentication.add("Clerk Auth Provider");
      if (content.includes("cognito")) authentication.add("AWS Cognito Directory");
    }
  });

  return {
    frameworks: Array.from(frameworks),
    databases: Array.from(databases),
    infrastructure: Array.from(infrastructure),
    authentication: Array.from(authentication)
  };
}

/**
 * Scans codebase files for API and backend routes.
 */
export function scanEndpoints(files: Array<{ name: string; content?: string }>) {
  const endpoints: any[] = [];

  files.forEach(f => {
    if (!f.content) return;
    const content = f.content;
    const baseName = path.basename(f.name);

    // Express HTTP Endpoint mapping
    const expressRegex = /(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi;
    let match;
    while ((match = expressRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const url = match[2];
      endpoints.push({
        method,
        url,
        description: `Endpoint mapped in ${baseName}`,
        auth: content.includes("auth") || content.includes("passport") || content.includes("jwt") ? "Token Security" : "Public Access",
        middlewares: content.includes("auth") ? ["AuthMiddleware"] : [],
        flow: ["Client HTTP Trigger", `${baseName} API route handler`, "Serialize JSON response"]
      });
    }

    // Spring Boot endpoint routing mapping
    const springRegex = /@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\s*\(\s*(?:value\s*=\s*)?['"]([^'"]+)['"]/gi;
    while ((match = springRegex.exec(content)) !== null) {
      const annot = match[1];
      const url = match[2];
      const method = annot.replace("Mapping", "").toUpperCase();
      endpoints.push({
        method,
        url,
        description: `Spring Boot Request Controller Endpoint in ${baseName}`,
        auth: content.includes("Security") || content.includes("PreAuthorize") ? "Role-Based Auth Guard" : "Public Access",
        middlewares: [],
        flow: ["Client HTTP Trigger", `@RestController ${baseName}`, "Service Delegates", "JSON Response Body"]
      });
    }

    // FastAPI / Flask endpoints mapping
    const pythonRegex = /@\w+\.(get|post|put|delete|patch|route)\s*\(\s*['"]([^'"]+)['"]/gi;
    while ((match = pythonRegex.exec(content)) !== null) {
      const rawMethod = match[1].toUpperCase();
      const method = (rawMethod === "ROUTE" ? "GET" : rawMethod);
      const url = match[2];
      endpoints.push({
        method,
        url,
        description: `Python Route Handler in ${baseName}`,
        auth: content.includes("token") || content.includes("depends") || content.includes("authorize") ? "Bearer token auth required" : "Public Access",
        middlewares: [],
        flow: ["WSGI/ASGI Gateway Ingress", `${baseName} handler`, "Pydantic Serialized Model"]
      });
    }

    // Laravel routing mappings
    const phpRegex = /Route::(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi;
    while ((match = phpRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const url = match[2];
      endpoints.push({
        method,
        url,
        description: `Laravel routing inside ${baseName}`,
        auth: content.includes("middleware('auth") ? "Guarded Endpoint" : "Public Access",
        middlewares: content.includes("middleware") ? ["auth"] : [],
        flow: ["Web Server Routing", `Controller Method in ${baseName}`, "Eloquent Response Serializer"]
      });
    }

    // NestJS Controller routing mapping
    if (content.includes("@Controller")) {
      const controllerMatches = [...content.matchAll(/@Controller\s*\(\s*['"]?([^'")]*)['"]?\s*\)/gi)];
      const prefix = controllerMatches.length > 0 ? controllerMatches[0][1] : "";
      const nestRegex = /@(Get|Post|Put|Delete|Patch)\s*\(\s*['"]?([^'")]*)['"]?\s*\)/gi;
      let nestMatch;
      while ((nestMatch = nestRegex.exec(content)) !== null) {
        const method = nestMatch[1].toUpperCase();
        const subUrl = nestMatch[2] || "";
        const url = ("/" + prefix + "/" + subUrl).replace(/\/+/g, "/").replace(/\/$/, "") || "/";
        endpoints.push({
          method,
          url,
          description: `NestJS Controller Endpoint in ${baseName}`,
          auth: content.includes("@UseGuards") || content.includes("AuthGuard") ? "Guards Security" : "Public Access",
          middlewares: content.includes("@UseGuards") ? ["AuthGuard"] : [],
          flow: ["Client HTTP Request", `NestJS Controller (${baseName})`, `Handler for ${method}`, "Response DTO"]
        });
      }
    }

    // Next.js Routing mapping (based on file paths)
    const normalizedPath = f.name.replace(/\\/g, "/");
    if (normalizedPath.includes("/app/api/") && (normalizedPath.endsWith("/route.ts") || normalizedPath.endsWith("/route.js"))) {
      const apiIndex = normalizedPath.indexOf("/api/");
      if (apiIndex !== -1) {
        const routePath = normalizedPath.substring(apiIndex, normalizedPath.lastIndexOf("/"));
        const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
        methods.forEach(m => {
          const exportRegex = new RegExp(`export\\s+(?:async\\s+)?function\\s+${m}\\b`, "i");
          if (exportRegex.test(content)) {
            endpoints.push({
              method: m,
              url: routePath,
              description: `Next.js App Router API Endpoint in ${baseName}`,
              auth: content.includes("getServerSession") || content.includes("next-auth") || content.includes("auth(") ? "Session Security" : "Public Access",
              middlewares: [],
              flow: ["Client HTTP Request", `Next.js Serverless Route (${baseName})`, "Edge Runtime / Serverless Exec", "JSON Response"]
            });
          }
        });
      }
    }

    if (normalizedPath.includes("/pages/api/") && (normalizedPath.endsWith(".ts") || normalizedPath.endsWith(".js") || normalizedPath.endsWith(".tsx") || normalizedPath.endsWith(".jsx"))) {
      const apiIndex = normalizedPath.indexOf("/api/");
      if (apiIndex !== -1) {
        let routePath = normalizedPath.substring(apiIndex, normalizedPath.lastIndexOf("."));
        if (routePath.endsWith("/index")) {
          routePath = routePath.slice(0, -6);
        }
        if (content.includes("export default") || content.includes("module.exports")) {
          const methodsUsed: string[] = [];
          if (content.includes("GET") || /req\.method\s*===\s*['"]GET['"]/i.test(content)) methodsUsed.push("GET");
          if (content.includes("POST") || /req\.method\s*===\s*['"]POST['"]/i.test(content)) methodsUsed.push("POST");
          if (content.includes("PUT") || /req\.method\s*===\s*['"]PUT['"]/i.test(content)) methodsUsed.push("PUT");
          if (content.includes("DELETE") || /req\.method\s*===\s*['"]DELETE['"]/i.test(content)) methodsUsed.push("DELETE");

          if (methodsUsed.length === 0) {
            methodsUsed.push("GET");
          }

          methodsUsed.forEach(m => {
            endpoints.push({
              method: m,
              url: routePath,
              description: `Next.js Pages Router API Endpoint in ${baseName}`,
              auth: content.includes("getSession") || content.includes("authOptions") ? "Session Security" : "Public Access",
              middlewares: [],
              flow: ["Client HTTP Request", `Next.js Pages Route (${baseName})`, "API Handler execution", "JSON Response"]
            });
          });
        }
      }
    }
  });

  return endpoints;
}

/**
 * Scans codebase files to extract tables and relational schemas.
 */
export function scanDatabaseSchema(files: Array<{ name: string; content?: string }>) {
  const tables: any[] = [];

  files.forEach(f => {
    if (!f.content) return;
    const content = f.content;

    // Scan raw SQL DDL files
    const createTableRegex = /create\s+table\s+(\w+)\s*\(([\s\S]*?)\)/gi;
    let match;
    while ((match = createTableRegex.exec(content)) !== null) {
      const tableName = match[1];
      const columnsContent = match[2];
      const columns: any[] = [];

      const colLines = columnsContent.split("\n");
      colLines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("--") || trimmed.startsWith("CONSTRAINT") || trimmed.startsWith("PRIMARY KEY") || trimmed.startsWith("FOREIGN KEY")) return;
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const colName = parts[0].replace(/['"`]/g, "");
          const colType = parts[1].replace(/[,;()]/g, "");
          columns.push({
            name: colName,
            type: colType,
            constraints: trimmed.toUpperCase().includes("PRIMARY KEY") ? "PRIMARY KEY" : trimmed.toUpperCase().includes("NOT NULL") ? "NOT NULL" : ""
          });
        }
      });

      tables.push({
        name: tableName,
        columns,
        relationships: []
      });
    }

    // Scan Prisma models
    const prismaModelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/gi;
    while ((match = prismaModelRegex.exec(content)) !== null) {
      const modelName = match[1];
      const fieldsContent = match[2];
      const columns: any[] = [];

      const fieldLines = fieldsContent.split("\n");
      fieldLines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("@@") || trimmed.startsWith("//")) return;
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const colName = parts[0];
          const colType = parts[1].replace("?", "");
          columns.push({
            name: colName,
            type: colType,
            constraints: trimmed.includes("@id") ? "PRIMARY KEY" : trimmed.includes("@unique") ? "UNIQUE" : ""
          });
        }
      });

      tables.push({
        name: modelName,
        columns,
        relationships: []
      });
    }
  });

  // Attempt to infer relationships between detected tables
  tables.forEach(table => {
    table.columns.forEach((col: any) => {
      const colNameLower = col.name.toLowerCase();
      if (colNameLower.endsWith("id") || colNameLower.endsWith("_id")) {
        const targetCandidate = colNameLower.replace(/_id|id/g, "");
        // Check if there is another table with this candidate name
        const matchedTarget = tables.find(t => t.name.toLowerCase() === targetCandidate);
        if (matchedTarget && matchedTarget.name.toLowerCase() !== table.name.toLowerCase()) {
          table.relationships.push({
            targetTable: matchedTarget.name,
            type: "many-to-one",
            foreignKey: col.name
          });
        }
      }
    });
  });

  return tables;
}

function generateSecureReplacement(category: string, line: string): string {
  const trimmed = line.trim();
  
  if (category === "SQL Injection Susceptibility") {
    const match = line.match(/\+\s*([a-zA-Z0-9_.]+)/) || line.match(/\$\{\s*([a-zA-Z0-9_.]+)\s*\}/);
    const varName = match ? match[1] : "input";
    
    if (trimmed.includes("db.execute") || trimmed.includes("conn.execute")) {
      return trimmed.replace(/execute\s*\((.*?)\)/, `execute("SELECT * FROM table WHERE field = ?", [${varName}])`);
    }
    if (trimmed.includes("db.query") || trimmed.includes("conn.query") || trimmed.includes("query(")) {
      return trimmed.replace(/query\s*\((.*?)\)/, `query("SELECT * FROM table WHERE field = $1", [${varName}])`);
    }
    return trimmed.replace(/\+\s*[a-zA-Z0-9_.]+/, "?").replace(/\$\{[a-zA-Z0-9_.]+\}/, "?");
  }
  
  if (category === "Command Injection Vulnerability") {
    const match = line.match(/\+\s*([a-zA-Z0-9_.]+)/) || line.match(/\$\{\s*([a-zA-Z0-9_.]+)\s*\}/);
    const varName = match ? match[1] : "input";
    return trimmed.replace(/(exec|execSync|spawn)\s*\((.*?)\)/, `execFile("/usr/bin/command", [${varName}], (err, stdout) => { ... })`);
  }
  
  if (category === "Cross-Site Scripting (XSS)") {
    const match = line.match(/dangerouslySetInnerHTML\s*=\s*\{\{\s*__html\s*:\s*([a-zA-Z0-9_.]+)/) || line.match(/v-html\s*=\s*['"]([a-zA-Z0-9_.]+)['"]/);
    const varName = match ? match[1] : "content";
    if (trimmed.includes("dangerouslySetInnerHTML")) {
      return trimmed.replace(/dangerouslySetInnerHTML\s*=\s*\{\{\s*__html\s*:\s*([a-zA-Z0-9_.]+)\s*\}\}/, `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(${varName}) }}`);
    }
    if (trimmed.includes("v-html")) {
      return trimmed.replace(/v-html\s*=\s*['"]([a-zA-Z0-9_.]+)['"]/, `v-html="DOMPurify.sanitize(${varName})"`);
    }
  }
  
  if (category === "Path Traversal Susceptibility") {
    const match = line.match(/fs\.readFile\s*\(\s*([a-zA-Z0-9_.]+)/) || line.match(/path\.join\s*\(\s*[^,]+,\s*([a-zA-Z0-9_.]+)/);
    const varName = match ? match[1] : "fileInput";
    return `const safePath = path.basename(${varName}); ${trimmed.replace(new RegExp(`\\b${varName}\\b`, 'g'), "safePath")}`;
  }
  
  if (category === "Hardcoded Cryptographic Token") {
    return trimmed.replace(/['"]([a-zA-Z0-9_\-+=/]{12,})['"]/, "process.env.SECRET_API_KEY");
  }

  if (category === "Insecure Randomness (Math.random)") {
    if (trimmed.includes("Math.random()")) {
      return trimmed.replace("Math.random()", "crypto.randomBytes(4).readUInt32BE(0) / 0xffffffff");
    }
  }

  if (category === "Unsafe Dynamic Code Execution (eval)") {
    const match = line.match(/eval\s*\(\s*([a-zA-Z0-9_.]+)/);
    const varName = match ? match[1] : "data";
    return `JSON.parse(${varName}); // Refactored from unsafe eval`;
  }
  
  return trimmed;
}

/**
 * Sweeps files for security vulnerabilities.
 */
export function sweepSecurity(files: Array<{ name: string; content?: string }>) {
  const securityIssues: any[] = [];

  files.forEach(f => {
    const lowerName = f.name.toLowerCase();

    // Leak check for credentials/configuration in source code history
    if (lowerName.endsWith(".env") || lowerName.includes("id_rsa") || lowerName.endsWith("secret.key") || lowerName.includes("service-account.json") || lowerName.endsWith("credentials.json")) {
      securityIssues.push({
        category: "Exposed Environment / Secret Key File",
        file: f.name,
        line: 1,
        severity: "Critical",
        description: "A secure environment variables profile, private RSA key, or service account credential was detected in repository structure. Committing these exposes complete cloud resources to malicious breaches.",
        solution: "Add this file path directly to .gitignore, delete the file immediately from version history, and cycle all affected API credentials.",
        oldCode: f.name,
        newCode: `# Added to .gitignore:\n${f.name}`
      });
    }

    if (!f.content) return;
    const content = f.content;
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // 1. Hardcoded API/JWT Secrets / Tokens
      const secretRegex = /(api[_-]?key|jwt[_-]?secret|password|private[_-]?key|auth[_-]?token|client[_-]?secret)\s*[:=]\s*['"]([a-zA-Z0-9_\-+=/]{12,})['"]/gi;
      if (secretRegex.test(line) && !line.includes("process.env") && !line.includes("config") && !line.includes("EXAMPLE") && !line.includes("mock")) {
        securityIssues.push({
          category: "Hardcoded Cryptographic Token",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "A raw sensitive credential or secret key token literal is defined directly in source code, opening access to hackers parsing repository records.",
          solution: "Load variables from secure environment variables dynamically at runtime or use encrypted secret vaults.",
          oldCode: line.trim(),
          newCode: generateSecureReplacement("Hardcoded Cryptographic Token", line)
        });
      }

      // 2. Direct SQL Concat strings (injection susceptibility)
      if ((line.includes("SELECT ") || line.includes("INSERT ") || line.includes("UPDATE ") || line.includes("DELETE ")) && (line.includes("+") || line.includes("${")) && (line.includes("query") || line.includes("execute") || line.includes("db."))) {
        securityIssues.push({
          category: "SQL Injection Susceptibility",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "Raw string concatenation detected inside database query bindings. Attackers can pass malicious SQL commands to bypass authentication or drop tables.",
          solution: "Refactor to use prepared parameterized values or safe queries from your ORM.",
          oldCode: line.trim(),
          newCode: generateSecureReplacement("SQL Injection Susceptibility", line)
        });
      }

      // 3. Wildcard CORS origin headers
      if (line.includes("origin") && (line.includes("*") || line.includes("wildcard")) && (line.includes("cors") || line.includes("Access-Control-Allow-Origin"))) {
        securityIssues.push({
          category: "Permissive Wildcard CORS Settings",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "CORS configuration uses a wildcard (*) allowing access from any unauthorized origin domain. This opens cookies and requests to Cross-Origin Read exploits.",
          solution: "Provide an explicit list of allowed domains or retrieve dynamic trusted origins.",
          oldCode: line.trim(),
          newCode: "cors({ origin: ['https://yourtrustedapp.com'] })"
        });
      }

      // 4. React dangerouslySetInnerHTML or Vue v-html
      if (line.includes("dangerouslySetInnerHTML") || line.includes("v-html")) {
        securityIssues.push({
          category: "Cross-Site Scripting (XSS)",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Using dangerouslySetInnerHTML or v-html directly renders raw strings without prior HTML purification, enabling script injections.",
          solution: "Sanitize incoming HTML strings with library encodings like DOMPurify, or avoid raw HTML bindings entirely.",
          oldCode: line.trim(),
          newCode: generateSecureReplacement("Cross-Site Scripting (XSS)", line)
        });
      }

      // 5. Shell Command Injection via spawn or exec
      if ((line.includes("exec(") || line.includes("execSync(") || line.includes("spawn(")) && (line.includes("+") || line.includes("${"))) {
        securityIssues.push({
          category: "Command Injection Vulnerability",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "Spawning command processes with raw concatenated user arguments. Attackers can append shell control operators (; && |) to run arbitrary server shell scripts.",
          solution: "Sanitize the input argument strictly or use safe argument arrays instead of running raw terminal command lines.",
          oldCode: line.trim(),
          newCode: generateSecureReplacement("Command Injection Vulnerability", line)
        });
      }

      // 6. Insecure Cookie / Session Flags
      if (line.includes("cookie") && line.includes("session") && (line.includes("secure: false") || line.includes("httpOnly: false"))) {
        securityIssues.push({
          category: "Insecure Session Cookie Configuration",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "Session Cookies configured without HttpOnly or Secure properties. This allows client side scripts to read cookies (making them target to XSS theft) or sends them over HTTP.",
          solution: "Configure cookies with httpOnly: true, secure: true, and sameSite: 'strict'.",
          oldCode: line.trim(),
          newCode: "res.cookie('sid', id, { httpOnly: true, secure: true, sameSite: 'strict' });"
        });
      }

      // 7. Weak Crypto algorithms (MD5, SHA1)
      if ((line.includes("createHash('md5'") || line.includes("createHash(\"md5\"") || line.includes("createHash('sha1'") || line.includes("createHash(\"sha1\"")) && !line.includes("gravatar")) {
        securityIssues.push({
          category: "Weak Cryptographic Hash Algorithm",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "MD5/SHA1 hashing is active. These algorithms have severe collision flaws and are trivial to crack using modern GPU lookup tables.",
          solution: "Upgrade to cryptographically strong secure standards like SHA-256 or bcrypt.",
          oldCode: line.trim(),
          newCode: "crypto.createHash('sha256').update(password).digest('hex')"
        });
      }

      // 8. Insecure Randomness (Math.random())
      if (line.includes("Math.random()") && (line.includes("password") || line.includes("token") || line.includes("key") || line.includes("id") || line.includes("secret") || line.includes("salt"))) {
        securityIssues.push({
          category: "Insecure Randomness (Math.random)",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Math.random() is a cryptographically pseudo-random number generator that is predictable. Using it to generate passwords, security tokens, session keys, or identifiers poses a security vulnerability.",
          solution: "Use a cryptographically secure random number generator such as crypto.getRandomValues() (browser) or crypto.randomBytes() (Node.js).",
          oldCode: line.trim(),
          newCode: generateSecureReplacement("Insecure Randomness (Math.random)", line)
        });
      }

      // 9. Prototype Pollution Vulnerability
      if ((line.includes("__proto__") || line.includes("constructor.prototype")) && (line.includes("=") || line.includes("[") || line.includes("Object.assign"))) {
        securityIssues.push({
          category: "Prototype Pollution Vulnerability",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Accessing or modifying property attributes on __proto__ or constructor.prototype without input sanitization can lead to prototype pollution, permitting custom property injection or server crashes.",
          solution: "Ensure property names are validated and block key strings like '__proto__', 'constructor', and 'prototype' before merging objects.",
          oldCode: line.trim(),
          newCode: "if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') { obj[key] = val; }"
        });
      }

      // 10. Regular Expression Denial of Service (ReDoS)
      if (/\/\(.*?[+*]\)[+*]/.test(line) || /\/\(.*?\\w\+?\)\+/.test(line) || /\/\(\[.*?\][+*]\)[+*]/.test(line)) {
        securityIssues.push({
          category: "Regular Expression Denial of Service (ReDoS)",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Detected a regular expression with nested repeating groups or overlapping alternatives. This can cause catastrophic backtracking under complex input strings, leading to service denial.",
          solution: "Simplify the regular expression, remove nested quantifiers, or enforce input length limits before pattern matching.",
          oldCode: line.trim(),
          newCode: "// Simplified non-nested regular expression"
        });
      }

      // 11. Directory / Path Traversal
      if ((line.includes("fs.readFile") || line.includes("fs.writeFile") || line.includes("fs.promises.read")) && (line.includes("req.query") || line.includes("req.params") || line.includes("req.body") || line.includes("url") || line.includes("path.join") && (line.includes("+") || line.includes("${")))) {
        securityIssues.push({
          category: "Path Traversal Susceptibility",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Dynamic file path construction from client-supplied parameters detected. An attacker could use path traversal sequences (e.g. '../../') to read or write sensitive server configuration files.",
          solution: "Sanitize the filename to allow only alpha-numeric characters, or use path.resolve to verify the target resides within a sandbox directory.",
          oldCode: line.trim(),
          newCode: generateSecureReplacement("Path Traversal Susceptibility", line)
        });
      }

      // 12. Unsafe Dynamic Code Execution (eval)
      if ((line.includes("eval(") || line.includes("new Function(")) && !line.includes("//") && !line.includes("/*")) {
        securityIssues.push({
          category: "Unsafe Dynamic Code Execution (eval)",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "Usage of eval() or new Function() allows executing arbitrary strings as code. If user input reaches these calls, it results in remote code execution (RCE).",
          solution: "Avoid eval and new Function. Refactor logic to use safe parsers (like JSON.parse) or structured functions.",
          oldCode: line.trim(),
          newCode: generateSecureReplacement("Unsafe Dynamic Code Execution (eval)", line)
        });
      }

      // 13. XML External Entity (XXE) Vulnerability
      if (line.includes("xml") && (line.includes("noent: true") || line.includes("externalEntities: true") || line.includes("noent:1"))) {
        securityIssues.push({
          category: "XML External Entity (XXE) Vulnerability",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "XML parser configured to allow external entities (noent or externalEntities set to true). This allows attackers to access local files, perform internal SSRF, or crash the server.",
          solution: "Configure XML parser options to disable external entities (noent: false, externalEntities: false).",
          oldCode: line.trim(),
          newCode: "parserOptions = { noent: false, externalEntities: false };"
        });
      }

      // 14. Missing CSRF Protection
      if (line.includes(".csrf().disable()") || (line.includes("session") && (line.includes("csrf: false") || line.includes("disableCsrf: true")))) {
        securityIssues.push({
          category: "Missing CSRF Protection",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "CSRF protections are explicitly disabled in session configuration or security filters, permitting Cross-Site Request Forgery attacks.",
          solution: "Enable CSRF protection filters using standard middleware libraries (e.g. csurf or Spring Security defaults).",
          oldCode: line.trim(),
          newCode: "security.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))"
        });
      }

      // 15. Broken Object Level Authorization (BOLA/IDOR)
      if ((line.includes("/:id") || line.includes("/{id}")) && (line.includes("get(") || line.includes("delete(") || line.includes("put(")) && !content.includes("auth") && !content.includes("Guard") && !content.includes("verify")) {
        securityIssues.push({
          category: "Broken Object Level Authorization (BOLA)",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Resource endpoints identified by parameters (like user or order IDs) do not appear to enforce authorization check guards, allowing IDOR access manipulation.",
          solution: "Add authentication and resource-level authorization checks to verify user ownership of the requested ID.",
          oldCode: line.trim(),
          newCode: "router.get('/:id', verifyUserOwnership, handler);"
        });
      }

      // 16. Debug Mode Enabled in Production
      if ((line.includes("debug: true") || line.includes("DEBUG = True") || line.includes("ENV = 'development'")) && !line.includes("process.env") && !line.includes("process.argv")) {
        securityIssues.push({
          category: "Debug Mode Enabled in Production",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "Hardcoded debug flags enable stack trace leakages and verbose error logs in production deployments.",
          solution: "Read environment settings from process.env.NODE_ENV or configuration files dynamically.",
          oldCode: line.trim(),
          newCode: "const DEBUG = process.env.NODE_ENV !== 'production';"
        });
      }

      // 17. Insecure Deserialization
      if (line.includes("serialize.unserialize(") || line.includes("node-serialize") || line.includes("yaml.load(")) {
        securityIssues.push({
          category: "Insecure Deserialization",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "Unsafe parsing or deserialization of untrusted inputs allows arbitrary object injection or Remote Code Execution (RCE).",
          solution: "Avoid deserializing untrusted strings; use safe format structures like JSON.parse with schema verification.",
          oldCode: line.trim(),
          newCode: "JSON.parse(data);"
        });
      }

      // 18. Broken Cryptography (Weak Algorithms / Hardcoded Salt)
      if ((line.includes("createCipheriv('des'") || line.includes("createCipheriv('rc4'") || line.includes("pbkdf2") && line.includes("salt")) && !line.includes("process.env")) {
        securityIssues.push({
          category: "Broken Cryptography",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "Usage of outdated weak cryptographic algorithms (DES, RC4) or hardcoded salts in pbkdf2 key derivation.",
          solution: "Upgrade to AES-256-GCM and derive dynamic salts from a cryptographically secure random generator.",
          oldCode: line.trim(),
          newCode: "crypto.createCipheriv('aes-256-gcm', key, iv);"
        });
      }

      // 19. Webhook URLs / Cloud Service Keys / Bearer Tokens
      if (line.includes("hooks.slack.com/services/") || line.includes("discord.com/api/webhooks")) {
        securityIssues.push({
          category: "Exposed Chat Webhook URL",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "A hardcoded Slack or Discord chat integration webhook URL was found. Attackers can spam notifications or extract server metadata.",
          solution: "Move this webhook URL to environment variables or encrypted secrets store.",
          oldCode: line.trim(),
          newCode: "const webhookUrl = process.env.CHAT_WEBHOOK_URL;"
        });
      }

      const awsKeyRegex = /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/;
      if (awsKeyRegex.test(line)) {
        securityIssues.push({
          category: "Hardcoded AWS Access Key ID",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "An AWS IAM User Access Key ID was detected in the file. This can lead to account compromise if AWS secret keys are leaked or derived.",
          solution: "Remove this key from source files and use IAM roles or vault storage.",
          oldCode: line.trim(),
          newCode: "const awsKey = process.env.AWS_ACCESS_KEY_ID;"
        });
      }

      const bearerRegex = /Bearer\s+([a-zA-Z0-9_\-\.\~+\/]{20,})=*/g;
      if (bearerRegex.test(line) && !line.includes("process.env") && !line.includes("config") && !line.includes("EXAMPLE") && !line.includes("mock")) {
        securityIssues.push({
          category: "Hardcoded Bearer Token",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "A hardcoded authentication Bearer token was found inside source code.",
          solution: "Retrieve authentication Bearer tokens dynamically from authorization headers or environment configurations.",
          oldCode: line.trim(),
          newCode: "const token = process.env.API_BEARER_TOKEN;"
        });
      }
    });
  });

  return securityIssues;
}

/**
 * Scans files for performance bottlenecks.
 */
export function sweepPerformance(files: Array<{ name: string; content?: string }>) {
  const performanceIssues: any[] = [];

  files.forEach(f => {
    if (!f.content) return;
    const content = f.content;
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // 1. Sync IO Calls on main processes
      if (line.includes("readFileSync") || line.includes("writeFileSync") || line.includes("readdirSync") || line.includes("execSync")) {
        performanceIssues.push({
          issue: "Synchronous Blocking I/O Calls",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Executing blocking synchronous filesystem or process calls on Node.js main execution loop, preventing concurrently processed connection cycles.",
          suggestedOptimization: "Migrate calls to the asynchronous promises standard (e.g., fs.promises.readFile) instead.",
          oldCode: line.trim(),
          newCode: line.replace("fs.readFileSync", "await fs.promises.readFile").replace("fs.writeFileSync", "await fs.promises.writeFile").trim()
        });
      }

      // 5. Unoptimized whole-module Lodash imports
      if (line.includes("import") && (line.includes("'lodash'") || line.includes('"lodash"')) && (line.includes("_") || line.includes("* as"))) {
        performanceIssues.push({
          issue: "Unoptimized Lodash Import",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "Importing the complete Lodash library significantly increases bundle size. This leads to longer bundle download and parsing times for clients.",
          suggestedOptimization: "Cherry-pick individual Lodash helpers (e.g. import cloneDeep from 'lodash/cloneDeep') to enable tree-shaking.",
          oldCode: line.trim(),
          newCode: "import cloneDeep from 'lodash/cloneDeep';"
        });
      }
    });

    let insideLoop = false;
    let loopLineNum = 0;
    lines.forEach((line, idx) => {
      const cleanLine = line.split("//")[0].split("/*")[0];
      if (cleanLine.includes("for ") || cleanLine.includes(".forEach") || cleanLine.includes("while ") || cleanLine.includes(".map(")) {
        insideLoop = true;
        loopLineNum = idx + 1;
      }
      if (insideLoop && (idx + 1 - loopLineNum < 15)) {
        if ((cleanLine.includes(".query") || cleanLine.includes("findUnique") || cleanLine.includes("findMany") || cleanLine.includes("execute") || cleanLine.includes("db.")) &&
            !cleanLine.includes("querySelector") &&
            !cleanLine.includes("document.")) {
          performanceIssues.push({
            issue: "N+1 Database Query Pattern",
            file: f.name,
            line: idx + 1,
            severity: "High",
            description: "An active database query or model fetch is invoked repeatedly inside a loop. This leads to massive database connection overhead and poor request throughput.",
            suggestedOptimization: "Refactor loading mechanics to perform database JOINs, use SQL 'IN' arrays, or load data in batches.",
            oldCode: line.trim(),
            newCode: "// Query should be moved outside of loop or batched"
          });
          insideLoop = false;
        } else if (cleanLine.includes("await ") && !cleanLine.includes("Promise.all")) {
          performanceIssues.push({
            issue: "Sequential Await inside Iteration Loop",
            file: f.name,
            line: idx + 1,
            severity: "Medium",
            description: "Using await sequentially inside a loop blocks the thread until each promise completes. This turns what could be parallel operations into synchronous-like sequential ones.",
            suggestedOptimization: "Collect promises in an array and resolve them concurrently using Promise.all().",
            oldCode: line.trim(),
            newCode: "// const promises = list.map(item => asyncOp(item));\n// await Promise.all(promises);"
          });
        }
      }
    });

    // 3. Uncleaned Interval or timeout memory leaks (React)
    let hasInterval = false;
    let intervalLine = 0;
    lines.forEach((line, idx) => {
      if (line.includes("setInterval(") || line.includes("addEventListener(")) {
        hasInterval = true;
        intervalLine = idx + 1;
      }
      if (hasInterval && line.includes("useEffect(")) {
        // Check if there is a return cleanup function
        const block = lines.slice(idx, idx + 10).join("\n");
        if (!block.includes("return ") || (!block.includes("clearInterval") && !block.includes("removeEventListener"))) {
          performanceIssues.push({
            issue: "React Event / Interval Memory Leak",
            file: f.name,
            line: intervalLine,
            severity: "Medium",
            description: "Registered an active event listener or recurrent background interval inside a useEffect hook without returning a cleanup handler. This causes persistent memory leaks on page navigation.",
            suggestedOptimization: "Return a cleanup arrow function from useEffect which calls clearInterval or removeEventListener.",
            oldCode: line.trim(),
            newCode: "useEffect(() => {\n  const id = " + line.trim() + ";\n  return () => clearInterval(id);\n}, []);"
          });
          hasInterval = false;
        }
      }
    });

    // 4. Inefficient Exponential loops (nested loops)
    lines.forEach((line, idx) => {
      if (line.includes("for ") || line.includes(".forEach") || line.includes(".map(")) {
        const subsequent = lines.slice(idx + 1, idx + 4).join("\n");
        if (subsequent.includes("for ") || subsequent.includes(".forEach") || subsequent.includes(".map(")) {
          const depthCount = subsequent.match(/(for|\.forEach|\.map)/g)?.length || 0;
          if (depthCount >= 1) {
            performanceIssues.push({
              issue: "Highly Nested Quadratic Iteration Complexity",
              file: f.name,
              line: idx + 1,
              severity: "Medium",
              description: "Nested loop algorithms detected, which process listings with O(N²) or O(N³) quadratic/cubic complexity. This crashes browser responsiveness or server event loops with larger datasets.",
              suggestedOptimization: "Index values into temporary JS Map/Set lookup dictionaries to achieve highly performant linear O(N) execution speeds.",
              oldCode: line.trim(),
              newCode: "// Use Map index lookup instead of nested search"
            });
          }
        }
      }
    });
  });

  return performanceIssues;
}

/**
 * Calculates cognitive complexity of file contents.
 */
export function calculateCognitiveComplexity(content: string): number {
  if (!content) return 0;
  const lines = content.split("\n");
  let score = 0;
  let nesting = 0;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

    const nestingStarts = (trimmed.match(/\b(if|for|while|catch)\b/g) || []).length;
    score += nestingStarts;
    score += nestingStarts * nesting;
    
    const ternaries = (trimmed.match(/\?/g) || []).length;
    score += ternaries;
    score += ternaries * nesting;

    if (trimmed.includes("{") && !trimmed.includes("}")) {
      nesting++;
    }
    if (trimmed.includes("}") && !trimmed.includes("{")) {
      nesting = Math.max(0, nesting - 1);
    }

    const logicOperators = (trimmed.match(/&&|\|\|/g) || []).length;
    if (logicOperators > 0) {
      score += 1;
    }
  });

  return score;
}

/**
 * Sweeps codebase files for logical bugs.
 */
export function sweepBugs(files: Array<{ name: string; content?: string }>) {
  const bugIssues: any[] = [];

  files.forEach(f => {
    if (!f.content) return;
    const content = f.content;
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // 1. Invalid NaN check
      if (line.includes("=== NaN") || line.includes("== NaN") || line.includes("!== NaN") || line.includes("!= NaN")) {
        bugIssues.push({
          category: "Invalid NaN Comparison",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "NaN is not equal to itself in JavaScript/TypeScript. Direct comparisons (e.g. x === NaN) always return false. Use isNaN(x) instead.",
          solution: "Use the built-in isNaN() function to check for NaN values.",
          oldCode: line.trim(),
          newCode: line.replace(/(===|==|!==|!=)\s*NaN/, "").replace(/([a-zA-Z0-9_]+)\s*(===|==|!==|!=)\s*NaN/, "isNaN($1)").trim()
        });
      }

      // 2. Self-comparison
      const selfCompareMatch = line.match(/\b([a-zA-Z0-9_]+)\s*(===|==|!==|!=)\s*\1\b/);
      if (selfCompareMatch && !line.includes("NaN")) {
        bugIssues.push({
          category: "Self-Comparison Bug",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: `Comparing variable '${selfCompareMatch[1]}' to itself always yields a constant result. This is usually a copy-paste error or logic defect.`,
          solution: "Correct the second variable name in the comparison.",
          oldCode: line.trim(),
          newCode: line.replace(selfCompareMatch[0], `${selfCompareMatch[1]} === expectedValue`).trim()
        });
      }

      // 3. Typo in typeof comparison
      const typeofMatch = line.match(/typeof\s+([a-zA-Z0-9_.]+)\s*(===|==|!==|!=)\s*['"]([^'"]+)['"]/);
      if (typeofMatch) {
        const typeStr = typeofMatch[3];
        const validTypes = ["string", "number", "boolean", "undefined", "object", "function", "symbol", "bigint"];
        if (!validTypes.includes(typeStr)) {
          bugIssues.push({
            category: "Invalid typeof Target Typo",
            file: f.name,
            line: idx + 1,
            severity: "Critical",
            description: `Comparing typeof expression to an invalid type literal '${typeStr}'. Supported types are: ${validTypes.join(", ")}.`,
            solution: `Correct the string to a valid type indicator, e.g., "${typeStr.startsWith("num") ? "number" : typeStr.startsWith("str") ? "string" : "object"}".`,
            oldCode: line.trim(),
            newCode: line.replace(typeStr, typeStr.startsWith("num") ? "number" : typeStr.startsWith("str") ? "string" : "object").trim()
          });
        }
      }

      // 4. Infinite loop with no exit
      if (line.includes("while (true)") || line.includes("while(true)") || line.includes("for (;;)") || line.includes("for(;;)")) {
        const block = lines.slice(idx, idx + 20).join("\n");
        if (!block.includes("break") && !block.includes("return") && !block.includes("throw")) {
          bugIssues.push({
            category: "Potential Infinite Loop",
            file: f.name,
            line: idx + 1,
            severity: "Critical",
            description: "Loop structure runs indefinitely without any break, return, or throw statements, which will freeze the execution thread or browser client.",
            solution: "Ensure a clear boundary check or counter update with a break condition is present in the block.",
            oldCode: line.trim(),
            newCode: "// Add exit condition break; inside this loop"
          });
        }
      }

      // 5. Resource/Handle Leak
      if ((line.includes("fs.open(") || line.includes("db.connect(") || line.includes("new Client(")) && !content.includes(".close()") && !content.includes(".end()") && !content.includes(".release()")) {
        bugIssues.push({
          category: "Potential Resource Leak",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Opened resource (file descriptor, database connection pool client) does not have a matching close/release/end call in the file scope, risking resource exhaustion.",
          solution: "Ensure resource connections are released inside a finally block.",
          oldCode: line.trim(),
          newCode: "try { const client = await pool.connect(); } finally { client.release(); }"
        });
      }

      // 6. Unsafe Floating-Point Comparisons
      if (line.match(/\b(==|===|!=|!==)\s*[0-9]+\.[0-9]+\b/) || line.match(/\b[0-9]+\.[0-9]+\s*(==|===|!=|!==)\b/)) {
        bugIssues.push({
          category: "Unsafe Floating-Point Comparison",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "Comparing floating-point numbers directly for equality can lead to inaccurate logical decisions due to precision representation errors in binary fractions.",
          solution: "Use a threshold tolerance boundary check (e.g., Math.abs(x - y) < Number.EPSILON).",
          oldCode: line.trim(),
          newCode: "Math.abs(value - 0.1) < Number.EPSILON"
        });
      }

      // 7. Generic Exception Catching (Silent / Obscured Failures)
      if (line.includes("catch") && (line.includes("Error") || line.includes("Exception") || line.includes("Throwable") || line.includes("err") || line.includes("e"))) {
        const subsequentBlock = lines.slice(idx, idx + 5).join("\n");
        if (!subsequentBlock.includes(".message") && !subsequentBlock.includes(".stack") && !subsequentBlock.includes("throw") && (subsequentBlock.includes("console.log") || subsequentBlock.includes("logger."))) {
          bugIssues.push({
            category: "Generic Exception Obscuration",
            file: f.name,
            line: idx + 1,
            severity: "Low",
            description: "Generic exception caught and logged without printing the error details, stack traces, or rethrowing, which obscures the actual cause of failure.",
            solution: "Log the full exception object or error message stack details.",
            oldCode: line.trim(),
            newCode: "catch (error) { console.error('Failed to parse details', error); }"
          });
        }
      }

      // 8. Potential Null Pointer Dereference
      if (line.match(/\b(user|profile|config|data|result)\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\b/) && !line.includes("?.") && !line.includes("!") && !line.includes("typeof")) {
        bugIssues.push({
          category: "Potential Null Pointer Dereference",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "Accessing nested attributes on dynamic structures (like user, config, or result) without optional chaining or safety checks risks throwing 'Cannot read properties of undefined' crashes.",
          solution: "Use optional chaining (e.g. user?.profile?.address) or enforce guard clauses.",
          oldCode: line.trim(),
          newCode: line.replace(/\b(user|profile|config|data|result)\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\b/g, "$1?.$2?.$3").trim()
        });
      }
    });
  });

  return bugIssues;
}

/**
 * Sweeps codebase files for code smells.
 */
export function sweepCodeSmells(files: Array<{ name: string; content?: string }>) {
  const smells: any[] = [];

  files.forEach(f => {
    if (!f.content) return;
    const content = f.content;
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // 1. Empty catch block
      if (line.includes("catch") && (line.includes("{}") || (idx + 1 < lines.length && lines[idx + 1].trim() === "}"))) {
        smells.push({
          category: "Empty Catch Block",
          file: f.name,
          line: idx + 1,
          severity: "Low",
          description: "An exception is caught but silently ignored with an empty block. This hides runtime failure root causes and complicates debugging.",
          solution: "Log the exception error parameter using console.error(err) or rethrow.",
          oldCode: line.trim(),
          newCode: line.replace(/\{\s*\}/, "{ console.error(error); }").trim()
        });
      }

      // 2. TODO / FIXME annotations
      if (line.includes("TODO") || line.includes("FIXME")) {
        if (!line.includes("TODO:") && !line.includes("FIXME:")) return;
        smells.push({
          category: "Leftover Developer Annotation (TODO/FIXME)",
          file: f.name,
          line: idx + 1,
          severity: "Low",
          description: "Developer comment annotation found indicating unfinished work or technical debt left in production codebase.",
          solution: "Resolve the pending technical debt and remove the TODO/FIXME comments.",
          oldCode: line.trim(),
          newCode: "// Code implementation finalized"
        });
      }

      // 3. Excess function parameters (> 4 parameters)
      const funcMatch = line.match(/\bfunction\s*[a-zA-Z0-9_]*\s*\(([^)]+)\)/) || line.match(/const\s*[a-zA-Z0-9_]+\s*=\s*\(([^)]+)\)\s*=>/);
      if (funcMatch) {
        const params = funcMatch[1].split(",");
        if (params.length > 4) {
          smells.push({
            category: "Excess Function Parameters",
            file: f.name,
            line: idx + 1,
            severity: "Medium",
            description: `Function defined with ${params.length} parameters. Having more than 4 arguments makes the method signatures fragile, hard to read, and difficult to mock during tests.`,
            solution: "Refactor parameters list into a single options DTO object parameter.",
            oldCode: line.trim(),
            newCode: "function methodRefactored(options: any) {"
          });
        }
      }

      // 4. Callback Hell / Deeply Nested Closures
      let bracketCount = (line.match(/\{/g) || []).length;
      let closeBracketCount = (line.match(/\}/g) || []).length;
      if (bracketCount - closeBracketCount > 3 && (line.includes("=>") || line.includes("function"))) {
        smells.push({
          category: "Callback Hell / Nested Closures",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "Deeply nested closures or callbacks reduce maintainability and make execution flow hard to follow.",
          solution: "Flatten nested callbacks by using async/await promises or separate helper functions.",
          oldCode: line.trim(),
          newCode: "const result = await fetchDetails();"
        });
      }

      // 5. Magic Numbers
      const magicMatch = line.match(/\b(===|==|!==|!=|<|>|<=|>=)\s*([3-9][0-9]|[1-9][0-9]{2,})\b/);
      if (magicMatch && !line.includes("status") && !line.includes("port") && !line.includes("3000") && !line.includes("8080") && !line.includes("100") && !line.includes("1000")) {
        smells.push({
          category: "Magic Number Usage",
          file: f.name,
          line: idx + 1,
          severity: "Low",
          description: `Hardcoded numeric literal '${magicMatch[2]}' used in logical comparison. Magic numbers obscure intent and make updates difficult.`,
          solution: "Extract the magic number into a descriptively named constant.",
          oldCode: line.trim(),
          newCode: `const DEFAULT_THRESHOLD_LIMIT = ${magicMatch[2]};`
        });
      }

      // 6. Commented-Out Code
      if (line.trim().startsWith("//") && (line.includes("const ") || line.includes("let ") || line.includes("var ") || line.includes("function ") || line.includes("console.log") || line.includes("import ") || line.includes("if (") || line.includes("return "))) {
        smells.push({
          category: "Commented-Out Source Code",
          file: f.name,
          line: idx + 1,
          severity: "Low",
          description: "Source code comments found. Unused code left in comments clutters files and gets out of date quickly.",
          solution: "Remove commented-out code blocks; trust git version control history to retrieve deleted code.",
          oldCode: line.trim(),
          newCode: ""
        });
      }

      // 7. Naming Convention Mismatch
      const varMatch = line.match(/\b(const|let|var)\s+([a-zA-Z0-9_]+)\b/);
      if (varMatch) {
        const varName = varMatch[2];
        if (varName.includes("_") && varName !== varName.toUpperCase() && !varName.startsWith("_") && !line.includes("=")) {
          smells.push({
            category: "Naming Convention Violation",
            file: f.name,
            line: idx + 1,
            severity: "Low",
            description: `Variable '${varName}' is declared using snake_case instead of standard camelCase.`,
            solution: `Rename the variable to camelCase format, e.g. ${varName.replace(/_([a-z])/g, (_, g) => g.toUpperCase())}.`,
            oldCode: line.trim(),
            newCode: `const ${varName.replace(/_([a-z])/g, (_, g) => g.toUpperCase())} = ...;`
          });
        }
      }
    });
  });

  return smells;
}

/**
 * Scans files to estimate code clones / duplication percentages.
 */
export function detectDuplications(files: Array<{ name: string; content?: string }>) {
  const duplications: any[] = [];
  const linesMap = new Map<string, { raw: string; files: string[] }>();

  files.forEach(f => {
    if (!f.content) return;
    const lines = f.content.split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 10 && !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*") && !l.startsWith("import"));
    
    for (let i = 0; i < lines.length - 3; i++) {
      const rawChunk = lines.slice(i, i + 4).join("\n");
      const normalizedChunk = rawChunk
        .replace(/\s+/g, "")
        .replace(/;+/g, "")
        .replace(/['"`]/g, "");

      if (normalizedChunk.length < 35) continue;

      if (!linesMap.has(normalizedChunk)) {
        linesMap.set(normalizedChunk, { raw: rawChunk, files: [] });
      }
      linesMap.get(normalizedChunk)!.files.push(f.name);
    }
  });

  let duplicateBlocksCount = 0;
  const recordedFiles = new Set<string>();

  for (const [_, entry] of linesMap.entries()) {
    const uniqueOccurrences = Array.from(new Set(entry.files));
    if (uniqueOccurrences.length > 1) {
      duplicateBlocksCount++;
      uniqueOccurrences.forEach(file => recordedFiles.add(file));
      if (duplications.length < 5) {
        duplications.push({
          chunk: entry.raw.substring(0, 100) + "...",
          files: uniqueOccurrences
        });
      }
    }
  }

  const percentage = files.length > 0 ? Math.min(60, Math.round((recordedFiles.size / files.length) * 100)) : 0;

  return {
    percentage,
    blocks: duplications,
    detail: duplicateBlocksCount > 0 
      ? `Detected ${duplicateBlocksCount} identical multi-line code chunks shared across ${recordedFiles.size} files.`
      : "CodeScope confirms 0 duplicated code clones inside analyzed workspace."
  };
}

/**
 * Sweeps codebase files for license and GDPR/PII compliance violations.
 */
export function sweepCompliance(files: Array<{ name: string; content?: string }>) {
  const complianceIssues: any[] = [];

  files.forEach(f => {
    if (!f.content) return;
    const content = f.content;
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      // 1. GDPR/PII Leak (exposed credit cards or clear email formats in database mocks or configs)
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
      if (emailRegex.test(line) && (line.includes("password") || line.includes("user") || line.includes("log") || line.includes("admin")) && !line.includes("EXAMPLE") && !line.includes("mock") && !line.includes("@google/")) {
        complianceIssues.push({
          category: "Exposed PII (GDPR Non-Compliance)",
          file: f.name,
          line: idx + 1,
          severity: "High",
          description: "Detected potential raw personally identifiable information (PII) like email addresses mapped directly inside logic configurations or logging instructions, violating GDPR directives.",
          solution: "Mask personal identity parameters or load profile mappings dynamically from an encrypted database.",
          oldCode: line.trim(),
          newCode: line.replace(emailRegex, "masked_user_pii@domain.com").trim()
        });
      }

      // 2. IP Address hardcoded leakage
      const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      if (ipRegex.test(line) && !line.includes("127.0.0.1") && !line.includes("0.0.0.0") && !line.includes("localhost")) {
        complianceIssues.push({
          category: "Hardcoded IP Target Address",
          file: f.name,
          line: idx + 1,
          severity: "Medium",
          description: "Detected a hardcoded server IP address literal, which can bypass authentication systems or expose internal network nodes.",
          solution: "Load server hosts dynamically via encrypted config providers.",
          oldCode: line.trim(),
          newCode: line.replace(ipRegex, "process.env.DB_HOST_ADDRESS").trim()
        });
      }

      // 3. Sensitive Credit Card numbers (PII)
      const ccRegex = /\b(?:\d[ -]*?){13,16}\b/;
      if (ccRegex.test(line) && (line.includes("card") || line.includes("cc") || line.includes("visa"))) {
        complianceIssues.push({
          category: "Exposed Credit Card Data (PCI-DSS Violation)",
          file: f.name,
          line: idx + 1,
          severity: "Critical",
          description: "Detected potential credit card account number strings defined as literals in source code, violating PCI-DSS data compliance protocols.",
          solution: "Mask card numbers immediately and delete them from all historical repository revisions.",
          oldCode: line.trim(),
          newCode: "const MASKED_CARD = 'XXXX-XXXX-XXXX-XXXX';"
        });
      }
    });

    // 4. GPL License Check
    if (f.name.includes("package.json") && content.includes("gpl")) {
      complianceIssues.push({
        category: "GPL Copyleft License Warning",
        file: f.name,
        line: 1,
        severity: "Low",
        description: "Project relies on components carrying GPL licenses. The viral nature of GPL copyleft rules requires you to open-source the complete project code under GPL guidelines.",
        solution: "Replace GPL libraries with permissive alternatives (MIT, Apache 2.0, or BSD).",
        oldCode: "gpl",
        newCode: "MIT"
      });
    }
  });

  return complianceIssues;
}
