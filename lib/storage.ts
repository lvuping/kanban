import { KanbanState, Board, Task, Column } from './types';

const STORAGE_KEY = 'kanban-board-state';

export class ChromeStorage {
  static async getState(): Promise<KanbanState> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          const state = result[STORAGE_KEY] || this.getDefaultState();
          resolve(state);
        });
      });
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultState();
  }

  static async setState(state: KanbanState): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
          resolve();
        });
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  static getDefaultState(): KanbanState {
    const defaultBoard: Board = {
      id: 'default',
      title: 'Team Board',
      columns: [
        { id: 'todo', title: 'To Do', taskIds: [], color: '#6366f1' },
        { id: 'in-progress', title: 'In Progress', taskIds: [], color: '#f59e0b' },
        { id: 'review', title: 'Review', taskIds: [], color: '#8b5cf6' },
        { id: 'done', title: 'Done', taskIds: [], color: '#10b981' }
      ],
      tasks: {}
    };

    return {
      boards: {
        default: defaultBoard
      },
      activeBoard: 'default'
    };
  }

  static async addTask(boardId: string, columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const state = await this.getState();
    const board = state.boards[boardId];
    
    if (!board) throw new Error('Board not found');
    
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      columnId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    board.tasks[newTask.id] = newTask;
    
    const column = board.columns.find(col => col.id === columnId);
    if (column) {
      column.taskIds.push(newTask.id);
    }
    
    await this.setState(state);
    return newTask;
  }

  static async updateTask(boardId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const state = await this.getState();
    const board = state.boards[boardId];
    
    if (!board || !board.tasks[taskId]) return;
    
    board.tasks[taskId] = {
      ...board.tasks[taskId],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.setState(state);
  }

  static async deleteTask(boardId: string, taskId: string): Promise<void> {
    const state = await this.getState();
    const board = state.boards[boardId];
    
    if (!board || !board.tasks[taskId]) return;
    
    const task = board.tasks[taskId];
    delete board.tasks[taskId];
    
    board.columns.forEach(column => {
      column.taskIds = column.taskIds.filter(id => id !== taskId);
    });
    
    await this.setState(state);
  }

  static async moveTask(boardId: string, taskId: string, sourceColumnId: string, destColumnId: string, newIndex: number): Promise<void> {
    const state = await this.getState();
    const board = state.boards[boardId];
    
    if (!board) return;
    
    const sourceColumn = board.columns.find(col => col.id === sourceColumnId);
    const destColumn = board.columns.find(col => col.id === destColumnId);
    
    if (!sourceColumn || !destColumn) return;
    
    sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
    destColumn.taskIds.splice(newIndex, 0, taskId);
    
    if (board.tasks[taskId]) {
      board.tasks[taskId].columnId = destColumnId;
      board.tasks[taskId].updatedAt = new Date().toISOString();
    }
    
    await this.setState(state);
  }
}