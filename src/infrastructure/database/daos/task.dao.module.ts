import { TaskDao } from '@/application/task/ports/task.dao'
import { PrismaTaskDao } from '@/infrastructure/database/daos/task.dao'
import { PrismaModule } from '@/infrastructure/database/prisma/prisma.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TaskDao,
      useClass: PrismaTaskDao,
    },
  ],
  exports: [TaskDao],
})
export class TaskDaoModule {}
