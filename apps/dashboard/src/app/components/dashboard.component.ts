import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .app { min-height:100vh; transition: background 0.3s, color 0.3s; }
    .app.light { background:#f3f4f6; color:#1f2937; }
    .app.dark { background:#111827; color:#f9fafb; }

    header { padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
    .light header { background:white; }
    .dark header { background:#1f2937; }
    header h1 { font-size:1.25rem; font-weight:700; }
    .header-actions { display:flex; gap:1rem; align-items:center; }
    .logout { color:#ef4444; cursor:pointer; background:none; border:none; font-size:0.875rem; }
    .toggle { cursor:pointer; background:none; border:1px solid #6b7280; border-radius:20px; padding:0.25rem 0.75rem; font-size:0.75rem; }
    .light .toggle { color:#374151; }
    .dark .toggle { color:#f9fafb; }

    .main { max-width:800px; margin:0 auto; padding:1.5rem; }
    .card { border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.15); padding:1rem; margin-bottom:1.5rem; }
    .light .card { background:white; }
    .dark .card { background:#1f2937; }

    input, select { border:1px solid #d1d5db; border-radius:4px; padding:0.5rem 0.75rem; font-size:1rem; width:100%; margin-bottom:0.5rem; transition: background 0.3s, color 0.3s; }
    .light input, .light select { background:white; color:#1f2937; }
    .dark input, .dark select { background:#374151; color:#f9fafb; border-color:#4b5563; }

    .row { display:flex; gap:0.5rem; }
    .row select { width:auto; }
    .btn { padding:0.5rem 1rem; border:none; border-radius:4px; cursor:pointer; font-size:0.875rem; }
    .btn-blue { background:#3b82f6; color:white; }
    .btn-red { background:none; color:#ef4444; border:none; cursor:pointer; }

    .filters { display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap; }
    .filter-btn { padding:0.25rem 0.75rem; border-radius:20px; border:none; cursor:pointer; font-size:0.75rem; }
    .light .filter-btn { background:#e5e7eb; color:#374151; }
    .dark .filter-btn { background:#374151; color:#d1d5db; }
    .filter-btn.active { background:#3b82f6; color:white; }

    .task-item { border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.15); padding:1rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:flex-start; }
    .light .task-item { background:white; }
    .dark .task-item { background:#1f2937; }

    .tag { font-size:0.7rem; padding:0.15rem 0.5rem; border-radius:20px; margin-left:0.5rem; }
    .tag-work { background:#dbeafe; color:#1d4ed8; }
    .tag-personal { background:#dcfce7; color:#166534; }
    .tag-other { background:#f3f4f6; color:#374151; }
    .empty { text-align:center; color:#9ca3af; padding:2rem; }
    .audit-item { font-size:0.875rem; padding:0.5rem 0; border-bottom:1px solid #f3f4f6; }
    .dark .audit-item { border-bottom-color:#374151; color:#9ca3af; }
  `],
  template: `
    <div class="app" [class.dark]="darkMode" [class.light]="!darkMode">
      <header>
        <h1>🗂 Task Manager</h1>
        <div class="header-actions">
          <button class="toggle" (click)="darkMode=!darkMode">
            {{ darkMode ? '☀️ Light' : '🌙 Dark' }}
          </button>
          <button class="logout" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="main">
        <!-- Add Task -->
        <div class="card">
          <h2 style="margin-bottom:0.75rem;font-weight:600">Add New Task</h2>
          <input [(ngModel)]="newTitle" placeholder="Task title" />
          <input [(ngModel)]="newDescription" placeholder="Description (optional)" />
          <div class="row">
            <select [(ngModel)]="newCategory">
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
            <button class="btn btn-blue" (click)="createTask()">Add Task</button>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters">
          <button *ngFor="let f of filters" class="filter-btn"
            [class.active]="activeFilter===f" (click)="activeFilter=f">
            {{ f }}
          </button>
        </div>

        <!-- Tasks -->
        <div *ngIf="filteredTasks().length === 0" class="empty">No tasks found.</div>
        <div *ngFor="let task of filteredTasks()" class="task-item">
          <div style="flex:1">
            <div style="display:flex;align-items:center;margin-bottom:0.25rem">
              <strong>{{ task.title }}</strong>
              <span class="tag" [class]="'tag-'+task.category">{{ task.category }}</span>
            </div>
            <p *ngIf="task.description" style="font-size:0.875rem;color:#6b7280;margin-bottom:0.5rem">
              {{ task.description }}
            </p>
            <select [(ngModel)]="task.status" (change)="updateStatus(task)"
              style="width:auto;font-size:0.75rem;padding:0.2rem 0.5rem">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <button class="btn-red" (click)="deleteTask(task.id)">Delete</button>
        </div>

        <!-- Audit Log -->
        <div class="card" style="margin-top:2rem" *ngIf="auditLogs.length > 0">
          <h2 style="font-weight:600;margin-bottom:0.75rem">Audit Log</h2>
          <div *ngFor="let log of auditLogs" class="audit-item">
            User {{ log.userId }} → <strong>{{ log.action }}</strong> on {{ log.resource }}
            <span *ngIf="log.resourceId"> #{{ log.resourceId }}</span>
            <span style="margin-left:0.5rem;opacity:0.5">{{ log.createdAt | date:'short' }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  auditLogs: any[] = [];
  newTitle = '';
  newDescription = '';
  newCategory = 'work';
  activeFilter = 'all';
  darkMode = false;
  filters = ['all', 'work', 'personal', 'other', 'todo', 'in_progress', 'done'];

  constructor(private authService: AuthService, private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
    this.taskService.getAuditLogs().subscribe({ next: (logs) => this.auditLogs = logs, error: () => {} });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({ next: (tasks) => this.tasks = tasks, error: () => {} });
  }

  filteredTasks() {
    if (this.activeFilter === 'all') return this.tasks;
    return this.tasks.filter(t => t.category === this.activeFilter || t.status === this.activeFilter);
  }

  createTask() {
    if (!this.newTitle.trim()) return;
    this.taskService.createTask({ title: this.newTitle, description: this.newDescription, category: this.newCategory })
      .subscribe({ next: () => { this.newTitle = ''; this.newDescription = ''; this.loadTasks(); } });
  }

  updateStatus(task: any) {
    this.taskService.updateTask(task.id, { status: task.status }).subscribe();
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({ next: () => this.loadTasks() });
  }

  logout() { this.authService.logout(); }
}