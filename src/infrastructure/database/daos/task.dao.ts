import { TaskDao } from '@/application/task/ports/task.dao'
import { CreateTaskInputDto } from '@/application/task/usecases/dtos/create-task.usecase.dto'
import {
  ListTaskInputDto,
  PaginatedTasksOutputDto,
} from '@/application/task/usecases/dtos/list-task.usecase.dto'
import {
  KanbanFiltersInputDto,
  KanbanBoardOutputDto,
  KanbanColumnOutputDto,
} from '@/application/task/usecases/dtos/kanban.usecase.dto'
import { UpdateTaskInputDto } from '@/application/task/usecases/dtos/update-task.usecase.dto'
import { PRISMA, PrismaService } from '@/infrastructure/database/prisma'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma, Task, TaskStatus } from '@prisma/client'

@Injectable()
export class PrismaTaskDao implements TaskDao {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaService) {}

  async createTask(input: CreateTaskInputDto, userId: string): Promise<Task> {
    return await this.prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status || TaskStatus.PENDING,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        order: input.order ?? 0,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async findById(id: string): Promise<Task | null> {
    return await this.prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async findAll(): Promise<Task[]> {
    return await this.prisma.task.findMany({
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async findWithFilters(
    input: ListTaskInputDto,
    userId?: string,
  ): Promise<PaginatedTasksOutputDto<Task>> {
    const page = input.page ?? 1
    const limit = input.limit ?? 10
    const skip = (page - 1) * limit

    const where: Prisma.TaskWhereInput = {
      ...(userId && { userId }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.search && {
        OR: [
          { title: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ],
      }),

      ...(input.dueDateFrom || input.dueDateTo
        ? {
            dueDate: {
              ...(input.dueDateFrom && { gte: new Date(input.dueDateFrom) }),
              ...(input.dueDateTo && { lte: new Date(input.dueDateTo) }),
            },
          }
        : {}),

      ...(input.overdue && {
        dueDate: { lt: new Date() },
        status: { not: TaskStatus.COMPLETED },
      }),
    }

    const orderBy = this.buildOrderBy(input.sortBy, input.sortOrder)

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  async findForKanban(
    userId: string,
    filters?: KanbanFiltersInputDto,
  ): Promise<KanbanBoardOutputDto> {
    const baseWhere: Prisma.TaskWhereInput = {
      userId,
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters?.dueDateFrom || filters?.dueDateTo
        ? {
            dueDate: {
              ...(filters.dueDateFrom && { gte: new Date(filters.dueDateFrom) }),
              ...(filters.dueDateTo && { lte: new Date(filters.dueDateTo) }),
            },
          }
        : {}),
      ...(filters?.overdue && {
        dueDate: { lt: new Date() },
        status: { not: TaskStatus.COMPLETED },
      }),
    }

    const statuses = Object.values(TaskStatus)

    const columns: KanbanColumnOutputDto[] = await Promise.all(
      statuses.map(async (status) => {
        const where: Prisma.TaskWhereInput = {
          ...baseWhere,
          status,
        }

        const tasks = await this.prisma.task.findMany({
          where,
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
          ...(filters?.maxPerColumn && { take: filters.maxPerColumn }),
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })

        const count = await this.prisma.task.count({ where })

        return {
          status,
          tasks,
          count,
          ...(filters?.maxPerColumn && { wipLimit: filters.maxPerColumn }),
        }
      }),
    )

    const totalTasks = columns.reduce((sum, column) => sum + column.count, 0)

    return {
      columns,
      totalTasks,
    }
  }

  async updateTask(id: string, input: UpdateTaskInputDto): Promise<Task> {
    return await this.prisma.task.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.status && { status: input.status }),
        ...(input.priority && { priority: input.priority }),
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
        ...(input.order !== undefined && { order: input.order }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    order?: number,
  ): Promise<Task> {
    return await this.prisma.task.update({
      where: { id },
      data: {
        status,
        ...(order !== undefined && { order }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async updateOrder(id: string, order: number): Promise<Task> {
    return await this.prisma.task.update({
      where: { id },
      data: { order },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async deleteTask(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    })
  }

  private buildOrderBy(
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Prisma.TaskOrderByWithRelationInput {
    const order = sortOrder ?? 'desc'

    const orderByMap: Record<string, Prisma.TaskOrderByWithRelationInput> = {
      createdAt: { createdAt: order },
      updatedAt: { updatedAt: order },
      title: { title: order },
      dueDate: { dueDate: order },
      priority: { priority: order },
      status: { status: order },
    }

    return orderByMap[sortBy ?? 'createdAt'] || { createdAt: 'desc' }
  }
}
