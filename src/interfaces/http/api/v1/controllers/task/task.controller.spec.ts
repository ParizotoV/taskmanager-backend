import { TaskService } from '@/application/task/service/task.service'
import { TaskController } from '@/interfaces/http/api/v1/controllers/task/task.controller'
import { Test, TestingModule } from '@nestjs/testing'

jest.mock('@/application/task/service/task.service')

describe('TaskController', () => {
  let controller: TaskController
  let taskService: jest.Mocked<TaskService>

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    role: 'USER',
  }

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING' as const,
    priority: 'MEDIUM' as const,
    dueDate: null,
    order: 0,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@test.com',
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [TaskService],
    }).compile()

    controller = module.get<TaskController>(TaskController)
    taskService = module.get(TaskService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM' as const,
      }

      jest.spyOn(taskService, 'createTask').mockResolvedValue(mockTask as any)

      const result = await controller.createTask(createTaskDto, mockUser)

      expect(taskService.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      )
      expect(result).toEqual(mockTask)
    })

    it('should create a task with all optional fields', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        dueDate: '2024-12-31',
        order: 5,
      }

      const taskWithAllFields = {
        ...mockTask,
        ...createTaskDto,
        dueDate: new Date(createTaskDto.dueDate),
      }

      jest
        .spyOn(taskService, 'createTask')
        .mockResolvedValue(taskWithAllFields as any)

      const result = await controller.createTask(createTaskDto, mockUser)

      expect(taskService.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      )
      expect(result).toEqual(taskWithAllFields)
    })
  })

  describe('getTask', () => {
    it('should get a task by id successfully', async () => {
      const param = { id: 'task-1' }

      jest.spyOn(taskService, 'getTask').mockResolvedValue(mockTask as any)

      const result = await controller.getTask(param, mockUser)

      expect(taskService.getTask).toHaveBeenCalledWith('task-1', mockUser)
      expect(result).toEqual(mockTask)
    })
  })

  describe('listTask', () => {
    it('should list tasks with default pagination', async () => {
      const query = { page: 1, limit: 10 }
      const mockResponse = {
        data: [mockTask],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }

      jest.spyOn(taskService, 'listTask').mockResolvedValue(mockResponse as any)

      const result = await controller.listTask(query, mockUser)

      expect(taskService.listTask).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockResponse)
    })

    it('should list tasks with filters', async () => {
      const query = {
        page: 1,
        limit: 10,
        status: 'PENDING' as const,
        priority: 'HIGH' as const,
        search: 'test',
      }
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }

      jest.spyOn(taskService, 'listTask').mockResolvedValue(mockResponse as any)

      const result = await controller.listTask(query, mockUser)

      expect(taskService.listTask).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockResponse)
    })

    it('should list tasks with date range filters', async () => {
      const query = {
        page: 1,
        limit: 10,
        dueDateFrom: '2024-01-01',
        dueDateTo: '2024-12-31',
      }
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }

      jest.spyOn(taskService, 'listTask').mockResolvedValue(mockResponse as any)

      const result = await controller.listTask(query, mockUser)

      expect(taskService.listTask).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockResponse)
    })

    it('should list overdue tasks', async () => {
      const query = {
        page: 1,
        limit: 10,
        overdue: true,
      }
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }

      jest.spyOn(taskService, 'listTask').mockResolvedValue(mockResponse as any)

      const result = await controller.listTask(query, mockUser)

      expect(taskService.listTask).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockResponse)
    })

    it('should list tasks with sorting', async () => {
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'dueDate',
        sortOrder: 'asc' as const,
      }
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }

      jest.spyOn(taskService, 'listTask').mockResolvedValue(mockResponse as any)

      const result = await controller.listTask(query, mockUser)

      expect(taskService.listTask).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const param = { id: 'task-1' }
      const updateTaskDto = { title: 'Updated Title' }
      const updatedTask = { ...mockTask, ...updateTaskDto }

      jest
        .spyOn(taskService, 'updateTask')
        .mockResolvedValue(updatedTask as any)

      const result = await controller.updateTask(param, updateTaskDto, mockUser)

      expect(taskService.updateTask).toHaveBeenCalledWith(
        'task-1',
        updateTaskDto,
        mockUser,
      )
      expect(result).toEqual(updatedTask)
    })

    it('should update multiple task fields', async () => {
      const param = { id: 'task-1' }
      const updateTaskDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        priority: 'HIGH' as const,
        dueDate: '2024-12-31',
      }
      const updatedTask = { ...mockTask, ...updateTaskDto }

      jest
        .spyOn(taskService, 'updateTask')
        .mockResolvedValue(updatedTask as any)

      const result = await controller.updateTask(param, updateTaskDto, mockUser)

      expect(taskService.updateTask).toHaveBeenCalledWith(
        'task-1',
        updateTaskDto,
        mockUser,
      )
      expect(result).toEqual(updatedTask)
    })
  })

  describe('updateStatusTask', () => {
    it('should update task status successfully', async () => {
      const param = { id: 'task-1' }
      const updateStatusDto = { status: 'IN_PROGRESS' as const }
      const updatedTask = { ...mockTask, status: 'IN_PROGRESS' as const }

      jest
        .spyOn(taskService, 'updateStatusTask')
        .mockResolvedValue(updatedTask as any)

      const result = await controller.updateStatusTask(
        param,
        updateStatusDto,
        mockUser,
      )

      expect(taskService.updateStatusTask).toHaveBeenCalledWith(
        'task-1',
        'IN_PROGRESS',
        mockUser,
        undefined,
      )
      expect(result).toEqual(updatedTask)
    })

    it('should update task status with order for drag & drop', async () => {
      const param = { id: 'task-1' }
      const updateStatusDto = { status: 'COMPLETED' as const, order: 5 }
      const updatedTask = {
        ...mockTask,
        status: 'COMPLETED' as const,
        order: 5,
      }

      jest
        .spyOn(taskService, 'updateStatusTask')
        .mockResolvedValue(updatedTask as any)

      const result = await controller.updateStatusTask(
        param,
        updateStatusDto,
        mockUser,
      )

      expect(taskService.updateStatusTask).toHaveBeenCalledWith(
        'task-1',
        'COMPLETED',
        mockUser,
        5,
      )
      expect(result).toEqual(updatedTask)
    })

    it('should update from PENDING to IN_PROGRESS', async () => {
      const param = { id: 'task-1' }
      const updateStatusDto = { status: 'IN_PROGRESS' as const }
      const updatedTask = { ...mockTask, status: 'IN_PROGRESS' as const }

      jest
        .spyOn(taskService, 'updateStatusTask')
        .mockResolvedValue(updatedTask as any)

      const result = await controller.updateStatusTask(
        param,
        updateStatusDto,
        mockUser,
      )

      expect(result.status).toBe('IN_PROGRESS')
    })

    it('should update from IN_PROGRESS to COMPLETED', async () => {
      const param = { id: 'task-1' }
      const updateStatusDto = { status: 'COMPLETED' as const }
      const taskInProgress = { ...mockTask, status: 'IN_PROGRESS' as const }
      const updatedTask = { ...taskInProgress, status: 'COMPLETED' as const }

      jest
        .spyOn(taskService, 'updateStatusTask')
        .mockResolvedValue(updatedTask as any)

      const result = await controller.updateStatusTask(
        param,
        updateStatusDto,
        mockUser,
      )

      expect(result.status).toBe('COMPLETED')
    })
  })

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const param = { id: 'task-1' }

      jest.spyOn(taskService, 'deleteTask').mockResolvedValue(undefined)

      await controller.deleteTask(param, mockUser)

      expect(taskService.deleteTask).toHaveBeenCalledWith('task-1', mockUser)
    })
  })

  describe('getKanban', () => {
    it('should get kanban board without filters', async () => {
      const query = {}
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [mockTask],
            count: 1,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
          },
        ],
        totalTasks: 1,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockKanbanBoard)
      expect(result.totalTasks).toBe(1)
      expect(result.columns).toHaveLength(3)
    })

    it('should get kanban board with search filter', async () => {
      const query = { search: 'test task' }
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [mockTask],
            count: 1,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
          },
        ],
        totalTasks: 1,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockKanbanBoard)
    })

    it('should get kanban board with priority filter', async () => {
      const query = { priority: 'HIGH' as const }
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [],
            count: 0,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [{ ...mockTask, priority: 'HIGH' as const }],
            count: 1,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
          },
        ],
        totalTasks: 1,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result.columns[1].tasks[0].priority).toBe('HIGH')
    })

    it('should get kanban board with date range filters', async () => {
      const query = {
        dueDateFrom: '2024-01-01',
        dueDateTo: '2024-12-31',
      }
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [
              {
                ...mockTask,
                dueDate: new Date('2024-06-15'),
              },
            ],
            count: 1,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
          },
        ],
        totalTasks: 1,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result).toEqual(mockKanbanBoard)
    })

    it('should get kanban board with overdue filter', async () => {
      const query = { overdue: true }
      const overdueTask = {
        ...mockTask,
        dueDate: new Date('2020-01-01'),
        status: 'PENDING' as const,
      }
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [overdueTask],
            count: 1,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
          },
        ],
        totalTasks: 1,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result.columns[0].tasks[0].dueDate).toEqual(
        new Date('2020-01-01'),
      )
    })

    it('should get kanban board with WIP limit (maxPerColumn)', async () => {
      const query = { maxPerColumn: 5 }
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: Array(5).fill(mockTask),
            count: 10,
            wipLimit: 5,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
            wipLimit: 5,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
            wipLimit: 5,
          },
        ],
        totalTasks: 10,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result.columns[0].wipLimit).toBe(5)
      expect(result.columns[0].tasks).toHaveLength(5)
      expect(result.columns[0].count).toBe(10)
    })

    it('should get empty kanban board when no tasks exist', async () => {
      const query = {}
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [],
            count: 0,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
          },
        ],
        totalTasks: 0,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result.totalTasks).toBe(0)
      expect(result.columns.every((col) => col.count === 0)).toBe(true)
    })

    it('should get kanban board for admin with userId filter', async () => {
      const adminUser = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' }
      const query = { userId: 'user-1' }
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [mockTask],
            count: 1,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
          },
        ],
        totalTasks: 1,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, adminUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, adminUser)
      expect(result).toEqual(mockKanbanBoard)
    })

    it('should get kanban board with multiple filters combined', async () => {
      const query = {
        search: 'important',
        priority: 'HIGH' as const,
        overdue: true,
        maxPerColumn: 3,
      }
      const mockKanbanBoard = {
        columns: [
          {
            status: 'PENDING',
            tasks: [
              {
                ...mockTask,
                priority: 'HIGH' as const,
                dueDate: new Date('2020-01-01'),
              },
            ],
            count: 5,
            wipLimit: 3,
          },
          {
            status: 'IN_PROGRESS',
            tasks: [],
            count: 0,
            wipLimit: 3,
          },
          {
            status: 'COMPLETED',
            tasks: [],
            count: 0,
            wipLimit: 3,
          },
        ],
        totalTasks: 5,
      }

      jest
        .spyOn(taskService, 'getKanban')
        .mockResolvedValue(mockKanbanBoard as any)

      const result = await controller.getKanban(query, mockUser)

      expect(taskService.getKanban).toHaveBeenCalledWith(query, mockUser)
      expect(result.columns[0].tasks[0].priority).toBe('HIGH')
      expect(result.columns[0].wipLimit).toBe(3)
    })
  })
})
