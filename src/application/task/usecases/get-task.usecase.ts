import type { CurrentUserData } from '@/application/shared/types/current-user.type'
import {
  GetTaskValidationError,
  TaskNotFoundError,
  TaskOwnershipError,
} from '@/application/task/errors/task.errors'
import { TaskDao } from '@/application/task/ports/task.dao'
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error'
import { Injectable } from '@nestjs/common'
import { Task } from '@prisma/client'

@Injectable()
export class GetTaskUseCase {
  constructor(private readonly taskDao: TaskDao) {}

  async execute(taskId: string, user: CurrentUserData): Promise<Task> {
    try {
      // 1. Buscar a tarefa
      const task = await this.taskDao.findById(taskId)

      if (!task) {
        throw new TaskNotFoundError('Tarefa não encontrada')
      }

      // 2. Validar acesso:
      // - ADMIN pode ver qualquer tarefa
      // - USER comum só pode ver suas próprias tarefas
      if (user.role !== 'ADMIN' && task.userId !== user.id) {
        throw new TaskOwnershipError(
          'Você não tem permissão para visualizar esta tarefa',
        )
      }

      return task
    } catch (error) {
      if (error instanceof ProviderValidationError) {
        throw new GetTaskValidationError(error.message)
      }
      throw error
    }
  }
}
