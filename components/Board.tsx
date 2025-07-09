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
    
    setActiveTask(null);
    
    if (!over || !board) {
      await loadBoard();
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const state = await ChromeStorage.getState();
    const currentBoard = state.boards[board.id];
    if (!currentBoard) return;

    const activeTask = currentBoard.tasks[activeTaskId];
    if (!activeTask) return;

    const sourceColumnId = activeTask.columnId;
    let destColumnId = overId;

    if (currentBoard.tasks[overId]) {
      destColumnId = currentBoard.tasks[overId].columnId;
    }

    const sourceColumn = currentBoard.columns.find(col => col.id === sourceColumnId);
    const destColumn = currentBoard.columns.find(col => col.id === destColumnId);

    if (!sourceColumn || !destColumn) return;

    if (sourceColumnId === destColumnId) {
      const oldIndex = sourceColumn.taskIds.indexOf(activeTaskId);
      let newIndex = destColumn.taskIds.indexOf(overId);
      
      // If overId is the column ID itself, it means we're dropping at the end
      if (newIndex === -1 && overId === destColumnId) {
        newIndex = destColumn.taskIds.length;
      }
      
      if (oldIndex !== newIndex && newIndex !== -1) {
        // When moving within same column, we need to adjust the index
        // if we're moving the item to a position after its current position
        const adjustedIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
        await ChromeStorage.moveTask(board.id, activeTaskId, sourceColumnId, destColumnId, adjustedIndex);
      }
    } else {
      const newIndex = destColumn.taskIds.indexOf(overId);
      const finalIndex = newIndex === -1 ? destColumn.taskIds.length : newIndex;
      
      await ChromeStorage.moveTask(board.id, activeTaskId, sourceColumnId, destColumnId, finalIndex);
    }
    
    await loadBoard();
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

    // Check if we're over a task or a column
    if (board.tasks[overId]) {
      destColumnId = board.tasks[overId].columnId;
    }

    // Update the preview position while dragging
    setBoard(prevBoard => {
      if (!prevBoard) return null;

      const newBoard = { 
        ...prevBoard,
        columns: prevBoard.columns.map(col => ({ ...col, taskIds: [...col.taskIds] })),
        tasks: { ...prevBoard.tasks }
      };
      
      const sourceColumn = newBoard.columns.find(col => col.id === sourceColumnId);
      const destColumn = newBoard.columns.find(col => col.id === destColumnId);

      if (!sourceColumn || !destColumn) return prevBoard;

      // Remove from source
      sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== activeTaskId);
      
      // Add to destination at correct position
      if (board.tasks[overId] && destColumnId === destColumn.id) {
        // Insert before the task we're hovering over
        const overTaskIndex = destColumn.taskIds.indexOf(overId);
        if (overTaskIndex !== -1) {
          destColumn.taskIds.splice(overTaskIndex, 0, activeTaskId);
        } else {
          destColumn.taskIds.push(activeTaskId);
        }
      } else {
        // Add to the end of the column
        destColumn.taskIds.push(activeTaskId);
      }

      // Update task's column
      newBoard.tasks[activeTaskId] = {
        ...newBoard.tasks[activeTaskId],
        columnId: destColumnId,
      };

      return newBoard;
    });
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

  const handleToggleComplete = async (taskId: string) => {
    if (!board) return;
    
    const task = board.tasks[taskId];
    if (!task) return;
    
    await ChromeStorage.updateTask(board.id, taskId, { completed: !task.completed });
    await loadBoard();
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
                    onToggleComplete={handleToggleComplete}
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