import { UserDao } from '@/application/auth/ports/user.dao'
import { PrismaUserDao } from '@/infrastructure/database/daos/user.dao'
import { PrismaModule } from '@/infrastructure/database/prisma/prisma.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: UserDao,
      useClass: PrismaUserDao,
    },
  ],
  exports: [UserDao],
})
export class UserDaoModule { }
