export enum TaskStatus {
    Todo = 'todo',
    InProgress = 'in_progress',
    Done = 'done',
  }
  
  export enum TaskCategory {
    Work = 'work',
    Personal = 'personal',
    Other = 'other',
  }
  
  export interface ITask {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    category: TaskCategory;
    order: number;
    organizationId: number;
    createdById: number;
  }