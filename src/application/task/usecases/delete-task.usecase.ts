import { TaskDao } from '@/application/task/ports/task.dao';
import { DeleteTaskValidationError, TaskNotFoundError, TaskOwnershipError } from '@/application/task/errors/task.errors';
import { CurrentUserData } from '@/interfaces/http/decorators/current-user.decorator';
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteTaskUseCase {
  constructor(private readonly taskDao: TaskDao) {}

  async execute(taskId: string, user: CurrentUserData): Promise<void> {
    try {
      // 1. Buscar a tarefa
      const task = await this.taskDao.findById(taskId);

      if (!task) {
        throw new TaskNotFoundError('Tarefa não encontrada');
      }

      // 2. Validar ownership - SOMENTE o dono pode deletar (mesmo admin não pode)
      if (task.userId !== user.id) {
        throw new TaskOwnershipError('Você só pode deletar suas próprias tarefas');
      }

      // 3. Deletar a tarefa
      await this.taskDao.deleteTask(taskId);
    } catch (error) {
      if (error instanceof ProviderValidationError) {
        throw new DeleteTaskValidationError(error.message);
      }
      throw error;
    }
  }
}