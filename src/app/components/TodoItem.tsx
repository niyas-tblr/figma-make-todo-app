import React, { useState, useRef, useEffect } from "react";
import { Todo } from "../../types/todo";
import { Check, Trash2, Edit2, X, CheckCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onSelect?: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit, onSelect }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200",
        todo.completed && "bg-gray-50 opacity-75"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(todo.id);
        }}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          todo.completed
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 text-transparent hover:border-blue-500"
        )}
      >
        <Check size={14} strokeWidth={3} />
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-1">
              <Button size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" variant="ghost" onClick={handleSave}>
                <CheckCheck size={16} />
              </Button>
              <Button 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:bg-red-50" 
                variant="ghost" 
                onClick={() => {
                  setEditText(todo.text);
                  setIsEditing(false);
                }}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <span
            onClick={() => onSelect?.(todo.id)}
            className={cn(
              "block truncate text-gray-700 font-medium transition-all decoration-2 decoration-gray-400 cursor-pointer hover:text-blue-600",
              todo.completed && "text-gray-400 line-through"
            )}
          >
            {todo.text}
          </span>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-gray-400 hover:text-blue-600"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}