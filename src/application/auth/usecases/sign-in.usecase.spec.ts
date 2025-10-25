import {
  InvalidCredentialsError,
  SignInValidationError,
} from '@/application/auth/errors/auth.errors'
import { UserDao } from '@/application/auth/ports/user.dao'
import { SignInUseCase } from '@/application/auth/usecases/sign-in.usecase'
import { PrismaUserDao } from '@/infrastructure/database/daos/user.dao'
import { ProviderValidationError } from '@/infrastructure/http/shared/provider-validation.error'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'

jest.mock('@/infrastructure/database/daos/user.dao')
jest.mock('bcrypt')

describe('SignInUseCase', () => {
  let useCase: SignInUseCase
  let userDao: jest.Mocked<UserDao>
  let jwtService: jest.Mocked<JwtService>

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [
        SignInUseCase,
        {
          provide: UserDao,
          useClass: PrismaUserDao,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = moduleFixture.get(SignInUseCase)
    userDao = moduleFixture.get(UserDao)
    jwtService = moduleFixture.get(JwtService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('should sign in successfully with valid credentials', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
      }
      const user = {
        id: 'user-1',
        email: input.email,
        password: 'hashedPassword123',
        name: 'Test User',
        role: 'USER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const accessToken = 'jwt-token-123'

      userDao.findByEmail = jest.fn().mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true)
      jwtService.sign = jest.fn().mockReturnValue(accessToken)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(userDao.findByEmail).toHaveBeenCalledWith(input.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, user.password)
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      })
      expect(result).toEqual({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    })

    it('should sign in successfully with ADMIN user', async () => {
      // Arrange
      const input = {
        email: 'admin@example.com',
        password: 'admin123',
      }
      const user = {
        id: 'admin-1',
        email: input.email,
        password: 'hashedPassword123',
        name: 'Admin User',
        role: 'ADMIN' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const accessToken = 'jwt-token-admin'

      userDao.findByEmail = jest.fn().mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true)
      jwtService.sign = jest.fn().mockReturnValue(accessToken)

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(userDao.findByEmail).toHaveBeenCalledWith(input.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, user.password)
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      })
      expect(result).toEqual({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    })

    it('should throw InvalidCredentialsError when user does not exist', async () => {
      // Arrange
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      userDao.findByEmail = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        InvalidCredentialsError,
      )
      await expect(useCase.execute(input)).rejects.toThrow(
        'E-mail ou senha inválidos',
      )
      expect(userDao.findByEmail).toHaveBeenCalledWith(input.email)
      expect(bcrypt.compare).not.toHaveBeenCalled()
      expect(jwtService.sign).not.toHaveBeenCalled()
    })

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }
      const user = {
        id: 'user-1',
        email: input.email,
        password: 'hashedPassword123',
        name: 'Test User',
        role: 'USER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userDao.findByEmail = jest.fn().mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        InvalidCredentialsError,
      )
      await expect(useCase.execute(input)).rejects.toThrow(
        'E-mail ou senha inválidos',
      )
      expect(userDao.findByEmail).toHaveBeenCalledWith(input.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, user.password)
      expect(jwtService.sign).not.toHaveBeenCalled()
    })

    it('should throw SignInValidationError when DAO throws ProviderValidationError', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
      }
      const error = new ProviderValidationError('Database validation error')

      userDao.findByEmail = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        SignInValidationError,
      )
      await expect(useCase.execute(input)).rejects.toThrow(
        'Database validation error',
      )
    })

    it('should rethrow InvalidCredentialsError', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
      }

      userDao.findByEmail = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        InvalidCredentialsError,
      )
    })

    it('should rethrow non-ProviderValidationError errors', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
      }
      const error = new Error('Unexpected error')

      userDao.findByEmail = jest.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Unexpected error')
    })
  })
})
