import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class SignUpDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    minLength: 6,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({
    description: 'Papel do usuário no sistema',
    enum: Role,
    default: Role.USER,
    example: Role.USER
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role
}
