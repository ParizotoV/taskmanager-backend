import { EmailAlreadyExistsError, SignUpValidationError } from "@/application/auth/errors/auth.errors";
import { UserDao } from "@/application/auth/ports/user.dao";
import { SignUpInputDto, SignUpOutputDto } from "@/application/auth/usecases/dtos/sign-up.usecase.dto";
import { ProviderValidationError } from "@/infrastructure/http/shared/provider-validation.error";
import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class SignUpUseCase {
  constructor(private readonly userDao: UserDao) { }

  async execute(input: SignUpInputDto): Promise<SignUpOutputDto> {
    try {
      // Verificar se o e-mail já existe
      const existingUser = await this.userDao.findByEmail(input.email);
      if (existingUser) {
        throw new EmailAlreadyExistsError();
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Criar usuário
      const user = await this.userDao.createUser({
        ...input,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        throw error;
      }
      if (error instanceof ProviderValidationError) {
        throw new SignUpValidationError(error.message);
      }
      throw error;
    }
  }
}
