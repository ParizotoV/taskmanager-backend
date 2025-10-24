import { TaskService } from "@/application/task/service/task.service";
import { CreateTaskDto } from "@/interfaces/http/api/v1/controllers/task/dtos/create-task.dto";
import { UpdateTaskDto } from "@/interfaces/http/api/v1/controllers/task/dtos/update-task.dto";
import { DeleteTaskDto } from "@/interfaces/http/api/v1/controllers/task/dtos/delete-task.dto";
import { GetTaskDto } from "@/interfaces/http/api/v1/controllers/task/dtos/get-task.dto";
import { ListTasksQueryDto } from "@/interfaces/http/api/v1/controllers/task/dtos/list-task.dto";
import { UpdateStatusTaskDto, UpdateStatusTaskQueryDto } from "@/interfaces/http/api/v1/controllers/task/dtos/update-status-task.dto";
import { JwtAuthGuard } from "@/interfaces/http/guards/jwt-auth.guard";
import { CurrentUser, CurrentUserData } from "@/interfaces/http/decorators/current-user.decorator";
import RequestResponseDocumentation from "@/shared/decorators/request-responses.decorator";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @RequestResponseDocumentation({
    success: {
      status: 201,
      description: 'Tarefa criada com sucesso',
    },
    summary: 'Cria uma nova tarefa'
  })
  @Post()
  async createTask(
    @Body() body: CreateTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.taskService.createTask(body, user);
  }

  @RequestResponseDocumentation({
    success: {
      status: 200,
      description: 'Tarefa obtida com sucesso',
    },
    summary: 'Obtém uma tarefa pelo ID'
  })
  @Get(':id')
  async getTask(
    @Param() param: GetTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.taskService.getTask(param.id, user);
  }

  @RequestResponseDocumentation({
    success: {
      status: 200,
      description: 'Tarefas obtidas com sucesso',
    },
    summary: 'Obtém uma lista de tarefas'
  })
  @Get()
  async listTask(
    @Query() query: ListTasksQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.taskService.listTask(query, user);
  }

  @RequestResponseDocumentation({
    success: {
      status: 200,
      description: 'Tarefa atualizada com sucesso',
    },
    summary: 'Atualiza uma tarefa existente'
  })
  @Patch(':id')
  async updateTask(
    @Param() param: GetTaskDto,
    @Body() body: UpdateTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.taskService.updateTask(param.id, body, user);
  }

  @RequestResponseDocumentation({
    success: {
      status: 200,
      description: 'Status da tarefa atualizado com sucesso',
    },
    summary: 'Atualiza o status de uma tarefa existente'
  })
  @Patch(':id/status')
  async updateStatusTask(
    @Param() param: UpdateStatusTaskQueryDto,
    @Body() body: UpdateStatusTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.taskService.updateStatusTask(param.id, body.status, user, body.order);
  }

  @RequestResponseDocumentation({
    success: {
      status: 200,
      description: 'Tarefa deletada com sucesso',
    },
    summary: 'Deleta uma tarefa existente'
  })
  @Delete(':id')
  async deleteTask(
    @Param() param: DeleteTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.taskService.deleteTask(param.id, user);
  }

}