import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, IsString, ValidateIf } from 'class-validator'

export class BadRequestExceptionResponseOutputDto {
  @ApiProperty({
    description: 'Código de status HTTP da resposta',
    example: 400,
  })
  @IsInt()
  statusCode: number

  @ApiProperty({
    description: 'Mensagem descritiva sobre o status ou erro',
    example: 'Requisição inválida',
  })
  @ValidateIf((o) => typeof o.myProperty === 'string')
  @IsString()
  @ValidateIf((o) => Array.isArray(o.myProperty))
  @IsArray()
  message: string | any[]
}

export class InternalServerErrorExceptionResponseOutputDto {
  @ApiProperty({
    description: 'Código de status HTTP da resposta',
    example: 500,
  })
  @IsInt()
  statusCode: number

  @ApiProperty({
    description: 'Mensagem descritiva sobre o status ou erro',
    example: 'Internal server error',
  })
  @IsString()
  message: string
}
