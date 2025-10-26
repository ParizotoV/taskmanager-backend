import { TaskDao } from '@/application/task/ports/task.dao'
import { GetKanbanUseCase } from '@/application/task/usecases/get-kanban.usecase'
import { ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('GetKanbanUseCase', () => {
  let useCase: GetKanbanUseCase
  let taskDao: jest.Mocked<TaskDao>

  const mockTaskDao = {
    findForKanban: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetKanbanUseCase,
        {
          provide: TaskDao,
          useValue: mockTaskDao,
        },
      ],
    }).compile()

    useCase = module.get<GetKanbanUseCase>(GetKanbanUseCase)
    taskDao = module.get(TaskDao)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  describe('execute', () => {
    it('should return kanban board for a regular user', async () => {
      const filters = { search: 'test', priority: 'HIGH' as const }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const expectedResult = {
        columns: [
          {
            status: 'PENDING',
            tasks: [
              {
                id: 'task-1',
                title: 'Test Task',
                status: 'PENDING',
                userId: 'user-1',
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

      taskDao.findForKanban.mockResolvedValue(expectedResult as any)

      const result = await useCase.execute(filters, user)

      expect(taskDao.findForKanban).toHaveBeenCalledWith('user-1', filters)
      expect(result).toEqual(expectedResult)
    })

    it('should return kanban board for an admin without userId filter', async () => {
      const filters = { search: 'test' }
      const user = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' }
      const expectedResult = {
        columns: [
          {
            status: 'PENDING',
            tasks: [
              { id: 'task-1', title: 'Task 1', userId: 'user-1' },
              { id: 'task-2', title: 'Task 2', userId: 'user-2' },
            ],
            count: 2,
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
        totalTasks: 2,
      }

      taskDao.findForKanban.mockResolvedValue(expectedResult as any)

      const result = await useCase.execute(filters, user)

      // Admin sem filtro vê todas as tarefas (userId = undefined)
      expect(taskDao.findForKanban).toHaveBeenCalledWith(undefined, filters)
      expect(result).toEqual(expectedResult)
    })

    it('should return kanban board for an admin with userId filter', async () => {
      const filters = { userId: 'user-1', search: 'test' }
      const user = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' }
      const expectedResult = {
        columns: [
          {
            status: 'PENDING',
            tasks: [{ id: 'task-1', title: 'Task 1', userId: 'user-1' }],
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

      taskDao.findForKanban.mockResolvedValue(expectedResult as any)

      const result = await useCase.execute(filters, user)

      // Admin com filtro vê apenas do userId especificado
      expect(taskDao.findForKanban).toHaveBeenCalledWith('user-1', filters)
      expect(result).toEqual(expectedResult)
    })

    it('should throw ForbiddenException when regular user tries to filter by userId', async () => {
      const filters = { userId: 'other-user', search: 'test' }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }

      await expect(useCase.execute(filters, user)).rejects.toThrow(
        ForbiddenException,
      )
      await expect(useCase.execute(filters, user)).rejects.toThrow(
        'Apenas ADMIN pode filtrar por userId',
      )

      expect(taskDao.findForKanban).not.toHaveBeenCalled()
    })

    it('should return empty kanban board when no tasks found', async () => {
      const filters = { search: 'nonexistent' }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const expectedResult = {
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

      taskDao.findForKanban.mockResolvedValue(expectedResult as any)

      const result = await useCase.execute(filters, user)

      expect(taskDao.findForKanban).toHaveBeenCalledWith('user-1', filters)
      expect(result).toEqual(expectedResult)
      expect(result.totalTasks).toBe(0)
    })

    it('should apply maxPerColumn filter correctly', async () => {
      const filters = { maxPerColumn: 5 }
      const user = { id: 'user-1', email: 'test@test.com', role: 'USER' }
      const expectedResult = {
        columns: [
          {
            status: 'PENDING',
            tasks: [
              { id: 'task-1', title: 'Task 1' },
              { id: 'task-2', title: 'Task 2' },
              { id: 'task-3', title: 'Task 3' },
              { id: 'task-4', title: 'Task 4' },
              { id: 'task-5', title: 'Task 5' },
            ],
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

      taskDao.findForKanban.mockResolvedValue(expectedResult as any)

      const result = await useCase.execute(filters, user)

      expect(taskDao.findForKanban).toHaveBeenCalledWith('user-1', filters)
      expect(result.columns[0].wipLimit).toBe(5)
      expect(result.columns[0].tasks.length).toBe(5)
      expect(result.columns[0].count).toBe(10)
    })
  })
})
