import { ClipboardList } from "lucide-react";

export function EmptyState({ filter }: { filter: string }) {
  const messages = {
    all: "You have no tasks yet. Add one to get started!",
    active: "No active tasks. You're all caught up!",
    completed: "No completed tasks yet. Get to work!",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        <ClipboardList className="w-12 h-12 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        No tasks found
      </h3>
      <p className="text-gray-500 text-sm max-w-xs mx-auto">
        {messages[filter as keyof typeof messages]}
      </p>
    </div>
  );
}