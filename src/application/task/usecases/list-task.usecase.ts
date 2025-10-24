import { TaskDao } from '@/application/task/ports/task.dao';
import { ListTasksValidationError } from '@/application/task/errors/task.errors';
import { ListTaskInputDto, PaginatedTasksOutputDto } from '@/application/task/usecases/dtos/list-task.usecase.dto';
import { CurrentUserData } from '@/interfaces/http/decorators/current-user.decorator';
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error';
import { Task } from '@prisma/client';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class ListTaskUseCase {
  constructor(private readonly taskDao: TaskDao) {}

  async execute(
    input: ListTaskInputDto,
    user: CurrentUserData
  ): Promise<PaginatedTasksOutputDto<Task>> {
    try {
      // 1. Validar se usuário comum está tentando filtrar por outro userId
      if (input.userId && user.role !== 'ADMIN') {
        throw new ForbiddenException('Apenas ADMIN pode filtrar por userId');
      }

      // 2. Determinar qual userId filtrar:
      // - ADMIN sem filtro específico: vê todas (userId = undefined)
      // - ADMIN com filtro: vê do userId especificado
      // - USER: sempre vê apenas suas tarefas
      const userId = user.role === 'ADMIN'
        ? input.userId  // Admin pode filtrar por userId ou ver todas
        : user.id;      // User sempre vê só suas

      // 3. Buscar tarefas com filtros
      return await this.taskDao.findWithFilters(input, userId);
    } catch (error) {
      if (error instanceof ProviderValidationError) {
        throw new ListTasksValidationError(error.message);
      }
      throw error;
    }
  }
}