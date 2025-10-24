import { InvalidCredentialsError, SignInValidationError } from "@/application/auth/errors/auth.errors";
import { UserDao } from "@/application/auth/ports/user.dao";
import { SignInInputDto, SignInOutputDto } from "@/application/auth/usecases/dtos/sign-in.usecase.dto";
import { ProviderValidationError } from "@/infrastructure/http/shared/provider-validation.error";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
  ) { }

  async execute(input: SignInInputDto): Promise<SignInOutputDto> {
    try {
      // Buscar usuário por e-mail
      const user = await this.userDao.findByEmail(input.email);
      if (!user) {
        throw new InvalidCredentialsError();
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      // Gerar JWT
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw error;
      }
      if (error instanceof ProviderValidationError) {
        throw new SignInValidationError(error.message);
      }
      throw error;
    }
  }
}
