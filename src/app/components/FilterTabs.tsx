import { FilterType } from "../../types/todo";
import { cn } from "../../lib/utils";

interface FilterTabsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export function FilterTabs({ currentFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex p-1 space-x-1 bg-gray-100 rounded-xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
            currentFilter === tab.id
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
          )}
        >
          {tab.label}
          <span className={cn(
            "ml-2 text-xs py-0.5 px-1.5 rounded-full",
            currentFilter === tab.id ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-600"
          )}>
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  );
}