import { CodeScopeAnalysis } from "../../types";

export const laravelBlog: CodeScopeAnalysis = {
  projectName: "Laravel Core CMS Engine",
  healthScore: 84,
  healthReasons: [
    {
      category: "Maintainability Index",
      score: 80,
      description: "Solid Eloquent patterns, but heavy Controller logic leaks. Fat Controllers, slim Service classes.",
      recommendation: "Introduce FormRequest validating entities and extract domain calculations out of standard HTTP Controllers."
    },
    {
      category: "Duplicate Code",
      score: 75,
      description: "Repeated post state queries, status validations, and author permission assertions across multiple dashboard pages.",
      recommendation: "Create robust custom Eloquent Query Scopes and global HTTP route policies."
    },
    {
      category: "Security Checks",
      score: 92,
      description: "Excellent protection because CSRF protection and Eloquent injection prevention filters are active on all routes.",
      recommendation: "Enable explicit secure cookie settings in session configuration files."
    }
  ],
  projectDNA: {
    languages: [
      { name: "PHP", percentage: 75 },
      { name: "JavaScript", percentage: 15 },
      { name: "CSS", percentage: 10 }
    ],
    frameworks: ["Laravel 11", "Inertia.js", "Tailwind CSS"],
    databases: ["MySQL"],
    infrastructure: ["Docker", "Redis", "Nginx"],
    authentication: ["Session-based (Sanctum)"]
  },
  architecture: {
    style: "Model-View-Controller (MVC)",
    confidence: 96,
    explanation: "Standard Laravel routing mappings directly loading controller responses which return views/resources coupled to Eloquent Models.",
    diagrams: [
      { source: "Route Engine", target: "PostController", type: "Routes request" },
      { source: "PostController", target: "PostModel", type: "Eloquent CRUD" },
      { source: "PostModel", target: "MySQL", type: "DB Query" }
    ]
  },
  modules: [
    {
      name: "app/Http/Controllers",
      type: "HTTP Handlers",
      classes: ["PostController", "CommentController", "UserController", "DashboardController"],
      interfaces: [],
      endpoints: ["GET /posts", "POST /posts", "POST /posts/{id}/comments"],
      entities: [],
      dependencies: ["app/Models"]
    },
    {
      name: "app/Models",
      type: "Eloquent ORM",
      classes: ["Post", "Comment", "User", "Tag"],
      interfaces: [],
      endpoints: [],
      entities: ["Post", "Comment", "User", "Tag"],
      dependencies: []
    }
  ],
  dependencyGraph: {
    nodes: [
      { id: "Router", label: "Web/API Route Manager", type: "middleware" },
      { id: "PostController", label: "PostController", type: "controller" },
      { id: "CommentController", label: "CommentController", type: "controller" },
      { id: "Post", label: "Post (Model)", type: "repository" },
      { id: "Comment", label: "Comment (Model)", type: "repository" },
      { id: "MySQL", label: "MySQL Database", type: "database" }
    ],
    edges: [
      { source: "Router", target: "PostController" },
      { source: "Router", target: "CommentController" },
      { source: "PostController", target: "Post" },
      { source: "CommentController", target: "Comment" },
      { source: "Post", target: "Comment", label: "HasMany Relation" },
      { source: "Post", target: "MySQL" },
      { source: "Comment", target: "MySQL" }
    ]
  },
  endpoints: [
    {
      method: "GET",
      url: "/posts",
      description: "Renders landing page feed containing latest published blog items.",
      auth: "Public Access",
      middlewares: ["web"],
      requestDto: "Query: search, tag",
      responseDto: "Blade Template View render / inertia",
      sqlQuery: "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 15",
      flow: ["HTTP Get", "web Middleware Group", "PostController.index()", "Post::whereStatus()", "MySQL Execute", "Blade Render"]
    }
  ],
  database: {
    tables: [
      {
        name: "users",
        columns: [
          { name: "id", type: "bigint unsigned", constraints: "PRIMARY KEY, AUTO_INCREMENT" },
          { name: "name", type: "varchar(255)", constraints: "NOT NULL" },
          { name: "email", type: "varchar(255)", constraints: "NOT NULL, UNIQUE" },
          { name: "password", type: "varchar(255)", constraints: "NOT NULL" }
        ],
        relationships: [
          { targetTable: "posts", type: "one-to-many", foreignKey: "author_id" }
        ]
      },
      {
        name: "posts",
        columns: [
          { name: "id", type: "bigint unsigned", constraints: "PRIMARY KEY, AUTO_INCREMENT" },
          { name: "author_id", type: "bigint unsigned", constraints: "FOREIGN KEY REFERENCES users(id)" },
          { name: "title", type: "varchar(255)", constraints: "NOT NULL" },
          { name: "slug", type: "varchar(255)", constraints: "NOT NULL, UNIQUE" },
          { name: "content", type: "text", constraints: "NOT NULL" }
        ],
        relationships: [
          { targetTable: "users", type: "many-to-one", foreignKey: "author_id" }
        ]
      }
    ]
  },
  refactoring: [
    {
      file: "PostController.php",
      loc: 480,
      complexity: 35,
      risk: "High",
      suggestion: "Move custom file storage image processing and thumbnail resizing logic out of store() Controller and into dedicated Jobs.",
      benefit: "Allows responsive media generation asynchronously, resulting in 4x faster API request speeds."
    }
  ],
  security: [
    {
      category: "Cross-Site Scripting (XSS)",
      file: "resources/views/posts/show.blade.php",
      line: 14,
      severity: "High",
      description: "Direct rendering of unescaped rich editor input data {!! $post->content !!} can lead to XSS attacks if content is not properly sanitized.",
      solution: "Integrate HTML Purifier library, sanitizing post bodies, or fallback to standard escaped tags {{ $post->content }} when markup formats are unrequired.",
      oldCode: "<div class=\"body\">\n    {!! $post->content !!}\n</div>",
      newCode: "<div class=\"body\">\n    {!! clean($post->content) !!}\n</div>"
    }
  ],
  performance: [
    {
      issue: "N+1 Eloquent Loading",
      file: "PostController.php",
      line: 12,
      severity: "High",
      description: "Iterating through user posts without eager-loading relational user details: Post::all() inside post loops.",
      suggestedOptimization: "Eager load relationships using Eloquent's with method: Post::with('author')->get()",
      oldCode: "$posts = Post::all();",
      newCode: "$posts = Post::with('author')->get();"
    }
  ],
  bugs: [
    {
      category: "Undefined Array Index",
      file: "PostController.php",
      line: 18,
      severity: "Medium",
      description: "Attempting to access slug parameters directly without validating input fields mapping or route patterns.",
      solution: "Add request validation layer or fallback defaults.",
      oldCode: "$post = Post::where('slug', $slug)->firstOrFail();",
      newCode: "if (!$slug) {\n    abort(404, 'Post slug required');\n}\n$post = Post::where('slug', $slug)->firstOrFail();"
    }
  ],
  codeSmells: [
    {
      category: "Fat Controller",
      file: "PostController.php",
      line: 8,
      severity: "Low",
      description: "PostController handles both HTML view formatting and raw query fetching directly.",
      solution: "Introduce a dedicated PostService layers.",
      oldCode: "public function index()\n{\n    $posts = Post::all();\n    return view('posts.index', compact('posts'));\n}",
      newCode: "public function index(PostService $service)\n{\n    return view('posts.index', ['posts' => $service->getPublishedPosts()]);\n}"
    }
  ],
  compliance: [
    {
      category: "GPL License Dependency Alert",
      file: "composer.json",
      line: 6,
      severity: "Medium",
      description: "Project includes dependency under viral GPL license, which might impose distribution constraints.",
      solution: "Replace dependency with BSD or MIT licensed equivalent library.",
      oldCode: "\"gpl-viral-helper/library\": \"^1.0\"",
      newCode: "\"mit-clean-helper/library\": \"^1.0\""
    }
  ],
  gitInsights: [
    {
      file: "PostController.php",
      commitsCount: 15,
      authorsCount: 2,
      churnRate: 35,
      riskScore: 40
    },
    {
      file: "Post.php",
      commitsCount: 8,
      authorsCount: 1,
      churnRate: 10,
      riskScore: 18
    }
  ],
  crashLogs: [
    {
      id: "crash-microservice-1",
      timestamp: new Date().toISOString(),
      level: "error",
      message: "ModelNotFoundException: No query results for model [App\\Models\\Post]",
      exceptionName: "ModelNotFoundException",
      file: "PostController.php",
      line: 18,
      stackTrace: [
        "at PostController.show (PostController.php:18)",
        "at Pipeline.then (Illuminate\\Pipeline\\Pipeline.php:103)"
      ],
      resolved: false
    }
  ],
  importAnalysis: {
    largestFiles: [
      { file: "PostController.php", size: "32.4 KB" },
      { file: "Post.php", size: "12.5 KB" }
    ],
    circularDependencies: [],
    packageCouplingScore: 25
  },
  runtimeFlow: [
    {
      label: "Reading Blog Post Journey",
      steps: [
        { name: "GET /posts/{slug}", component: "Route Engine", description: "Checks slug constraints and schedules parameters." },
        { name: "web Middleware", component: "Laravel HTTP Core", description: "Verifies session IDs, triggers CSRF checks, updates encryption states." },
        { name: "PostController.show", component: "Controller API Gateway", description: "Extracts matched slug bindings, queries Eloquent models." },
        { name: "Post::whereSlug()", component: "Eloquent ORM", description: "Translates query rules, eager loads related tags and user details." },
        { name: "SELECT * FROM posts...", component: "MySQL Database", description: "Returns selected content records." },
        { name: "Inertia/Blade Render", component: "View Layer", description: "Assembles final templates and outputs response headers." }
      ]
    }
  ]
};
