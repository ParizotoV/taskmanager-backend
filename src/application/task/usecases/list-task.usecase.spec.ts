import { TaskDao } from '@/application/task/ports/task.dao';
import { ListTaskUseCase } from '@/application/task/usecases/list-task.usecase';
import { ListTasksValidationError } from '@/application/task/errors/task.errors';
import { PrismaTaskDao } from '@/infrastructure/database/daos/task.dao';
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error';
import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('@/infrastructure/database/daos/task.dao');

describe('ListTaskUseCase', () => {
  let useCase: ListTaskUseCase;
  let taskDao: jest.Mocked<TaskDao>;

  const mockPaginatedResponse = {
    data: [
      {
        id: 'task-1',
        title: 'Test Task 1',
        description: 'Description 1',
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
      },
    ],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [
        {
          provide: TaskDao,
          useClass: PrismaTaskDao,
        },
        ListTaskUseCase,
      ],
    }).compile();

    useCase = moduleFixture.get(ListTaskUseCase);
    taskDao = moduleFixture.get(TaskDao);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should list tasks for USER (only their own)', async () => {
      // Arrange
      const input = { page: 1, limit: 10 };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      taskDao.findWithFilters = jest.fn().mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input, user);

      // Assert
      expect(taskDao.findWithFilters).toHaveBeenCalledWith(input, user.id);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should list all tasks for ADMIN when no userId filter is provided', async () => {
      // Arrange
      const input = { page: 1, limit: 10 };
      const user = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };
      taskDao.findWithFilters = jest.fn().mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input, user);

      // Assert
      expect(taskDao.findWithFilters).toHaveBeenCalledWith(input, undefined);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should list filtered tasks for ADMIN when userId filter is provided', async () => {
      // Arrange
      const input = { page: 1, limit: 10, userId: 'user-1' };
      const user = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };
      taskDao.findWithFilters = jest.fn().mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input, user);

      // Assert
      expect(taskDao.findWithFilters).toHaveBeenCalledWith(input, 'user-1');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should list tasks with filters (status, priority, search)', async () => {
      // Arrange
      const input = {
        page: 1,
        limit: 10,
        status: 'PENDING' as const,
        priority: 'HIGH' as const,
        search: 'test',
      };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      taskDao.findWithFilters = jest.fn().mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input, user);

      // Assert
      expect(taskDao.findWithFilters).toHaveBeenCalledWith(input, user.id);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should list tasks with date range filters', async () => {
      // Arrange
      const input = {
        page: 1,
        limit: 10,
        dueDateFrom: '2024-01-01',
        dueDateTo: '2024-12-31',
      };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      taskDao.findWithFilters = jest.fn().mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input, user);

      // Assert
      expect(taskDao.findWithFilters).toHaveBeenCalledWith(input, user.id);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should list overdue tasks', async () => {
      // Arrange
      const input = {
        page: 1,
        limit: 10,
        overdue: true,
      };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      taskDao.findWithFilters = jest.fn().mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input, user);

      // Assert
      expect(taskDao.findWithFilters).toHaveBeenCalledWith(input, user.id);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should throw ForbiddenException when USER tries to filter by userId', async () => {
      // Arrange
      const input = { page: 1, limit: 10, userId: 'other-user' };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };

      // Act & Assert
      await expect(useCase.execute(input, user)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(useCase.execute(input, user)).rejects.toThrow(
        'Apenas ADMIN pode filtrar por userId',
      );
    });

    it('should throw ListTasksValidationError when DAO throws ProviderValidationError', async () => {
      // Arrange
      const input = { page: 1, limit: 10 };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const error = new ProviderValidationError('Database error');
      taskDao.findWithFilters = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input, user)).rejects.toThrow(
        ListTasksValidationError,
      );
      await expect(useCase.execute(input, user)).rejects.toThrow('Database error');
    });

    it('should rethrow non-ProviderValidationError errors', async () => {
      // Arrange
      const input = { page: 1, limit: 10 };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const error = new Error('Unexpected error');
      taskDao.findWithFilters = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input, user)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });
});
