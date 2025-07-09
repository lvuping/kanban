export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  color?: string;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  tasks: Record<string, Task>;
}

export interface KanbanState {
  boards: Record<string, Board>;
  activeBoard: string | null;
}