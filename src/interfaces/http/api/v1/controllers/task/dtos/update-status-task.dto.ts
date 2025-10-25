import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '@prisma/client'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UpdateStatusTaskDto {
  @ApiProperty({
    description: 'Novo status da tarefa (coluna de destino no Kanban)',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus

  @ApiPropertyOptional({
    description:
      'Nova posição da tarefa na coluna de destino (usado no drag & drop)',
    minimum: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number
}

export class UpdateStatusTaskQueryDto {
  @ApiPropertyOptional({
    description: 'ID da tarefa',
    example: true,
  })
  @IsString()
  id: string
}
