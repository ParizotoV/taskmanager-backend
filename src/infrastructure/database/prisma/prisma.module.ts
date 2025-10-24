import { Global, Module } from '@nestjs/common'
import { PRISMA } from '@/infrastructure/database/prisma/prisma.provider'
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service'

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: PRISMA,
      useExisting: PrismaService,
    },
  ],
  exports: [PrismaService, PRISMA],
})
export class PrismaModule {}
