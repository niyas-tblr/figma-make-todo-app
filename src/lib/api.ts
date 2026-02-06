import { supabase } from './supabase';

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!projectId) console.error('CRITICAL: VITE_SUPABASE_PROJECT_ID is missing');
if (!publicAnonKey) console.error('CRITICAL: VITE_SUPABASE_ANON_KEY is missing');

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-14f62892`;

async function getHeaders(forceAnon = false) {
  let token = publicAnonKey;
  
  if (!forceAnon) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  }
  
  if (!token) {
    console.error('No auth token available');
    throw new Error('Authentication configuration missing');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'apikey': publicAnonKey
  };
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errorMessage = data.error;
    } catch {
      // Ignore JSON parse error, use status text
    }
    
    // enhance error object with status
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

async function fetchWithRetry(url: string, options: RequestInit = {}) {
  try {
    const headers = await getHeaders();
    const res = await fetch(url, { ...options, headers });
    return await handleResponse(res);
  } catch (error: any) {
    // If we get a 401 Unauthorized, it usually means the User Token is invalid/expired
    // or the Gateway rejected it. We retry ONCE with the Anon Key.
    if (error.status === 401 || error.message.includes('401')) {
      console.warn('Authentication failed (401). Retrying with Anon Key...');
      try {
        const fallbackHeaders = await getHeaders(true); // force anon
        const res = await fetch(url, { ...options, headers: fallbackHeaders });
        return await handleResponse(res);
      } catch (retryError) {
        console.error('Retry with Anon Key also failed:', retryError);
        throw retryError; // Throw the retry error
      }
    }
    throw error;
  }
}

export const api = {
  getTodos: async () => {
    return fetchWithRetry(`${BASE_URL}/todos`, {
      method: 'GET'
    });
  },

  createTodo: async (text: string) => {
    return fetchWithRetry(`${BASE_URL}/todos`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  updateTodo: async (id: string, updates: Partial<any>) => {
    return fetchWithRetry(`${BASE_URL}/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteTodo: async (id: string) => {
    return fetchWithRetry(`${BASE_URL}/todos/${id}`, {
      method: 'DELETE'
    });
  }
};