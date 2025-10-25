import type { CurrentUserData } from '@/application/shared/types/current-user.type'
import {
  TaskNotFoundError,
  TaskOwnershipError,
  UpdateStatusTaskValidationError,
} from '@/application/task/errors/task.errors'
import { TaskDao } from '@/application/task/ports/task.dao'
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error'
import { Injectable } from '@nestjs/common'
import { Task, TaskStatus } from '@prisma/client'

@Injectable()
export class UpdateStatusTaskUseCase {
  constructor(private readonly taskDao: TaskDao) {}

  async execute(
    taskId: string,
    status: TaskStatus,
    user: CurrentUserData,
    order?: number,
  ): Promise<Task> {
    try {
      // 1. Buscar a tarefa
      const task = await this.taskDao.findById(taskId)

      if (!task) {
        throw new TaskNotFoundError('Tarefa não encontrada')
      }

      // 2. Validar ownership - SOMENTE o dono pode atualizar status (mesmo admin não pode)
      if (task.userId !== user.id) {
        throw new TaskOwnershipError(
          'Você só pode atualizar o status de suas próprias tarefas',
        )
      }

      // 3. Atualizar status e ordem (drag & drop)
      return await this.taskDao.updateStatus(taskId, status, order)
    } catch (error) {
      if (error instanceof ProviderValidationError) {
        throw new UpdateStatusTaskValidationError(error.message)
      }
      throw error
    }
  }
}
