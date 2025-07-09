'use client';

import { Column as ColumnType, Task } from '@/lib/types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
}

export function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask, onToggleComplete }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className={`bg-gray-50 rounded-lg p-4 min-h-[500px] w-80 transition-all ${
      isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color || '#6b7280' }}
          />
          <h2 className="font-semibold text-gray-900">{column.title}</h2>
          <span className="text-sm text-gray-500">({tasks.length})</span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      
      <div ref={setNodeRef} className="min-h-[400px]">
        <SortableContext
          items={column.taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}