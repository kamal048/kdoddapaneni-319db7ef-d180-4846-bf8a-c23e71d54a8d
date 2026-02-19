import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { AuditLog } from '../audit/audit.entity';
import { IUser, TaskStatus, TaskCategory } from '@org/data';
import { canModifyTask } from '@org/auth';
import { Role } from '@org/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  private async log(userId: number, action: string, resource: string, resourceId?: number) {
    const entry = this.auditRepo.create({ userId, action, resource, resourceId });
    await this.auditRepo.save(entry);
    console.log(`[AUDIT] User ${userId} performed ${action} on ${resource} ${resourceId ?? ''}`);
  }

  async create(user: IUser, body: { title: string; description?: string; category?: TaskCategory }) {
    const task = this.taskRepo.create({
      ...body,
      status: TaskStatus.Todo,
      organizationId: user.organizationId,
      createdById: user.id,
    });
    const saved = await this.taskRepo.save(task);
    await this.log(user.id, 'CREATE', 'task', saved.id);
    return saved;
  }

  async findAll(user: IUser) {
    await this.log(user.id, 'LIST', 'task');
    if (user.role === Role.Viewer) {
      return this.taskRepo.find({ where: { organizationId: user.organizationId, createdById: user.id } });
    }
    return this.taskRepo.find({ where: { organizationId: user.organizationId } });
  }

  async update(user: IUser, id: number, body: Partial<Task>) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.organizationId !== user.organizationId) throw new ForbiddenException();
    if (!canModifyTask(user.role, user.id, task.createdById)) throw new ForbiddenException('Insufficient permissions');

    Object.assign(task, body);
    const saved = await this.taskRepo.save(task);
    await this.log(user.id, 'UPDATE', 'task', id);
    return saved;
  }

  async remove(user: IUser, id: number) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.organizationId !== user.organizationId) throw new ForbiddenException();
    if (!canModifyTask(user.role, user.id, task.createdById)) throw new ForbiddenException('Insufficient permissions');

    await this.taskRepo.delete(id);
    await this.log(user.id, 'DELETE', 'task', id);
    return { message: 'Task deleted' };
  }

  async getAuditLogs(user: IUser) {
    if (user.role === Role.Viewer) throw new ForbiddenException('Access denied');
    return this.auditRepo.find({ order: { createdAt: 'DESC' } });
  }
}