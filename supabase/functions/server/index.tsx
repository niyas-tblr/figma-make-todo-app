import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const BASE_PATH = "/make-server-14f62892";

// Health check endpoint
app.get(`${BASE_PATH}/health`, (c) => {
  return c.json({ status: "ok" });
});

// GET /todos - List all todos
app.get(`${BASE_PATH}/todos`, async (c) => {
  try {
    const todos = await kv.getByPrefix("todo:");
    // Sort by createdAt descending (newest first)
    const sortedTodos = todos.sort((a: any, b: any) => b.createdAt - a.createdAt);
    return c.json(sortedTodos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

// POST /todos - Create a new todo
app.post(`${BASE_PATH}/todos`, async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const newTodo = {
      id,
      text: body.text,
      completed: false,
      createdAt: Date.now(),
    };
    
    await kv.set(`todo:${id}`, newTodo);
    return c.json(newTodo, 201);
  } catch (error) {
    console.error("Error creating todo:", error);
    return c.json({ error: "Failed to create todo" }, 500);
  }
});

// PUT /todos/:id - Update a todo
app.put(`${BASE_PATH}/todos/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Fetch existing to ensure we don't overwrite with partial data if not intended,
    // but here we expect the full object or partial updates to be merged?
    // KV store doesn't support patch easily without read-modify-write.
    // Let's assume the frontend sends the specific fields to update.
    
    const existing = await kv.get(`todo:${id}`);
    if (!existing) {
      return c.json({ error: "Todo not found" }, 404);
    }
    
    const updatedTodo = { ...existing, ...updates };
    await kv.set(`todo:${id}`, updatedTodo);
    
    return c.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return c.json({ error: "Failed to update todo" }, 500);
  }
});

// DELETE /todos/:id - Delete a todo
app.delete(`${BASE_PATH}/todos/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`todo:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return c.json({ error: "Failed to delete todo" }, 500);
  }
});

Deno.serve(app.fetch);
