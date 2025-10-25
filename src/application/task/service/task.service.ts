import type { CurrentUserData } from '@/application/shared/types/current-user.type'
import { CreateTaskUseCase } from '@/application/task/usecases/create-task.usecase'
import { DeleteTaskUseCase } from '@/application/task/usecases/delete-task.usecase'
import { CreateTaskInputDto } from '@/application/task/usecases/dtos/create-task.usecase.dto'
import {
  ListTaskInputDto,
  PaginatedTasksOutputDto,
} from '@/application/task/usecases/dtos/list-task.usecase.dto'
import { UpdateTaskInputDto } from '@/application/task/usecases/dtos/update-task.usecase.dto'
import { GetTaskUseCase } from '@/application/task/usecases/get-task.usecase'
import { ListTaskUseCase } from '@/application/task/usecases/list-task.usecase'
import { UpdateStatusTaskUseCase } from '@/application/task/usecases/update-status-task.usecase'
import { UpdateTaskUseCase } from '@/application/task/usecases/update-task.usecase'
import { Injectable } from '@nestjs/common'
import { Task, TaskStatus } from '@prisma/client'

@Injectable()
export class TaskService {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTaskUseCase: ListTaskUseCase,
    private readonly updateStatusTaskUseCase: UpdateStatusTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
  ) {}

  async createTask(
    input: CreateTaskInputDto,
    user: CurrentUserData,
  ): Promise<Task> {
    return await this.createTaskUseCase.execute(input, user)
  }

  async deleteTask(taskId: string, user: CurrentUserData): Promise<void> {
    return await this.deleteTaskUseCase.execute(taskId, user)
  }

  async getTask(taskId: string, user: CurrentUserData): Promise<Task> {
    return await this.getTaskUseCase.execute(taskId, user)
  }

  async listTask(
    input: ListTaskInputDto,
    user: CurrentUserData,
  ): Promise<PaginatedTasksOutputDto<Task>> {
    return await this.listTaskUseCase.execute(input, user)
  }

  async updateTask(
    taskId: string,
    input: UpdateTaskInputDto,
    user: CurrentUserData,
  ): Promise<Task> {
    return await this.updateTaskUseCase.execute(taskId, input, user)
  }

  async updateStatusTask(
    taskId: string,
    status: TaskStatus,
    user: CurrentUserData,
    order?: number,
  ): Promise<Task> {
    return await this.updateStatusTaskUseCase.execute(
      taskId,
      status,
      user,
      order,
    )
  }
}
