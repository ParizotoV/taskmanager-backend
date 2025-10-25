import { HealthController } from '@/interfaces/http/api/health/health.controller'
import { Module } from '@nestjs/common'

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
