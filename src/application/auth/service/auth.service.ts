import { Injectable } from '@nestjs/common'
import { SignUpUseCase } from '@/application/auth/usecases/sign-up.usecase'
import { SignInUseCase } from '@/application/auth/usecases/sign-in.usecase'
import {
  SignUpInputDto,
  SignUpOutputDto,
} from '@/application/auth/usecases/dtos/sign-up.usecase.dto'
import {
  SignInInputDto,
  SignInOutputDto,
} from '@/application/auth/usecases/dtos/sign-in.usecase.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  async signUp(input: SignUpInputDto): Promise<SignUpOutputDto> {
    return await this.signUpUseCase.execute(input)
  }

  async signIn(input: SignInInputDto): Promise<SignInOutputDto> {
    return await this.signInUseCase.execute(input)
  }
}
