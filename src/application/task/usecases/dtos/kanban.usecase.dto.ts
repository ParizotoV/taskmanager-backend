import { Priority, Task } from '@prisma/client'

export interface KanbanFiltersInputDto {
  userId?: string // Apenas ADMIN pode usar esse filtro
  search?: string
  priority?: Priority
  dueDateFrom?: string
  dueDateTo?: string
  overdue?: boolean
  maxPerColumn?: number // WIP limit por coluna
}

export interface KanbanColumnOutputDto {
  status: string
  tasks: Task[]
  count: number
  wipLimit?: number
}

export interface KanbanBoardOutputDto {
  columns: KanbanColumnOutputDto[]
  totalTasks: number
}
