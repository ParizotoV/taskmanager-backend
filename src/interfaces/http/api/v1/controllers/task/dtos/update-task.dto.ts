import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator'
import { TaskStatus, Priority } from '@prisma/client'

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Título da tarefa',
    example: 'Implementar autenticação JWT',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  title?: string

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Criar guards, decorators e endpoints de login/register',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({
    description: 'Status da tarefa',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @ApiPropertyOptional({
    description: 'Prioridade da tarefa',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority

  @ApiPropertyOptional({
    description: 'Data de vencimento da tarefa (envie null para remover)',
    example: '2025-01-30T23:59:59.000Z',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string | null

  @ApiPropertyOptional({
    description: 'Ordem da tarefa dentro da coluna (para drag & drop)',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number
}
