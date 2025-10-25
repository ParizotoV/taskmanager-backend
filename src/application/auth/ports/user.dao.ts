import {
  SignUpInputDto,
  SignUpOutputDto,
} from '@/application/auth/usecases/dtos/sign-up.usecase.dto'
import { User } from '@prisma/client'

export abstract class UserDao {
  abstract createUser(input: SignUpInputDto): Promise<SignUpOutputDto>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
}
