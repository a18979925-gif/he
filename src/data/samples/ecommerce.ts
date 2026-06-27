import { CodeScopeAnalysis } from "../../types";

export const springBootEcommerce: CodeScopeAnalysis = {
  projectName: "Spring Boot E-Commerce Suite",
  healthScore: 91,
  healthReasons: [
    {
      category: "Cyclomatic Complexity",
      score: 92,
      description: "Low branch density inside Controller layers. Clean loops and optimized conditional blocks.",
      recommendation: "Maintain the existing level of class extraction and avoid adding multi-tier if nested statements."
    },
    {
      category: "Security Auditing",
      score: 88,
      description: "Spring Security is fully integrated with standard RBAC, but two OAuth endpoints bypass security contexts without direct auditing.",
      recommendation: "Ensure explicit log tracing is attached to all state-changing OAuth callback methods."
    },
    {
      category: "Maintainability Index",
      score: 94,
      description: "Outstanding decoupling. Business calculations reside strictly in Service interfaces. No SQL logic leaks.",
      recommendation: "Adopt standard Mapstruct decorators to streamline DTO to Entity mapping boilerplate."
    },
    {
      category: "Documentation Coverage",
      score: 90,
      description: "Javadoc is fully written on 90% of interfaces. Swagger UI endpoint specifications are kept up to date.",
      recommendation: "Add package-info.java summaries to describe architectural boundaries of domain modules."
    }
  ],
  projectDNA: {
    languages: [
      { name: "Java", percentage: 88 },
      { name: "SQL", percentage: 8 },
      { name: "XML", percentage: 4 }
    ],
    frameworks: ["Spring Boot", "Spring Security", "Spring Data JPA"],
    databases: ["PostgreSQL"],
    infrastructure: ["Docker", "Kubernetes", "Redis", "Elasticsearch"],
    authentication: ["OAuth2", "JWT"]
  },
  architecture: {
    style: "Domain-Driven Design (DDD)",
    confidence: 84,
    explanation: "Explicit group boundaries around aggregate roots. Entities are isolated from web handlers, using strict hexagonal port mapping.",
    diagrams: [
      { source: "Gateway", target: "AuthService", type: "Calls JWT Verify" },
      { source: "OrderController", target: "OrderCommandService", type: "Delegates Write" },
      { source: "OrderCommandService", target: "OrderRepository", type: "Saves State" },
      { source: "OrderRepository", target: "PostgreSQL", type: "SQL Query" }
    ]
  },
  modules: [
    {
      name: "com.ecommerce.orders",
      type: "Order Bounded Context",
      classes: ["OrderController", "OrderCommandService", "OrderQueryService", "OrderRepository", "OrderAggregate"],
      interfaces: ["IOrderCommandService", "IOrderRepository"],
      endpoints: ["POST /orders", "GET /orders/{id}", "PUT /orders/{id}/cancel"],
      entities: ["Order", "OrderItem", "ShippingAddress"],
      dependencies: ["com.ecommerce.users", "com.ecommerce.inventory"]
    },
    {
      name: "com.ecommerce.catalog",
      type: "Product Catalog Context",
      classes: ["ProductController", "ProductService", "ProductSearchRepository"],
      interfaces: ["IProductService"],
      endpoints: ["GET /products", "GET /products/{id}", "POST /products/search"],
      entities: ["Product", "Category", "Review"],
      dependencies: []
    },
    {
      name: "com.ecommerce.users",
      type: "User Identity Context",
      classes: ["AuthController", "UserController", "UserService", "UserRepository"],
      interfaces: ["IUserService"],
      endpoints: ["POST /auth/login", "POST /auth/register", "GET /users/me"],
      entities: ["User", "Role", "Permission"],
      dependencies: []
    }
  ],
  dependencyGraph: {
    nodes: [
      { id: "Gateway", label: "API Gateway (Zuul)", type: "middleware" },
      { id: "AuthController", label: "AuthController", type: "controller" },
      { id: "OrderController", label: "OrderController", type: "controller" },
      { id: "ProductController", label: "ProductController", type: "controller" },
      { id: "AuthService", label: "AuthService", type: "service" },
      { id: "OrderService", label: "OrderService", type: "service" },
      { id: "ProductService", label: "ProductService", type: "service" },
      { id: "PaymentService", label: "PaymentService (Stripe)", type: "service" },
      { id: "UserRepository", label: "UserRepository", type: "repository" },
      { id: "OrderRepository", label: "OrderRepository", type: "repository" },
      { id: "ProductRepository", label: "ProductRepository", type: "repository" },
      { id: "PostgreSQL", label: "PostgreSQL Database", type: "database" }
    ],
    edges: [
      { source: "Gateway", target: "AuthController", label: "Route match" },
      { source: "Gateway", target: "OrderController", label: "Route match" },
      { source: "Gateway", target: "ProductController", label: "Route match" },
      { source: "AuthController", target: "AuthService" },
      { source: "OrderController", target: "OrderService" },
      { source: "ProductController", target: "ProductService" },
      { source: "OrderService", target: "PaymentService", label: "Stripe Charge" },
      { source: "AuthService", target: "UserRepository" },
      { source: "OrderService", target: "OrderRepository" },
      { source: "ProductService", target: "ProductRepository" },
      { source: "UserRepository", target: "PostgreSQL" },
      { source: "OrderRepository", target: "PostgreSQL" },
      { source: "ProductRepository", target: "PostgreSQL" }
    ]
  },
  endpoints: [
    {
      method: "POST",
      url: "/orders",
      description: "Submits a new purchase transaction and dispatches confirmation event.",
      auth: "JWT Bearer Required",
      middlewares: ["JwtVerificationFilter", "ThrottleFilter"],
      requestDto: "OrderCreationRequest (items: List<CartItem>, couponCode: String)",
      responseDto: "OrderReceiptDto (id: UUID, total: BigDecimal, trackingNumber: String)",
      sqlQuery: "INSERT INTO orders (id, user_id, total, status) VALUES (?, ?, ?, ?)",
      flow: ["Zuul Gateway", "JwtVerificationFilter", "OrderController.createOrder()", "OrderService.placeOrder()", "PaymentService.charge()", "OrderRepository.save()", "EventPublisher.dispatchOrderPlaced()", "PostgreSQL Commit"]
    },
    {
      method: "GET",
      url: "/products",
      description: "Retrieves a list of active storefront products supporting multi-faceted filters.",
      auth: "Public Access",
      middlewares: ["CacheHeadersFilter"],
      requestDto: "Query: category, minPrice, maxPrice, inStock",
      responseDto: "ProductPageDto",
      sqlQuery: "SELECT * FROM products p WHERE p.price BETWEEN ? AND ? AND p.stock > 0 LIMIT ?",
      flow: ["Zuul Gateway", "CacheHeadersFilter", "ProductController.getProducts()", "ProductService.searchProducts()", "ProductRepository.queryAll()", "PostgreSQL", "Response Page DTO"]
    }
  ],
  database: {
    tables: [
      {
        name: "users",
        columns: [
          { name: "id", type: "bigint", constraints: "PRIMARY KEY, AUTO_INCREMENT" },
          { name: "email", type: "varchar(255)", constraints: "NOT NULL, UNIQUE" },
          { name: "password_hash", type: "varchar(100)", constraints: "NOT NULL" },
          { name: "full_name", type: "varchar(100)" },
          { name: "role", type: "varchar(50)", constraints: "DEFAULT 'CUSTOMER'" }
        ],
        relationships: [
          { targetTable: "orders", type: "one-to-many", foreignKey: "user_id" }
        ]
      },
      {
        name: "orders",
        columns: [
          { name: "id", type: "uuid", constraints: "PRIMARY KEY" },
          { name: "user_id", type: "bigint", constraints: "FOREIGN KEY REFERENCES users(id)" },
          { name: "status", type: "varchar(50)", constraints: "NOT NULL" },
          { name: "total_amount", type: "numeric(12,2)", constraints: "NOT NULL" },
          { name: "created_at", type: "timestamp", constraints: "DEFAULT NOW()" }
        ],
        relationships: [
          { targetTable: "users", type: "many-to-one", foreignKey: "user_id" },
          { targetTable: "order_items", type: "one-to-many", foreignKey: "order_id" }
        ]
      },
      {
        name: "order_items",
        columns: [
          { name: "id", type: "bigint", constraints: "PRIMARY KEY, AUTO_INCREMENT" },
          { name: "order_id", type: "uuid", constraints: "FOREIGN KEY REFERENCES orders(id) ON DELETE CASCADE" },
          { name: "product_id", type: "bigint", constraints: "FOREIGN KEY REFERENCES products(id)" },
          { name: "quantity", type: "integer", constraints: "NOT NULL CHECK (quantity > 0)" },
          { name: "unit_price", type: "numeric(10,2)", constraints: "NOT NULL" }
        ],
        relationships: [
          { targetTable: "orders", type: "many-to-one", foreignKey: "order_id" },
          { targetTable: "products", type: "many-to-one", foreignKey: "product_id" }
        ]
      },
      {
        name: "products",
        columns: [
          { name: "id", type: "bigint", constraints: "PRIMARY KEY, AUTO_INCREMENT" },
          { name: "name", type: "varchar(255)", constraints: "NOT NULL" },
          { name: "sku", type: "varchar(50)", constraints: "NOT NULL, UNIQUE" },
          { name: "price", type: "numeric(10,2)", constraints: "NOT NULL" },
          { name: "stock", type: "integer", constraints: "NOT NULL, DEFAULT 0" }
        ],
        relationships: [
          { targetTable: "order_items", type: "one-to-many", foreignKey: "product_id" }
        ]
      }
    ]
  },
  refactoring: [
    {
      file: "OrderService.java",
      loc: 1150,
      complexity: 64,
      risk: "Critical",
      suggestion: "Decouple payment and delivery notification logic from the primary placeOrder core database transaction state.",
      benefit: "Reduces order database lock durations by 80% and isolates downstream gateway delivery timeouts."
    },
    {
      file: "ProductController.java",
      loc: 450,
      complexity: 25,
      risk: "Medium",
      suggestion: "Move custom product searching query parameters building out of the REST controller class and into a dynamic JPA Specification factory class.",
      benefit: "Simplifies REST handler, allows query specs to be fully reused inside admin bulk exports."
    }
  ],
  security: [
    {
      category: "Unsafe XML Deserialization",
      file: "config/WebMvcConfig.java",
      line: 38,
      severity: "High",
      description: "Configuring Jackson XML mapper without turning off external entities parser, permitting XML External Entity (XXE) attacks.",
      solution: "Disable expand entity resolution contexts explicitly on Jackson XML Factory builders: factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false)",
      oldCode: "JacksonXmlModule module = new JacksonXmlModule();\nXmlMapper xmlMapper = new XmlMapper(module);",
      newCode: "JacksonXmlModule module = new JacksonXmlModule();\nXMLInputFactory f = XMLInputFactory.newFactory();\nf.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);\nXmlMapper xmlMapper = new XmlMapper(new XmlInputFactoryReader(f), module);"
    }
  ],
  performance: [
    {
      issue: "N+1 Hibernate Database Fetching",
      file: "OrderService.java",
      line: 80,
      severity: "Critical",
      description: "Retrieving Order list items inside loop, issuing queries sequentially for every entry.",
      suggestedOptimization: "Use Hibernate EntityGraph, dynamic fetch joins, or configured query join structures: @Query(\"SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status\")",
      oldCode: "for (CartItem item : items) {\n    Product p = productRepository.findById(item.getProductId());\n}",
      newCode: "List<String> ids = items.stream().map(CartItem::getProductId).toList();\nList<Product> products = productRepository.findAllById(ids);"
    }
  ],
  bugs: [
    {
      category: "Null Pointer Risk",
      file: "OrderService.java",
      line: 88,
      severity: "Medium",
      description: "Invoking charge on paymentService without checking if order.getId() is null, causing potential server exceptions under heavy workloads.",
      solution: "Add pre-check validations: if (order == null || order.getId() == null) throw new IllegalArgumentException(\"Order context is missing id\");",
      oldCode: "paymentService.charge(order.getId(), request.getCouponCode());",
      newCode: "if (order == null || order.getId() == null) {\n    throw new IllegalArgumentException(\"Order ID cannot be null\");\n}\npaymentService.charge(order.getId(), request.getCouponCode());"
    }
  ],
  codeSmells: [
    {
      category: "Long Method",
      file: "OrderService.java",
      line: 78,
      severity: "Medium",
      description: "Method placeOrder exceeds 150 lines and handles transaction booking, payment dispatch, and mapping tasks at once.",
      solution: "Extract validation check and DTO response mapping details into separate helper methods.",
      oldCode: "public OrderReceiptDto placeOrder(OrderCreationRequest request) {\n    // Complex nested validations...",
      newCode: "public OrderReceiptDto placeOrder(OrderCreationRequest request) {\n    validateOrderRequest(request);\n    OrderAggregate order = OrderAggregate.create(request);\n    orderRepository.save(order);\n    chargePayment(order, request);\n    return mapToReceiptDto(order);\n}"
    }
  ],
  compliance: [
    {
      category: "GDPR Consent Requirement Violation",
      file: "UserController.java",
      line: 110,
      severity: "High",
      description: "Storing customer email addresses and password metadata without recording checkbox consent flags.",
      solution: "Add explicit user consent flag validation field during registration.",
      oldCode: "const user = await this.userService.register({ username, email, password });",
      newCode: "if (!consentAccepted) {\n    throw new ValidationError(\"User must accept privacy policy\");\n}\nconst user = await this.userService.register({ username, email, password, consentAccepted });"
    }
  ],
  gitInsights: [
    {
      file: "OrderService.java",
      commitsCount: 38,
      authorsCount: 3,
      churnRate: 72,
      riskScore: 84
    },
    {
      file: "ProductController.java",
      commitsCount: 22,
      authorsCount: 2,
      churnRate: 40,
      riskScore: 55
    },
    {
      file: "WebMvcConfig.java",
      commitsCount: 8,
      authorsCount: 1,
      churnRate: 15,
      riskScore: 20
    }
  ],
  crashLogs: [
    {
      id: "crash-ecommerce-1",
      timestamp: new Date().toISOString(),
      level: "fatal",
      message: "Cannot read properties of null (reading 'getId')",
      exceptionName: "NullPointerException",
      file: "OrderService.java",
      line: 88,
      stackTrace: [
        "at OrderService.placeOrder (OrderService.java:88)",
        "at OrderController.createOrder (OrderController.java:54)"
      ],
      resolved: false
    }
  ],
  importAnalysis: {
    largestFiles: [
      { file: "OrderService.java", size: "115.4 KB" },
      { file: "ProductService.java", size: "78.2 KB" },
      { file: "WebSecurityConfig.java", size: "43.5 KB" }
    ],
    circularDependencies: ["com.ecommerce.catalog.ProductController -> com.ecommerce.inventory.InventoryService -> com.ecommerce.catalog.ProductController"],
    packageCouplingScore: 42
  },
  runtimeFlow: [
    {
      label: "Purchase Checkout Journey",
      steps: [
        { name: "POST /orders", component: "API Gateway", description: "Verifies token signatures and pipes connection to available order system nodes." },
        { name: "JwtVerificationFilter", component: "Spring Security Layer", description: "Asserts JWT tokens, loads authenticated authorities list to standard security contexts." },
        { name: "OrderController.createOrder", component: "REST API Gateway", description: "Binds inputs, runs validation annotations (@Valid) and sends query to downstream managers." },
        { name: "OrderService.placeOrder", component: "Business Service Engine", description: "Establishes transactional state context (@Transactional), calculates totals, and books products." },
        { name: "PaymentService.charge", component: "External Gateway Integration", description: "Contacts Stripe REST services, charging customer credit credentials asynchronously." },
        { name: "OrderRepository.save", component: "Spring Data JPA Hibernate", description: "Writes parameters, saves ID, emits state hooks and triggers SQL execution." },
        { name: "INSERT INTO orders...", component: "PostgreSQL Database", description: "Persists records inside orders and order_items tables, resolving FK mappings." }
      ]
    }
  ]
};
