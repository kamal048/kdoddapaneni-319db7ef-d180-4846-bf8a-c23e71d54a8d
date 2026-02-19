import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './task.entity';
import { AuditLog } from '../audit/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, AuditLog])],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}