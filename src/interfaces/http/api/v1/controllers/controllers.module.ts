import { TaskModule } from '@/application/task/task.module';
import { AuthModule } from '@/application/auth/auth.module';
import { TaskController } from '@/interfaces/http/api/v1/controllers/task/task.controller';
import { AuthController } from '@/interfaces/http/api/v1/controllers/auth/auth.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TaskModule,
    AuthModule,
  ],
  controllers: [
    TaskController,
    AuthController,
  ],
})
export default class ControllersModule { }
