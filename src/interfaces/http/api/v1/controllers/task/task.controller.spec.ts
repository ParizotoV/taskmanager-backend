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
})
