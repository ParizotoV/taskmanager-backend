import { AuthService } from '@/application/auth/service/auth.service';
import { SignUpUseCase } from '@/application/auth/usecases/sign-up.usecase';
import { SignInUseCase } from '@/application/auth/usecases/sign-in.usecase';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@/application/auth/usecases/sign-up.usecase');
jest.mock('@/application/auth/usecases/sign-in.usecase');

describe('AuthService', () => {
  let service: AuthService;
  let signUpUseCase: jest.Mocked<SignUpUseCase>;
  let signInUseCase: jest.Mocked<SignInUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, SignUpUseCase, SignInUseCase],
    }).compile();

    service = module.get<AuthService>(AuthService);
    signUpUseCase = module.get(SignUpUseCase);
    signInUseCase = module.get(SignInUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should call SignUpUseCase.execute with correct parameters', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const expectedResult = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        role: 'USER' as const,
        createdAt: new Date(),
      };

      jest.spyOn(signUpUseCase, 'execute').mockResolvedValue(expectedResult);

      const result = await service.signUp(input);

      expect(signUpUseCase.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });

    it('should call SignUpUseCase.execute with ADMIN role', async () => {
      const input = {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'ADMIN' as const,
      };
      const expectedResult = {
        id: 'admin-1',
        email: input.email,
        name: input.name,
        role: 'ADMIN' as const,
        createdAt: new Date(),
      };

      jest.spyOn(signUpUseCase, 'execute').mockResolvedValue(expectedResult);

      const result = await service.signUp(input);

      expect(signUpUseCase.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('signIn', () => {
    it('should call SignInUseCase.execute with correct parameters', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        accessToken: 'jwt-token-123',
        user: {
          id: 'user-1',
          email: input.email,
          name: 'Test User',
          role: 'USER',
        },
      };

      jest.spyOn(signInUseCase, 'execute').mockResolvedValue(expectedResult);

      const result = await service.signIn(input);

      expect(signInUseCase.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });

    it('should call SignInUseCase.execute for ADMIN user', async () => {
      const input = {
        email: 'admin@example.com',
        password: 'admin123',
      };
      const expectedResult = {
        accessToken: 'jwt-token-admin',
        user: {
          id: 'admin-1',
          email: input.email,
          name: 'Admin User',
          role: 'ADMIN',
        },
      };

      jest.spyOn(signInUseCase, 'execute').mockResolvedValue(expectedResult);

      const result = await service.signIn(input);

      expect(signInUseCase.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });
  });
});
