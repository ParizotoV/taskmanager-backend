import { TaskDao } from '@/application/task/ports/task.dao';
import { UpdateStatusTaskUseCase } from '@/application/task/usecases/update-status-task.usecase';
import {
  TaskNotFoundError,
  TaskOwnershipError,
  UpdateStatusTaskValidationError,
} from '@/application/task/errors/task.errors';
import { PrismaTaskDao } from '@/infrastructure/database/daos/task.dao';
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error';
import { Test } from '@nestjs/testing';

jest.mock('@/infrastructure/database/daos/task.dao');

describe('UpdateStatusTaskUseCase', () => {
  let useCase: UpdateStatusTaskUseCase;
  let taskDao: jest.Mocked<TaskDao>;

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
  };

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [
        {
          provide: TaskDao,
          useClass: PrismaTaskDao,
        },
        UpdateStatusTaskUseCase,
      ],
    }).compile();

    useCase = moduleFixture.get(UpdateStatusTaskUseCase);
    taskDao = moduleFixture.get(TaskDao);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update task status successfully when user is the owner', async () => {
      // Arrange
      const status = 'IN_PROGRESS' as const;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const updatedTask = { ...mockTask, status };

      taskDao.findById = jest.fn().mockResolvedValue(mockTask);
      taskDao.updateStatus = jest.fn().mockResolvedValue(updatedTask);

      // Act
      const result = await useCase.execute('task-1', status, user);

      // Assert
      expect(taskDao.findById).toHaveBeenCalledWith('task-1');
      expect(taskDao.updateStatus).toHaveBeenCalledWith('task-1', status, undefined);
      expect(result).toEqual(updatedTask);
    });

    it('should update task status with order for drag & drop', async () => {
      // Arrange
      const status = 'COMPLETED' as const;
      const order = 5;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const updatedTask = { ...mockTask, status, order };

      taskDao.findById = jest.fn().mockResolvedValue(mockTask);
      taskDao.updateStatus = jest.fn().mockResolvedValue(updatedTask);

      // Act
      const result = await useCase.execute('task-1', status, user, order);

      // Assert
      expect(taskDao.findById).toHaveBeenCalledWith('task-1');
      expect(taskDao.updateStatus).toHaveBeenCalledWith('task-1', status, order);
      expect(result).toEqual(updatedTask);
    });

    it('should update from PENDING to IN_PROGRESS', async () => {
      // Arrange
      const status = 'IN_PROGRESS' as const;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const updatedTask = { ...mockTask, status };

      taskDao.findById = jest.fn().mockResolvedValue(mockTask);
      taskDao.updateStatus = jest.fn().mockResolvedValue(updatedTask);

      // Act
      const result = await useCase.execute('task-1', status, user);

      // Assert
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should update from IN_PROGRESS to COMPLETED', async () => {
      // Arrange
      const taskInProgress = { ...mockTask, status: 'IN_PROGRESS' as const };
      const status = 'COMPLETED' as const;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const updatedTask = { ...taskInProgress, status };

      taskDao.findById = jest.fn().mockResolvedValue(taskInProgress);
      taskDao.updateStatus = jest.fn().mockResolvedValue(updatedTask);

      // Act
      const result = await useCase.execute('task-1', status, user);

      // Assert
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw TaskNotFoundError when task does not exist', async () => {
      // Arrange
      const status = 'IN_PROGRESS' as const;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };

      taskDao.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        TaskNotFoundError,
      );
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        'Tarefa não encontrada',
      );
    });

    it('should throw TaskOwnershipError when user is not the owner', async () => {
      // Arrange
      const status = 'IN_PROGRESS' as const;
      const user = { id: 'user-2', email: 'other@test.com', role: 'USER' };

      taskDao.findById = jest.fn().mockResolvedValue(mockTask);

      // Act & Assert
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        TaskOwnershipError,
      );
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        'Você só pode atualizar o status de suas próprias tarefas',
      );
    });

    it('should throw TaskOwnershipError even when user is ADMIN', async () => {
      // Arrange
      const status = 'IN_PROGRESS' as const;
      const user = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };

      taskDao.findById = jest.fn().mockResolvedValue(mockTask);

      // Act & Assert
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        TaskOwnershipError,
      );
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        'Você só pode atualizar o status de suas próprias tarefas',
      );
    });

    it('should throw UpdateStatusTaskValidationError when DAO throws ProviderValidationError', async () => {
      // Arrange
      const status = 'IN_PROGRESS' as const;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const error = new ProviderValidationError('Database error');

      taskDao.findById = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        UpdateStatusTaskValidationError,
      );
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        'Database error',
      );
    });

    it('should rethrow non-ProviderValidationError errors', async () => {
      // Arrange
      const status = 'IN_PROGRESS' as const;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const error = new Error('Unexpected error');

      taskDao.findById = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute('task-1', status, user)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });
});
