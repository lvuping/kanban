'use client';

import { Task } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Clock, User, Check } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 ${
        isDragging ? 'opacity-50' : ''
      } ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium mb-1 ${
            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>{task.title}</h3>
          
          {task.description && (
            <p className={`text-sm mb-2 ${
              task.completed ? 'text-gray-400 line-through' : 'text-gray-600'
            }`}>{task.description}</p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            {task.priority && (
              <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            )}
            
            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>{task.assignee}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {onToggleComplete && (
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`p-1 hover:bg-gray-100 rounded ${
                task.completed ? 'text-green-600' : 'text-gray-400'
              }`}
              title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}