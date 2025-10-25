import { Role } from '@prisma/client'

export type SignUpInputDto = {
  email: string
  password: string
  name: string
  role?: Role
}

export type SignUpOutputDto = {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
}
