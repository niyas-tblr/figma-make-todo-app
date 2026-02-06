import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-14f62892`;

export const api = {
  getTodos: async () => {
    const res = await fetch(`${BASE_URL}/todos`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    if (!res.ok) throw new Error('Failed to fetch todos');
    return res.json();
  },

  createTodo: async (text: string) => {
    const res = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Failed to create todo');
    return res.json();
  },

  updateTodo: async (id: string, updates: Partial<{ text: string; completed: boolean }>) => {
    const res = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update todo');
    return res.json();
  },

  deleteTodo: async (id: string) => {
    const res = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    if (!res.ok) throw new Error('Failed to delete todo');
    return res.json();
  }
};
