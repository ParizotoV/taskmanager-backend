import { TaskService } from '@/application/task/service/task.service';
import { CreateTaskUseCase } from '@/application/task/usecases/create-task.usecase';
import { DeleteTaskUseCase } from '@/application/task/usecases/delete-task.usecase';
import { GetTaskUseCase } from '@/application/task/usecases/get-task.usecase';
import { ListTaskUseCase } from '@/application/task/usecases/list-task.usecase';
import { UpdateStatusTaskUseCase } from '@/application/task/usecases/update-status-task.usecase';
import { UpdateTaskUseCase } from '@/application/task/usecases/update-task.usecase';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@/application/task/usecases/create-task.usecase');
jest.mock('@/application/task/usecases/delete-task.usecase');
jest.mock('@/application/task/usecases/get-task.usecase');
jest.mock('@/application/task/usecases/list-task.usecase');
jest.mock('@/application/task/usecases/update-status-task.usecase');
jest.mock('@/application/task/usecases/update-task.usecase');

describe('TaskService', () => {
  let service: TaskService;
  let createTaskUseCase: jest.Mocked<CreateTaskUseCase>;
  let deleteTaskUseCase: jest.Mocked<DeleteTaskUseCase>;
  let getTaskUseCase: jest.Mocked<GetTaskUseCase>;
  let listTaskUseCase: jest.Mocked<ListTaskUseCase>;
  let updateStatusTaskUseCase: jest.Mocked<UpdateStatusTaskUseCase>;
  let updateTaskUseCase: jest.Mocked<UpdateTaskUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        CreateTaskUseCase,
        DeleteTaskUseCase,
        GetTaskUseCase,
        ListTaskUseCase,
        UpdateStatusTaskUseCase,
        UpdateTaskUseCase,
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    createTaskUseCase = module.get(CreateTaskUseCase);
    deleteTaskUseCase = module.get(DeleteTaskUseCase);
    getTaskUseCase = module.get(GetTaskUseCase);
    listTaskUseCase = module.get(ListTaskUseCase);
    updateStatusTaskUseCase = module.get(UpdateStatusTaskUseCase);
    updateTaskUseCase = module.get(UpdateTaskUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should call CreateTaskUseCase.execute with correct parameters', async () => {
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM' as const,
      };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const expectedResult = { id: 'task-1', ...input, userId: user.id };

      jest.spyOn(createTaskUseCase, 'execute').mockResolvedValue(expectedResult as any);

      const result = await service.createTask(input, user);

      expect(createTaskUseCase.execute).toHaveBeenCalledWith(input, user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteTask', () => {
    it('should call DeleteTaskUseCase.execute with correct parameters', async () => {
      const taskId = 'task-1';
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };

      jest.spyOn(deleteTaskUseCase, 'execute').mockResolvedValue(undefined);

      await service.deleteTask(taskId, user);

      expect(deleteTaskUseCase.execute).toHaveBeenCalledWith(taskId, user);
    });
  });

  describe('getTask', () => {
    it('should call GetTaskUseCase.execute with correct parameters', async () => {
      const taskId = 'task-1';
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const expectedResult = { id: taskId, title: 'Test', userId: user.id };

      jest.spyOn(getTaskUseCase, 'execute').mockResolvedValue(expectedResult as any);

      const result = await service.getTask(taskId, user);

      expect(getTaskUseCase.execute).toHaveBeenCalledWith(taskId, user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('listTask', () => {
    it('should call ListTaskUseCase.execute with correct parameters', async () => {
      const input = { page: 1, limit: 10 };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const expectedResult = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      jest.spyOn(listTaskUseCase, 'execute').mockResolvedValue(expectedResult as any);

      const result = await service.listTask(input, user);

      expect(listTaskUseCase.execute).toHaveBeenCalledWith(input, user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateTask', () => {
    it('should call UpdateTaskUseCase.execute with correct parameters', async () => {
      const taskId = 'task-1';
      const input = { title: 'Updated Title' };
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const expectedResult = { id: taskId, ...input, userId: user.id };

      jest.spyOn(updateTaskUseCase, 'execute').mockResolvedValue(expectedResult as any);

      const result = await service.updateTask(taskId, input, user);

      expect(updateTaskUseCase.execute).toHaveBeenCalledWith(taskId, input, user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateStatusTask', () => {
    it('should call UpdateStatusTaskUseCase.execute with correct parameters', async () => {
      const taskId = 'task-1';
      const status = 'IN_PROGRESS' as const;
      const order = 5;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const expectedResult = { id: taskId, status, order, userId: user.id };

      jest.spyOn(updateStatusTaskUseCase, 'execute').mockResolvedValue(expectedResult as any);

      const result = await service.updateStatusTask(taskId, status, user, order);

      expect(updateStatusTaskUseCase.execute).toHaveBeenCalledWith(
        taskId,
        status,
        user,
        order,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call UpdateStatusTaskUseCase.execute without order parameter', async () => {
      const taskId = 'task-1';
      const status = 'COMPLETED' as const;
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' };
      const expectedResult = { id: taskId, status, userId: user.id };

      jest.spyOn(updateStatusTaskUseCase, 'execute').mockResolvedValue(expectedResult as any);

      const result = await service.updateStatusTask(taskId, status, user);

      expect(updateStatusTaskUseCase.execute).toHaveBeenCalledWith(
        taskId,
        status,
        user,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
