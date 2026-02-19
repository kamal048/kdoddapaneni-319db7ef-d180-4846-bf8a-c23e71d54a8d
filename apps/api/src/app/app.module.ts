import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { Organization } from '../organizations/organization.entity';
import { AuditLog } from '../audit/audit.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env['DB_PATH'] ?? './taskdb.sqlite',
      entities: [User, Task, Organization, AuditLog],
      synchronize: true,
    }),
    AuthModule,
    TasksModule,
  ],
})
export class AppModule {}