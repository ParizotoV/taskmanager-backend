import { HealthModule } from '@/interfaces/http/api/health/health.module'
import { ApiV1Module } from '@/interfaces/http/api/v1/api.v1.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ApiV1Module,
    HealthModule,
  ],
})
export class AppModule {}
