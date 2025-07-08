'use client';

import { useState, useEffect } from 'react';
import { Board as BoardType, Task } from '@/lib/types';
import { ChromeStorage } from '@/lib/storage';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskDialog } from './TaskDialog';

export function Board() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadBoard();
  }, []);

  const loadBoard = async () => {
    const state = await ChromeStorage.getState();
    if (state.activeBoard && state.boards[state.activeBoard]) {
      setBoard(state.boards[state.activeBoard]);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (board && board.tasks[active.id]) {
      setActiveTask(board.tasks[active.id]);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !board) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeTask = board.tasks[activeTaskId];
    if (!activeTask) return;

    const sourceColumnId = activeTask.columnId;
    let destColumnId = overId;

    if (board.tasks[overId]) {
      destColumnId = board.tasks[overId].columnId;
    }

    const sourceColumn = board.columns.find(col => col.id === sourceColumnId);
    const destColumn = board.columns.find(col => col.id === destColumnId);

    if (!sourceColumn || !destColumn) return;

    if (sourceColumnId === destColumnId) {
      const oldIndex = sourceColumn.taskIds.indexOf(activeTaskId);
      const newIndex = destColumn.taskIds.indexOf(overId);
      
      if (oldIndex !== newIndex && newIndex !== -1) {
        await ChromeStorage.moveTask(board.id, activeTaskId, sourceColumnId, destColumnId, newIndex);
        await loadBoard();
      }
    } else {
      const newIndex = destColumn.taskIds.indexOf(overId);
      const finalIndex = newIndex === -1 ? destColumn.taskIds.length : newIndex;
      
      await ChromeStorage.moveTask(board.id, activeTaskId, sourceColumnId, destColumnId, finalIndex);
      await loadBoard();
    }

    setActiveTask(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !board) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeTask = board.tasks[activeTaskId];
    if (!activeTask) return;

    const sourceColumnId = activeTask.columnId;
    let destColumnId = overId;

    if (board.tasks[overId]) {
      destColumnId = board.tasks[overId].columnId;
    }

    if (sourceColumnId !== destColumnId) {
      setBoard(prevBoard => {
        if (!prevBoard) return null;

        const newBoard = { ...prevBoard };
        const sourceColumn = newBoard.columns.find(col => col.id === sourceColumnId);
        const destColumn = newBoard.columns.find(col => col.id === destColumnId);

        if (!sourceColumn || !destColumn) return prevBoard;

        sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== activeTaskId);
        destColumn.taskIds.push(activeTaskId);

        newBoard.tasks[activeTaskId] = {
          ...newBoard.tasks[activeTaskId],
          columnId: destColumnId,
        };

        return newBoard;
      });
    }
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedColumnId(task.columnId);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!board) return;
    
    if (confirm('Are you sure you want to delete this task?')) {
      await ChromeStorage.deleteTask(board.id, taskId);
      await loadBoard();
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!board) return;

    if (editingTask) {
      await ChromeStorage.updateTask(board.id, editingTask.id, taskData);
    } else {
      await ChromeStorage.addTask(board.id, selectedColumnId, taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
    }

    await loadBoard();
    setIsTaskDialogOpen(false);
  };

  if (!board) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen bg-gray-100">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{board.title}</h1>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6">
            <SortableContext
              items={board.columns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {board.columns.map((column) => {
                const columnTasks = column.taskIds
                  .map(taskId => board.tasks[taskId])
                  .filter(Boolean);

                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                  />
                );
              })}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}