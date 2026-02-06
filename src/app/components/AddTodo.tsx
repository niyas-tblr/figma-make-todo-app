import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          className="pr-12 h-12 text-base shadow-sm border-gray-200 focus-visible:ring-blue-500"
        />
        <Button 
          type="submit" 
          size="icon"
          className="absolute right-1.5 top-1.5 h-9 w-9 bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={!text.trim()}
        >
          <Plus size={20} />
        </Button>
      </div>
    </form>
  );
}
