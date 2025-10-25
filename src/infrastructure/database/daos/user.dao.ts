import { UserDao } from '@/application/auth/ports/user.dao'
import {
  SignUpInputDto,
  SignUpOutputDto,
} from '@/application/auth/usecases/dtos/sign-up.usecase.dto'
import { PRISMA, PrismaService } from '@/infrastructure/database/prisma'
import { Inject, Injectable } from '@nestjs/common'
import { Role, User } from '@prisma/client'

@Injectable()
export class PrismaUserDao implements UserDao {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaService) {}

  async createUser(input: SignUpInputDto): Promise<SignUpOutputDto> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role || Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    })
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    })
  }
}
