import { ApiProperty } from '@nestjs/swagger'
import { Priority } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsInt, IsISO8601, IsOptional, IsString, Min } from 'class-validator'

export class GetKanbanQueryDto {
  @ApiProperty({
    description: 'Filtrar por userId (apenas ADMIN)',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiProperty({
    description: 'Busca textual por título ou descrição',
    required: false,
    example: 'Implementar feature',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    description: 'Filtrar por prioridade',
    required: false,
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @ApiProperty({
    description: 'Data inicial do filtro de prazo (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dueDateFrom?: string

  @ApiProperty({
    description: 'Data final do filtro de prazo (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  dueDateTo?: string

  @ApiProperty({
    description: 'Filtrar apenas tarefas atrasadas',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  overdue?: boolean

  @ApiProperty({
    description: 'Limite máximo de tarefas por coluna (WIP limit)',
    required: false,
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxPerColumn?: number
}
