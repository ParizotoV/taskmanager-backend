import { CurrentUserData } from '@/application/shared/types/current-user.type'
import { TaskDao } from '@/application/task/ports/task.dao'
import {
  KanbanBoardOutputDto,
  KanbanFiltersInputDto,
} from '@/application/task/usecases/dtos/kanban.usecase.dto'
import { ForbiddenException, Inject, Injectable } from '@nestjs/common'

@Injectable()
export class GetKanbanUseCase {
  constructor(@Inject(TaskDao) private readonly taskDao: TaskDao) { }

  async execute(
    filters: KanbanFiltersInputDto,
    user: CurrentUserData,
  ): Promise<KanbanBoardOutputDto> {
    // 1. Validar se usuário comum está tentando filtrar por outro userId
    if (filters.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas ADMIN pode filtrar por userId')
    }

    // 2. Determinar qual userId filtrar:
    // - ADMIN sem filtro específico: vê todas (userId = undefined)
    // - ADMIN com filtro: vê do userId especificado
    // - USER: sempre vê apenas suas tarefas
    const userId =
      user.role === 'ADMIN'
        ? filters.userId // Admin pode filtrar por userId ou ver todas
        : user.id // User sempre vê só suas

    return await this.taskDao.findForKanban(userId, filters)
  }
}
