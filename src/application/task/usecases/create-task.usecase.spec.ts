import { CreateTaskValidationError } from '@/application/task/errors/task.errors'
import { TaskDao } from '@/application/task/ports/task.dao'
import { CreateTaskUseCase } from '@/application/task/usecases/create-task.usecase'
import { PrismaTaskDao } from '@/infrastructure/database/daos/task.dao'
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error'
import { Test } from '@nestjs/testing'

jest.mock('@/infrastructure/database/daos/task.dao')

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase
  let taskDao: jest.Mocked<TaskDao>

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        {
          provide: TaskDao,
          useClass: PrismaTaskDao,
        },
      ],
    }).compile()

    useCase = moduleFixture.get(CreateTaskUseCase)
    taskDao = moduleFixture.get(TaskDao)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('should create a task successfully', async () => {
      // Arrange
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM' as const,
      }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const expectedTask = {
        id: 'task-1',
        ...input,
        status: 'PENDING' as const,
        dueDate: null,
        order: 0,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: user.id,
          name: 'Test User',
          email: user.email,
        },
      }

      taskDao.createTask = jest.fn().mockResolvedValue(expectedTask)

      // Act
      const result = await useCase.execute(input, user)

      // Assert
      expect(taskDao.createTask).toHaveBeenCalledWith(input, user.id)
      expect(result).toEqual(expectedTask)
    })

    it('should create a task with all optional fields', async () => {
      // Arrange
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        dueDate: '2024-12-31',
        order: 5,
      }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const expectedTask = {
        id: 'task-1',
        ...input,
        dueDate: new Date(input.dueDate),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: user.id,
          name: 'Test User',
          email: user.email,
        },
      }

      taskDao.createTask = jest.fn().mockResolvedValue(expectedTask)

      // Act
      const result = await useCase.execute(input, user)

      // Assert
      expect(taskDao.createTask).toHaveBeenCalledWith(input, user.id)
      expect(result).toEqual(expectedTask)
    })

    it('should throw CreateTaskValidationError when DAO throws ProviderValidationError', async () => {
      // Arrange
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM' as const,
      }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const error = new ProviderValidationError('Database validation error')

      taskDao.createTask = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute(input, user)).rejects.toThrow(
        CreateTaskValidationError,
      )
      await expect(useCase.execute(input, user)).rejects.toThrow(
        'Database validation error',
      )
    })

    it('should rethrow non-ProviderValidationError errors', async () => {
      // Arrange
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM' as const,
      }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const error = new Error('Unexpected error')

      taskDao.createTask = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute(input, user)).rejects.toThrow(
        'Unexpected error',
      )
    })
  })
})
