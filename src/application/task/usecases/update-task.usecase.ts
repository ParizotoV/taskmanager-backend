import { CurrentUserData } from '@/application/shared/types/current-user.type'
import {
  TaskNotFoundError,
  TaskOwnershipError,
  UpdateTaskValidationError,
} from '@/application/task/errors/task.errors'
import { TaskDao } from '@/application/task/ports/task.dao'
import { UpdateTaskInputDto } from '@/application/task/usecases/dtos/update-task.usecase.dto'
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error'
import { Injectable } from '@nestjs/common'
import { Task } from '@prisma/client'

@Injectable()
export class UpdateTaskUseCase {
  constructor(private readonly taskDao: TaskDao) {}

  async execute(
    taskId: string,
    input: UpdateTaskInputDto,
    user: CurrentUserData,
  ): Promise<Task> {
    try {
      // 1. Buscar a tarefa
      const task = await this.taskDao.findById(taskId)

      if (!task) {
        throw new TaskNotFoundError('Tarefa não encontrada')
      }

      // 2. Validar ownership - SOMENTE o dono pode atualizar (mesmo admin não pode)
      if (task.userId !== user.id) {
        throw new TaskOwnershipError(
          'Você só pode atualizar suas próprias tarefas',
        )
      }

      // 3. Atualizar a tarefa
      return await this.taskDao.updateTask(taskId, input)
    } catch (error) {
      if (error instanceof ProviderValidationError) {
        throw new UpdateTaskValidationError(error.message)
      }
      throw error
    }
  }
}
