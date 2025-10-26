import { CreateTaskInputDto } from '@/application/task/usecases/dtos/create-task.usecase.dto'
import { UpdateTaskInputDto } from '@/application/task/usecases/dtos/update-task.usecase.dto'
import {
  ListTaskInputDto,
  PaginatedTasksOutputDto,
} from '@/application/task/usecases/dtos/list-task.usecase.dto'
import {
  KanbanFiltersInputDto,
  KanbanBoardOutputDto,
} from '@/application/task/usecases/dtos/kanban.usecase.dto'
import { Task, TaskStatus } from '@prisma/client'

export abstract class TaskDao {
  abstract createTask(input: CreateTaskInputDto, userId: string): Promise<Task>
  abstract findById(id: string): Promise<Task | null>
  abstract findByUserId(userId: string): Promise<Task[]>
  abstract findAll(): Promise<Task[]>
  abstract findWithFilters(
    input: ListTaskInputDto,
    userId?: string,
  ): Promise<PaginatedTasksOutputDto<Task>>
  abstract findForKanban(
    userId: string,
    filters?: KanbanFiltersInputDto,
  ): Promise<KanbanBoardOutputDto>
  abstract updateTask(id: string, input: UpdateTaskInputDto): Promise<Task>
  abstract updateStatus(
    id: string,
    status: TaskStatus,
    order?: number,
  ): Promise<Task>
  abstract updateOrder(id: string, order: number): Promise<Task>
  abstract deleteTask(id: string): Promise<void>
}
