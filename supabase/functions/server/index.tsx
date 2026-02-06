import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger((message) => console.log(message)));

// Explicitly handle OPTIONS requests for CORS preflight
app.options("/*", (c) => {
  return c.body(null, 204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, X-Client-Info",
    "Access-Control-Max-Age": "86400",
  });
});

// Enable CORS middleware for all other routes
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "X-Client-Info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86400,
    credentials: true,
  }),
);

const BASE_PATH = "/make-server-14f62892";

// Health check endpoint
app.get(`${BASE_PATH}/health`, (c) => {
  return c.json({ status: "ok" });
});

// Auth: Sign Up Route
app.post(`${BASE_PATH}/signup`, async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return c.json({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Automatically confirm email
    });

    if (error) {
      console.error("Error creating user:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.error("Unexpected error during signup:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /todos - List all todos
app.get(`${BASE_PATH}/todos`, async (c) => {
  try {
    const todos = await kv.getByPrefix("todo:");
    const todoList = Array.isArray(todos) ? todos : [];
    const sortedTodos = todoList.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    return c.json(sortedTodos);
  } catch (error: any) {
    console.error("Error fetching todos:", error);
    return c.json({ error: `Failed to fetch todos: ${error.message}` }, 500);
  }
});

// POST /todos - Create a new todo
app.post(`${BASE_PATH}/todos`, async (c) => {
  try {
    const body = await c.req.json();
    if (!body || !body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const id = crypto.randomUUID();
    const newTodo = {
      id,
      text: body.text,
      completed: false,
      createdAt: Date.now(),
    };
    
    await kv.set(`todo:${id}`, newTodo);
    return c.json(newTodo, 201);
  } catch (error: any) {
    console.error("Error creating todo:", error);
    return c.json({ error: `Failed to create todo: ${error.message}` }, 500);
  }
});

// PUT /todos/:id - Update a todo
app.put(`${BASE_PATH}/todos/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`todo:${id}`);
    if (!existing) {
      return c.json({ error: "Todo not found" }, 404);
    }
    
    const updatedTodo = { ...existing, ...updates };
    await kv.set(`todo:${id}`, updatedTodo);
    
    return c.json(updatedTodo);
  } catch (error: any) {
    console.error("Error updating todo:", error);
    return c.json({ error: `Failed to update todo: ${error.message}` }, 500);
  }
});

// DELETE /todos/:id - Delete a todo
app.delete(`${BASE_PATH}/todos/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`todo:${id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting todo:", error);
    return c.json({ error: `Failed to delete todo: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);