import React, { useState, useEffect, useRef } from 'react';
import { Todo } from '../../types/todo';
import { ArrowLeft, CheckCircle2, Circle, Clock, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface TodoDetailProps {
  todo: Todo;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

export function TodoDetail({ todo, onBack, onUpdate }: TodoDetailProps) {
  const [text, setText] = useState(todo.text);
  const [description, setDescription] = useState(todo.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save logic
  const handleSave = (updates: Partial<Todo>) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(todo.id, updates);
      setIsSaving(false);
    }, 1000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    handleSave({ text: newText });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDesc = e.target.value;
    setDescription(newDesc);
    handleSave({ description: newDesc });
  };

  const toggleStatus = () => {
    const newCompleted = !todo.completed;
    onUpdate(todo.id, { completed: newCompleted });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden ring-1 ring-gray-900/5 min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
            {isSaving && <span className="text-xs text-gray-400 animate-pulse">Saving...</span>}
            <button
                onClick={toggleStatus}
                className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                todo.completed 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                )}
            >
                {todo.completed ? (
                <>
                    <CheckCircle2 size={16} />
                    <span>Completed</span>
                </>
                ) : (
                <>
                    <Circle size={16} />
                    <span>Active</span>
                </>
                )}
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Task
          </label>
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="w-full flex-1 resize-none text-base text-gray-600 bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300 min-h-[200px]"
            placeholder="Add details about this task..."
          />
        </div>

        {/* Metadata */}
        <div className="pt-6 mt-auto border-t border-gray-100 flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>Created {format(todo.createdAt, 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{format(todo.createdAt, 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
