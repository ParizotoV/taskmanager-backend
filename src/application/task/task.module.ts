import { TaskService } from '@/application/task/service/task.service'
import { CreateTaskUseCase } from '@/application/task/usecases/create-task.usecase'
import { DeleteTaskUseCase } from '@/application/task/usecases/delete-task.usecase'
import { GetTaskUseCase } from '@/application/task/usecases/get-task.usecase'
import { ListTaskUseCase } from '@/application/task/usecases/list-task.usecase'
import { UpdateStatusTaskUseCase } from '@/application/task/usecases/update-status-task.usecase'
import { UpdateTaskUseCase } from '@/application/task/usecases/update-task.usecase'
import { TaskDaoModule } from '@/infrastructure/database/daos/task.dao.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [TaskDaoModule],
  providers: [
    TaskService,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    GetTaskUseCase,
    ListTaskUseCase,
    UpdateTaskUseCase,
    UpdateStatusTaskUseCase,
  ],
  exports: [TaskService],
})
export class TaskModule {}
