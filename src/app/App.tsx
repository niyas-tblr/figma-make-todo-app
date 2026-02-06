import React, { useState, useEffect } from 'react';
import { Todo, FilterType } from '../types/todo';
import { TodoItem } from './components/TodoItem';
import { TodoDetail } from './components/TodoDetail';
import { AddTodo } from './components/AddTodo';
import { FilterTabs } from './components/FilterTabs';
import { EmptyState } from './components/EmptyState';
import { Auth } from './components/auth/Auth';
import { CheckCircle2, ListTodo, Loader2, CloudOff, LogOut } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) fetchTodos();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTodos();
      else setTodos([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const data = await api.getTodos();
      setTodos(data);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (text: string) => {
    // Optimistic update
    const tempId = crypto.randomUUID();
    const newTodo: Todo = {
      id: tempId,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    
    setTodos([newTodo, ...todos]);

    try {
      const created = await api.createTodo(text);
      // Replace temp ID with real one
      setTodos(prev => prev.map(t => t.id === tempId ? created : t));
      toast.success('Task added');
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTodos(prev => prev.filter(t => t.id !== tempId));
      toast.error('Failed to add task');
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    setTodos(todos.map(t => t.id === id ? { ...t, ...updates } : t));

    try {
      await api.updateTodo(id, updates);
      // toast.success('Saved'); // Optional: too noisy for auto-save
    } catch (err) {
      console.error(err);
      // Revert
      setTodos(todos.map(t => t.id === id ? todo : t));
      toast.error('Failed to save changes');
    }
  };

  const deleteTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic
    setTodos(todos.filter(t => t.id !== id));
    if (selectedTodoId === id) setSelectedTodoId(null);

    try {
      await api.deleteTodo(id);
      toast.success('Task deleted');
    } catch (err) {
      console.error(err);
      // Revert
      setTodos([...todos, todo].sort((a, b) => b.createdAt - a.createdAt));
      toast.error('Failed to delete task');
    }
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const counts = {
    all: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  const selectedTodo = todos.find(t => t.id === selectedTodoId);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <Toaster position="bottom-right" />
        <div className="w-full max-w-md space-y-8">
           <div className="text-center">
            <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
              <CheckCircle2 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Task Master</h1>
            <p className="mt-2 text-gray-500">Sign in to sync your tasks across devices</p>
          </div>
          <Auth onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="bottom-right" />
      
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-600 to-[#F3F4F6] opacity-10" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <CheckCircle2 className="text-white w-6 h-6" />
              </div>
              Task Master
            </h1>
            <button 
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          {!selectedTodoId && (
            <div className="flex justify-center sm:justify-start">
              <FilterTabs 
                currentFilter={filter} 
                onFilterChange={setFilter} 
                counts={counts}
              />
            </div>
          )}
        </header>

        {/* Main Content */}
        {selectedTodoId && selectedTodo ? (
          <TodoDetail 
            todo={selectedTodo} 
            onBack={() => setSelectedTodoId(null)}
            onUpdate={updateTodo}
          />
        ) : (
          <main className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden ring-1 ring-gray-900/5">
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                  <p className="text-sm text-gray-500">
                    Welcome, {session.user.email}
                  </p>
                </div>
              </div>

              <AddTodo onAdd={addTodo} />
              
              <div className="min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Loading your tasks...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
                    <CloudOff className="w-10 h-10 mb-2" />
                    <p className="font-medium">Connection Error</p>
                    <button onClick={fetchTodos} className="mt-4 text-sm text-blue-600 hover:underline">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTodos.length > 0 ? (
                      filteredTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={(id) => updateTodo(id, { completed: !todo.completed })}
                          onDelete={deleteTodo}
                          onEdit={(id, text) => updateTodo(id, { text })}
                          onSelect={setSelectedTodoId}
                        />
                      ))
                    ) : (
                      <EmptyState filter={filter} />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
              <span>{counts.active} items left</span>
              <span className="flex items-center gap-1">
                <ListTodo size={14} />
                {isLoading ? 'Syncing...' : 'Synced to Supabase'}
              </span>
            </div>
          </main>
        )}

        <footer className="mt-8 text-center text-sm text-gray-400">
          <p>Press <kbd className="font-sans px-1 py-0.5 bg-white border border-gray-200 rounded-md text-gray-500 text-xs shadow-sm">Enter</kbd> to save a task</p>
        </footer>

      </div>
    </div>
  );
}