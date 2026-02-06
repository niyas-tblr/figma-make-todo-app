export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  createdAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';