import { CreateTaskValidationError } from "@/application/task/errors/task.errors";
import { TaskDao } from "@/application/task/ports/task.dao";
import { CreateTaskInputDto } from "@/application/task/usecases/dtos/create-task.usecase.dto";
import { ProviderValidationError } from "@/infrastructure/http/shared/provider-validation.error";
import { CurrentUserData } from "@/interfaces/http/decorators/current-user.decorator";
import { Injectable } from "@nestjs/common";
import { Task } from "@prisma/client";

@Injectable()
export class CreateTaskUseCase {
  constructor(private readonly taskDao: TaskDao) { }

  async execute(input: CreateTaskInputDto, user: CurrentUserData): Promise<Task> {
    try {
      return await this.taskDao.createTask(input, user.id);
    } catch (error) {
      if (error instanceof ProviderValidationError) {
        throw new CreateTaskValidationError(error.message)
      }
      throw error
    }
  }
}