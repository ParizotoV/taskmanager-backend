import { ApiPropertyOptional } from '@nestjs/swagger'
import { Priority, TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class ListTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Página atual',
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Itens por página',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: TaskStatus,
    example: TaskStatus.PENDING
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({
    description: 'Filtrar por prioridade',
    enum: Priority,
    example: Priority.HIGH
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @ApiPropertyOptional({
    description: 'Buscar no título ou descrição',
    example: 'autenticação'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filtrar por ID do usuário (apenas ADMIN)',
    example: 'uuid-do-usuario'
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({
    description: 'Filtrar tarefas com prazo a partir de',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string

  @ApiPropertyOptional({
    description: 'Filtrar tarefas com prazo até',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string

  @ApiPropertyOptional({
    description: 'Filtrar apenas tarefas atrasadas',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  overdue?: boolean

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    enum: ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority', 'status'],
    default: 'createdAt',
    example: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc'
}