import { TaskDao } from '@/application/task/ports/task.dao'
import { UpdateTaskUseCase } from '@/application/task/usecases/update-task.usecase'
import {
  TaskNotFoundError,
  TaskOwnershipError,
  UpdateTaskValidationError,
} from '@/application/task/errors/task.errors'
import { PrismaTaskDao } from '@/infrastructure/database/daos/task.dao'
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error'
import { Test } from '@nestjs/testing'

jest.mock('@/infrastructure/database/daos/task.dao')

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase
  let taskDao: jest.Mocked<TaskDao>

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
    const moduleFixture = await Test.createTestingModule({
      providers: [
        {
          provide: TaskDao,
          useClass: PrismaTaskDao,
        },
        UpdateTaskUseCase,
      ],
    }).compile()

    useCase = moduleFixture.get(UpdateTaskUseCase)
    taskDao = moduleFixture.get(TaskDao)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('should update task successfully when user is the owner', async () => {
      // Arrange
      const input = { title: 'Updated Title' }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const updatedTask = { ...mockTask, ...input }

      taskDao.findById = jest.fn().mockResolvedValue(mockTask)
      taskDao.updateTask = jest.fn().mockResolvedValue(updatedTask)

      // Act
      const result = await useCase.execute('task-1', input, user)

      // Assert
      expect(taskDao.findById).toHaveBeenCalledWith('task-1')
      expect(taskDao.updateTask).toHaveBeenCalledWith('task-1', input)
      expect(result).toEqual(updatedTask)
    })

    it('should update task with multiple fields', async () => {
      // Arrange
      const input = {
        title: 'Updated Title',
        description: 'Updated Description',
        priority: 'HIGH' as const,
        dueDate: '2024-12-31',
      }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const updatedTask = { ...mockTask, ...input }

      taskDao.findById = jest.fn().mockResolvedValue(mockTask)
      taskDao.updateTask = jest.fn().mockResolvedValue(updatedTask)

      // Act
      const result = await useCase.execute('task-1', input, user)

      // Assert
      expect(taskDao.findById).toHaveBeenCalledWith('task-1')
      expect(taskDao.updateTask).toHaveBeenCalledWith('task-1', input)
      expect(result).toEqual(updatedTask)
    })

    it('should throw TaskNotFoundError when task does not exist', async () => {
      // Arrange
      const input = { title: 'Updated Title' }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }

      taskDao.findById = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        TaskNotFoundError,
      )
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        'Tarefa não encontrada',
      )
    })

    it('should throw TaskOwnershipError when user is not the owner', async () => {
      // Arrange
      const input = { title: 'Updated Title' }
      const user = { id: 'user-2', email: 'other@test.com', role: 'USER' }

      taskDao.findById = jest.fn().mockResolvedValue(mockTask)

      // Act & Assert
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        TaskOwnershipError,
      )
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        'Você só pode atualizar suas próprias tarefas',
      )
    })

    it('should throw TaskOwnershipError even when user is ADMIN', async () => {
      // Arrange
      const input = { title: 'Updated Title' }
      const user = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' }

      taskDao.findById = jest.fn().mockResolvedValue(mockTask)

      // Act & Assert
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        TaskOwnershipError,
      )
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        'Você só pode atualizar suas próprias tarefas',
      )
    })

    it('should throw UpdateTaskValidationError when DAO throws ProviderValidationError', async () => {
      // Arrange
      const input = { title: 'Updated Title' }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const error = new ProviderValidationError('Database error')

      taskDao.findById = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        UpdateTaskValidationError,
      )
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        'Database error',
      )
    })

    it('should rethrow non-ProviderValidationError errors', async () => {
      // Arrange
      const input = { title: 'Updated Title' }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const error = new Error('Unexpected error')

      taskDao.findById = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute('task-1', input, user)).rejects.toThrow(
        'Unexpected error',
      )
    })
  })
})
