import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '@org/data';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', default: Role.Viewer })
  role: Role;

  @Column()
  organizationId: number;
}