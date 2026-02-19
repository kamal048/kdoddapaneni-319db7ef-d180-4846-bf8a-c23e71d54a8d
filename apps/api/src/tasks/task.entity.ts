import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TaskStatus, TaskCategory } from '@org/data';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', default: TaskStatus.Todo })
  status: TaskStatus;

  @Column({ type: 'text', default: TaskCategory.Work })
  category: TaskCategory;

  @Column({ default: 0 })
  order: number;

  @Column()
  organizationId: number;

  @Column()
  createdById: number;
}