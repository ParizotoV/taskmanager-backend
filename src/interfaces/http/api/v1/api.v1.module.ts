import ControllersModule from '@/interfaces/http/api/v1/controllers/controllers.module'
import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'

@Module({
  imports: [
    ControllersModule,
    RouterModule.register([
      {
        path: 'v1',
        module: ControllersModule,
      },
    ]),
  ],
})
export class ApiV1Module {}
