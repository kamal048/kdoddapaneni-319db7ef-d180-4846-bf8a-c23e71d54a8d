import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { AuditLog } from '../audit/audit.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role, TaskCategory, TaskStatus } from '@org/data';

const mockTaskRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

const mockAuditRepo = {
  create: jest.fn().mockReturnValue({}),
  save: jest.fn().mockResolvedValue({}),
  find: jest.fn(),
};

const ownerUser = { id: 1, email: 'owner@test.com', role: Role.Owner, organizationId: 1 };
const viewerUser = { id: 2, email: 'viewer@test.com', role: Role.Viewer, organizationId: 1 };

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditRepo },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
    mockAuditRepo.create.mockReturnValue({});
    mockAuditRepo.save.mockResolvedValue({});
  });

  describe('create', () => {
    it('should create a task for a user', async () => {
      const task = { id: 1, title: 'Test', organizationId: 1, createdById: 1 };
      mockTaskRepo.create.mockReturnValue(task);
      mockTaskRepo.save.mockResolvedValue(task);

      const result = await service.create(ownerUser, { title: 'Test', category: TaskCategory.Work });
      expect(result).toEqual(task);
      expect(mockTaskRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all org tasks for owner', async () => {
      mockTaskRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAll(ownerUser);
      expect(mockTaskRepo.find).toHaveBeenCalledWith({ where: { organizationId: 1 } });
      expect(result).toHaveLength(2);
    });

    it('should return only own tasks for viewer', async () => {
      mockTaskRepo.find.mockResolvedValue([{ id: 1 }]);
      await service.findAll(viewerUser);
      expect(mockTaskRepo.find).toHaveBeenCalledWith({ where: { organizationId: 1, createdById: 2 } });
    });
  });

  describe('update', () => {
    it('should allow owner to update any task', async () => {
      const task = { id: 1, organizationId: 1, createdById: 99, status: TaskStatus.Todo };
      mockTaskRepo.findOne.mockResolvedValue(task);
      mockTaskRepo.save.mockResolvedValue({ ...task, status: TaskStatus.Done });

      const result = await service.update(ownerUser, 1, { status: TaskStatus.Done });
      expect(result.status).toBe(TaskStatus.Done);
    });

    it('should throw ForbiddenException if viewer tries to update another users task', async () => {
      const task = { id: 1, organizationId: 1, createdById: 99 };
      mockTaskRepo.findOne.mockResolvedValue(task);
      await expect(service.update(viewerUser, 1, { status: TaskStatus.Done }))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTaskRepo.findOne.mockResolvedValue(null);
      await expect(service.update(ownerUser, 999, {}))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAuditLogs', () => {
    it('should return logs for owner', async () => {
      mockAuditRepo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.getAuditLogs(ownerUser);
      expect(result).toHaveLength(1);
    });

    it('should throw ForbiddenException for viewer', async () => {
      await expect(service.getAuditLogs(viewerUser))
        .rejects.toThrow(ForbiddenException);
    });
  });
});