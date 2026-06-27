import { CodeScopeAnalysis } from "../../types";

export const expressPrisma: CodeScopeAnalysis = {
  projectName: "Express + Prisma Backend API",
  healthScore: 94,
  healthReasons: [
    {
      category: "Maintainability Index",
      score: 96,
      description: "Immaculate architecture. Clean functional controllers with fully decoupled Prisma repositories.",
      recommendation: "Keep using strict Type Assertions on relational database outputs."
    },
    {
      category: "Security Health",
      score: 91,
      description: "Robust JWT access, environment configuration secrets are securely loaded via dotenv and parsed through custom schema validators.",
      recommendation: "Integrate Helmet.js middleware headers to increase basic browser protection."
    }
  ],
  projectDNA: {
    languages: [
      { name: "TypeScript", percentage: 95 },
      { name: "SQL", percentage: 5 }
    ],
    frameworks: ["Express", "Prisma Client", "Zod"],
    databases: ["PostgreSQL"],
    infrastructure: ["Docker", "Redis", "Vite"],
    authentication: ["JWT", "Bcrypt"]
  },
  architecture: {
    style: "Layered Monolith",
    confidence: 94,
    explanation: "Clear decoupling between route definitions, request-handling controllers, business services, and database schemas mapped via PrismaClient.",
    diagrams: [
      { source: "App Router", target: "UserController", type: "Forwards requests" },
      { source: "UserController", target: "UserService", type: "Calls Methods" },
      { source: "UserService", target: "PrismaClient", type: "Executes ORM Queries" }
    ]
  },
  modules: [
    {
      name: "src/controllers",
      type: "HTTP API Handlers",
      classes: ["UserController", "OrderController", "PaymentController"],
      interfaces: [],
      endpoints: ["GET /api/users", "POST /api/orders"],
      entities: [],
      dependencies: ["src/services"]
    },
    {
      name: "src/services",
      type: "Business Operations",
      classes: ["UserService", "OrderService", "StripeService"],
      interfaces: [],
      endpoints: [],
      entities: [],
      dependencies: ["src/db"]
    }
  ],
  dependencyGraph: {
    nodes: [
      { id: "Express", label: "Express App Router", type: "middleware" },
      { id: "UserController", label: "UserController", type: "controller" },
      { id: "UserService", label: "UserService", type: "service" },
      { id: "Prisma", label: "Prisma Client (ORM)", type: "repository" },
      { id: "PostgreSQL", label: "PostgreSQL Database", type: "database" }
    ],
    edges: [
      { source: "Express", target: "UserController" },
      { source: "UserController", target: "UserService" },
      { source: "UserService", target: "Prisma" },
      { source: "Prisma", target: "PostgreSQL" }
    ]
  },
  endpoints: [
    {
      method: "GET",
      url: "/api/users",
      description: "Lists active members.",
      auth: "JWT",
      middlewares: ["validateToken"],
      requestDto: "Query params: skip, take",
      responseDto: "User[]",
      sqlQuery: "SELECT id, email, username FROM \"User\" LIMIT $1 OFFSET $2",
      flow: ["Express Router", "validateToken", "UserController.getUsers()", "UserService.findAll()", "PrismaClient.user.findMany()", "PostgreSQL", "Response JSON"]
    }
  ],
  database: {
    tables: [
      {
        name: "User",
        columns: [
          { name: "id", type: "uuid", constraints: "PRIMARY KEY" },
          { name: "email", type: "varchar", constraints: "UNIQUE, NOT NULL" },
          { name: "name", type: "varchar" }
        ],
        relationships: []
      }
    ]
  },
  refactoring: [],
  security: [
    {
      category: "SQL Injection",
      file: "UserRepository.ts",
      line: 11,
      severity: "Critical",
      description: "Direct string interpolation of parameters into raw SQL query strings inside DB client execution paths. This completely bypasses standard parameterization boundaries and allows attackers to hijack complete PostgreSQL tables.",
      solution: "Migrate raw string formatting to standard parameterized prepared statements: replace dynamic variables with positional parameters ($1) and pass arrays of values as inputs.",
      oldCode: "    const query = `SELECT * FROM users WHERE active = true AND id = ${userId}`;\n    return this.db.query(query);",
      newCode: "    return this.db.query('SELECT * FROM users WHERE active = true AND id = $1', [userId]);"
    }
  ],
  performance: [
    {
      issue: "N+1 Prisma Query Loading",
      file: "UserController.ts",
      line: 7,
      severity: "Medium",
      description: "Fetching users sequentially inside a custom loop.",
      suggestedOptimization: "Use Prisma include/select attributes to batch-load relations.",
      oldCode: "const users = await this.userService.findAll(Number(page), Number(limit));",
      newCode: "const users = await this.userService.findAllWithDetails(Number(page), Number(limit));"
    }
  ],
  bugs: [
    {
      category: "Unhandled Rejection Risk",
      file: "UserController.ts",
      line: 13,
      severity: "High",
      description: "Creating a user using this.userService.register without a try-catch block can crash the server processes if email is a duplicate.",
      solution: "Wrap user creation operations in try-catch blocks and return standard error responses.",
      oldCode: "const user = await this.userService.register({ username, email, password });",
      newCode: "try {\n  const user = await this.userService.register({ username, email, password });\n} catch (err) {\n  return res.status(409).json({ error: 'Email already registered' });\n}"
    }
  ],
  codeSmells: [
    {
      category: "Hardcoded Pagination Limit",
      file: "UserController.ts",
      line: 6,
      severity: "Low",
      description: "Default limit value is hardcoded (10) instead of using a global configuration object.",
      solution: "Move page size parameter settings to config parameters.",
      oldCode: "const { page = 1, limit = 10 } = req.query;",
      newCode: "const { page = 1, limit = CONFIG.DEFAULT_PAGE_SIZE } = req.query;"
    }
  ],
  compliance: [
    {
      category: "GDPR User Erasure Violation",
      file: "UserRepository.ts",
      line: 15,
      severity: "High",
      description: "Hard deleting user entries without cleaning their session log archives.",
      solution: "Mark entries as deleted or run anonymization jobs.",
      oldCode: "return this.db.query('DELETE FROM users WHERE id = $1', [userId]);",
      newCode: "return this.db.query('UPDATE users SET deleted_at = NOW(), email = anonymize(email) WHERE id = $1', [userId]);"
    }
  ],
  gitInsights: [
    {
      file: "UserController.ts",
      commitsCount: 18,
      authorsCount: 2,
      churnRate: 45,
      riskScore: 50
    },
    {
      file: "UserRepository.ts",
      commitsCount: 12,
      authorsCount: 1,
      churnRate: 20,
      riskScore: 32
    }
  ],
  crashLogs: [
    {
      id: "crash-fintech-1",
      timestamp: new Date().toISOString(),
      level: "error",
      message: "PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)",
      exceptionName: "PrismaClientKnownRequestError",
      file: "UserController.ts",
      line: 13,
      stackTrace: [
        "at UserController.createUser (UserController.ts:13)",
        "at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95)"
      ],
      resolved: false
    }
  ],
  importAnalysis: {
    largestFiles: [
      { file: "src/services/OrderService.ts", size: "18.2 KB" },
      { file: "src/controllers/UserController.ts", size: "12.1 KB" }
    ],
    circularDependencies: [],
    packageCouplingScore: 12
  },
  runtimeFlow: [
    {
      label: "Basic API Request Flow",
      steps: [
        { name: "GET /api/users", component: "Express Router", description: "Parses path rules and schedules controller action." },
        { name: "UserController", component: "REST API Controller", description: "Unpacks inputs and validates pagination schemas using Zod." },
        { name: "UserService", component: "Business Service Engine", description: "Applies filters and executes repository calls." },
        { name: "Prisma Client", component: "Query Planner", description: "Binds inputs, optimizes JSON rules and triggers raw SQL query." }
      ]
    }
  ]
};
