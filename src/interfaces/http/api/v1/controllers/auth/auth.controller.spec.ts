import { AuthService } from '@/application/auth/service/auth.service';
import { AuthController } from '@/interfaces/http/api/v1/controllers/auth/auth.controller';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@/application/auth/service/auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp with correct parameters', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const expectedResult = {
        id: 'user-1',
        email: body.email,
        name: body.name,
        role: 'USER' as const,
        createdAt: new Date(),
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(expectedResult);

      const result = await controller.signUp(body);

      expect(authService.signUp).toHaveBeenCalledWith(body);
      expect(result).toEqual(expectedResult);
    });

    it('should call authService.signUp with ADMIN role', async () => {
      const body = {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'ADMIN' as const,
      };
      const expectedResult = {
        id: 'admin-1',
        email: body.email,
        name: body.name,
        role: 'ADMIN' as const,
        createdAt: new Date(),
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(expectedResult);

      const result = await controller.signUp(body);

      expect(authService.signUp).toHaveBeenCalledWith(body);
      expect(result).toEqual(expectedResult);
    });

    it('should handle signUp errors', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const error = new Error('Email already exists');

      jest.spyOn(authService, 'signUp').mockRejectedValue(error);

      await expect(controller.signUp(body)).rejects.toThrow('Email already exists');
      expect(authService.signUp).toHaveBeenCalledWith(body);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with correct parameters', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        accessToken: 'jwt-token-123',
        user: {
          id: 'user-1',
          email: body.email,
          name: 'Test User',
          role: 'USER',
        },
      };

      jest.spyOn(authService, 'signIn').mockResolvedValue(expectedResult);

      const result = await controller.signIn(body);

      expect(authService.signIn).toHaveBeenCalledWith(body);
      expect(result).toEqual(expectedResult);
    });

    it('should call authService.signIn for ADMIN user', async () => {
      const body = {
        email: 'admin@example.com',
        password: 'admin123',
      };
      const expectedResult = {
        accessToken: 'jwt-token-admin',
        user: {
          id: 'admin-1',
          email: body.email,
          name: 'Admin User',
          role: 'ADMIN',
        },
      };

      jest.spyOn(authService, 'signIn').mockResolvedValue(expectedResult);

      const result = await controller.signIn(body);

      expect(authService.signIn).toHaveBeenCalledWith(body);
      expect(result).toEqual(expectedResult);
    });

    it('should handle signIn errors', async () => {
      const body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const error = new Error('Invalid credentials');

      jest.spyOn(authService, 'signIn').mockRejectedValue(error);

      await expect(controller.signIn(body)).rejects.toThrow('Invalid credentials');
      expect(authService.signIn).toHaveBeenCalledWith(body);
    });
  });
});
