import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskCategory } from '@org/data';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('tasks')
  create(@Request() req: any, @Body() body: { title: string; description?: string; category?: TaskCategory }) {
    return this.tasksService.create(req.user, body);
  }

  @Get('tasks')
  findAll(@Request() req: any) {
    return this.tasksService.findAll(req.user);
  }

  @Put('tasks/:id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(req.user, +id, body);
  }

  @Delete('tasks/:id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.tasksService.remove(req.user, +id);
  }

  @Get('audit-log')
  getAuditLogs(@Request() req: any) {
    return this.tasksService.getAuditLogs(req.user);
  }
}