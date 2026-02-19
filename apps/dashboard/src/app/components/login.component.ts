import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f3f4f6; }
    .card { background:white; padding:2rem; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); width:100%; max-width:400px; }
    h1 { text-align:center; margin-bottom:1.5rem; color:#1f2937; }
    input, select { width:100%; border:1px solid #d1d5db; border-radius:4px; padding:0.5rem 0.75rem; margin-bottom:0.75rem; font-size:1rem; }
    .btn { width:100%; padding:0.6rem; border:none; border-radius:4px; font-size:1rem; cursor:pointer; }
    .btn-blue { background:#3b82f6; color:white; }
    .btn-green { background:#22c55e; color:white; }
    .error { background:#fee2e2; color:#dc2626; padding:0.5rem; border-radius:4px; margin-bottom:1rem; }
    .link { color:#3b82f6; cursor:pointer; }
    p { text-align:center; margin-top:1rem; font-size:0.875rem; color:#6b7280; }
  `],
  template: `
    <div class="container">
      <div class="card">
        <h1>Task Manager</h1>
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="!showRegister">
          <h2 style="margin-bottom:1rem">Login</h2>
          <input [(ngModel)]="email" type="email" placeholder="Email" />
          <input [(ngModel)]="password" type="password" placeholder="Password" />
          <button class="btn btn-blue" (click)="login()">Login</button>
          <p>No account? <span class="link" (click)="showRegister=true">Register</span></p>
        </div>
        <div *ngIf="showRegister">
          <h2 style="margin-bottom:1rem">Register</h2>
          <input [(ngModel)]="email" type="email" placeholder="Email" />
          <input [(ngModel)]="password" type="password" placeholder="Password" />
          <select [(ngModel)]="role">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <input [(ngModel)]="organizationId" type="number" placeholder="Organization ID" />
          <button class="btn btn-green" (click)="register()">Register</button>
          <p>Have account? <span class="link" (click)="showRegister=false">Login</span></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  role = 'viewer';
  organizationId = 1;
  error = '';
  showRegister = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.error = 'Invalid email or password'
    });
  }

  register() {
    this.error = '';
    this.authService.register(this.email, this.password, this.role, this.organizationId).subscribe({
      next: () => { this.showRegister = false; alert('Registered! Please login.'); },
      error: (e: any) => this.error = e.error.message ?? 'Registration failed'
    });
  }
}