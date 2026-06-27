export const MOCK_FILES: Record<string, string> = {
  "OrderService.java": `package com.ecommerce.orders;

import com.ecommerce.payment.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    public OrderService(OrderRepository orderRepository, PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.paymentService = paymentService;
    }

    @Transactional
    public OrderReceiptDto placeOrder(OrderCreationRequest request) {
        // N+1 Vulnerable Code Block
        // List<CartItem> items = request.getItems();
        // for (CartItem item : items) {
        //     Product p = productRepository.findById(item.getProductId()); // DB call in loop!
        // }

        OrderAggregate order = OrderAggregate.create(request);
        orderRepository.save(order);

        paymentService.charge(order.getId(), request.getCouponCode());
        
        return new OrderReceiptDto(order.getId(), order.getTotal(), "TRK-" + System.currentTimeMillis());
    }
}`,

  "OrderService.ts": `package com.ecommerce.orders;

import com.ecommerce.payment.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    public OrderService(OrderRepository orderRepository, PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.paymentService = paymentService;
    }

    @Transactional
    public OrderReceiptDto placeOrder(OrderCreationRequest request) {
        // N+1 Vulnerable Code Block
        // List<CartItem> items = request.getItems();
        // for (CartItem item : items) {
        //     Product p = productRepository.findById(item.getProductId()); // DB call in loop!
        // }

        OrderAggregate order = OrderAggregate.create(request);
        orderRepository.save(order);

        paymentService.charge(order.getId(), request.getCouponCode());
        
        return new OrderReceiptDto(order.getId(), order.getTotal(), "TRK-" + System.currentTimeMillis());
    }
}`,

  "UserController.ts": `import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    const users = await this.userService.findAll(Number(page), Number(limit));
    return res.json(users);
  }

  async createUser(req: Request, res: Response) {
    const { username, email, password } = req.body;
    if (!email || !username) {
      return res.status(400).json({ error: 'Username and email are required' });
    }
    const user = await this.userService.register({ username, email, password });
    return res.status(201).json(user);
  }
}`,

  "UserController.java": `import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    const users = await this.userService.findAll(Number(page), Number(limit));
    return res.json(users);
  }

  async createUser(req: Request, res: Response) {
    const { username, email, password } = req.body;
    if (!email || !username) {
      return res.status(400).json({ error: 'Username and email are required' });
    }
    const user = await this.userService.register({ username, email, password });
    return res.status(201).json(user);
  }
}`,

  "UserRepository.ts": `import { DbClient } from '../db';

export class UserRepository {
  constructor(private db: DbClient) {}

  // CRITICAL: Vulnerable SQL Injection
  async getActiveUsers(userId: string) {
    // UNSAFE: Direct string concat
    const query = \`SELECT * FROM users WHERE active = true AND id = \${userId}\`;
    return this.db.query(query);
  }

  // SAFE: Parameterized
  async save(user: any) {
    return this.db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [user.username, user.email, user.password]
    );
  }
}`,

  "UserRepository.java": `import { DbClient } from '../db';

export class UserRepository {
  constructor(private db: DbClient) {}

  // CRITICAL: Vulnerable SQL Injection
  async getActiveUsers(userId: string) {
    // UNSAFE: Direct string concat
    const query = \`SELECT * FROM users WHERE active = true AND id = \${userId}\`;
    return this.db.query(query);
  }

  // SAFE: Parameterized
  async save(user: any) {
    return this.db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [user.username, user.email, user.password]
    );
  }
}`,

  "WebMvcConfig.java": `package com.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    public XmlMapper xmlMapper() {
        // Vulnerable XML mapper setup (XXE Vulnerability)
        JacksonXmlModule module = new JacksonXmlModule();
        XmlMapper xmlMapper = new XmlMapper(module);
        return xmlMapper;
    }
}`,

  "WebSecurityConfig.java": `package com.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // CSRF Vuln
        http.csrf().disable();
        
        http.authorizeRequests()
            .antMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated();
    }
}`,

  "show.blade.php": `@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold">{{ $post->title }}</h1>
    <div class="text-slate-500 text-sm mb-4">Posted by {{ $post->author->name }}</div>
    
    <!-- CRITICAL: Vulnerable XSS Render -->
    <div class="body">
        {!! $post->content !!}
    </div>
</div>
@endsection`,

  "PostController.php": `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Post;
use Illuminate\\Http\\Request;

class PostController extends Controller
{
    public function index()
    {
        // N+1 Eloquent loading vulnerability
        $posts = Post::all();
        return view('posts.index', compact('posts'));
    }

    public function show($slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();
        return view('posts.show', compact('post'));
    }
}`
};

export const getFallbackContent = (filepath: string): string => {
  return `// CodeScope Source Code Intelligence Viewer
// Selected target path: ${filepath}
// LOC: ~245 | Language: Detected from project DNA

import { BaseController } from "./core/BaseController";
import { LogManager } from "./core/LogManager";

/**
 * Standard implementation template of CodeScope Static Parser Component.
 * Full AST representation compiled successfully.
 */
export class ClientContext extends BaseController {
  private logger = LogManager.getLogger("CodeScope");

  public async execute(context: any): Promise<boolean> {
    this.logger.info("Initializing context execution check...");
    if (!context || context.invalid) {
      throw new Error("Invalid execution framework context");
    }
    return true;
  }
}`;
};
