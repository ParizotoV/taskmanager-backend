import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Priority, TaskStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação JWT',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Criar guards, decorators e endpoints de login/register',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({
    description: 'Status inicial da tarefa',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    example: TaskStatus.PENDING
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @ApiPropertyOptional({
    description: 'Prioridade da tarefa',
    enum: Priority,
    default: Priority.MEDIUM,
    example: Priority.HIGH
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority

  @ApiPropertyOptional({
    description: 'Data de vencimento da tarefa',
    example: '2025-01-30T23:59:59.000Z'
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string

  @ApiPropertyOptional({
    description: 'Ordem da tarefa dentro da coluna (para drag & drop)',
    minimum: 0,
    default: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number
}