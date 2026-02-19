import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getTasks() {
    return this.http.get<any[]>(`${this.apiUrl}/tasks`, { headers: this.headers() });
  }

  createTask(task: { title: string; description?: string; category?: string }) {
    return this.http.post<any>(`${this.apiUrl}/tasks`, task, { headers: this.headers() });
  }

  updateTask(id: number, task: Partial<any>) {
    return this.http.put<any>(`${this.apiUrl}/tasks/${id}`, task, { headers: this.headers() });
  }

  deleteTask(id: number) {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`, { headers: this.headers() });
  }

  getAuditLogs() {
    return this.http.get<any[]>(`${this.apiUrl}/audit-log`, { headers: this.headers() });
  }
}