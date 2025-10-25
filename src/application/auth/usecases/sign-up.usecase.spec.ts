import {
  EmailAlreadyExistsError,
  SignUpValidationError,
} from '@/application/auth/errors/auth.errors'
import { UserDao } from '@/application/auth/ports/user.dao'
import { SignUpUseCase } from '@/application/auth/usecases/sign-up.usecase'
import { PrismaUserDao } from '@/infrastructure/database/daos/user.dao'
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error'
import { Test } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'

jest.mock('@/infrastructure/database/daos/user.dao')
jest.mock('bcrypt')

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase
  let userDao: jest.Mocked<UserDao>

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [
        SignUpUseCase,
        {
          provide: UserDao,
          useClass: PrismaUserDao,
        },
      ],
    }).compile()

    useCase = moduleFixture.get(SignUpUseCase)
    userDao = moduleFixture.get(UserDao)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const hashedPassword = 'hashedPassword123'
      const expectedUser = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        role: 'USER' as const,
        createdAt: new Date(),
      }

      userDao.findByEmail = jest.fn().mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue(hashedPassword)
      userDao.createUser = jest.fn().mockResolvedValue(expectedUser)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(userDao.findByEmail).toHaveBeenCalledWith(input.email)
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10)
      expect(userDao.createUser).toHaveBeenCalledWith({
        ...input,
        password: hashedPassword,
      })
      expect(result).toEqual(expectedUser)
    })

    it('should create a user with ADMIN role', async () => {
      // Arrange
      const input = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'ADMIN' as const,
      }
      const hashedPassword = 'hashedPassword123'
      const expectedUser = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        role: 'ADMIN' as const,
        createdAt: new Date(),
      }

      userDao.findByEmail = jest.fn().mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue(hashedPassword)
      userDao.createUser = jest.fn().mockResolvedValue(expectedUser)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(userDao.findByEmail).toHaveBeenCalledWith(input.email)
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10)
      expect(userDao.createUser).toHaveBeenCalledWith({
        ...input,
        password: hashedPassword,
      })
      expect(result).toEqual(expectedUser)
    })

    it('should throw EmailAlreadyExistsError when email already exists', async () => {
      // Arrange
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const existingUser = {
        id: 'existing-user-1',
        email: input.email,
        password: 'hashedPassword',
        name: 'Existing User',
        role: 'USER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userDao.findByEmail = jest.fn().mockResolvedValue(existingUser)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        EmailAlreadyExistsError,
      )
      await expect(useCase.execute(input)).rejects.toThrow(
        'Este e-mail já está cadastrado',
      )
      expect(userDao.findByEmail).toHaveBeenCalledWith(input.email)
      expect(userDao.createUser).not.toHaveBeenCalled()
    })

    it('should throw SignUpValidationError when DAO throws ProviderValidationError', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const hashedPassword = 'hashedPassword123'
      const error = new ProviderValidationError('Database validation error')

      userDao.findByEmail = jest.fn().mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue(hashedPassword)
      userDao.createUser = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        SignUpValidationError,
      )
      await expect(useCase.execute(input)).rejects.toThrow(
        'Database validation error',
      )
    })

    it('should rethrow EmailAlreadyExistsError', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const existingUser = {
        id: 'user-1',
        email: input.email,
        password: 'hash',
        name: 'User',
        role: 'USER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userDao.findByEmail = jest.fn().mockResolvedValue(existingUser)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        EmailAlreadyExistsError,
      )
    })

    it('should rethrow non-ProviderValidationError errors', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const error = new Error('Unexpected error')

      userDao.findByEmail = jest.fn().mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock) = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Unexpected error')
    })
  })
})
