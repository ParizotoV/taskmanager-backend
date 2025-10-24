
import { BadRequestExceptionResponseOutputDto, InternalServerErrorExceptionResponseOutputDto } from '@/interfaces/http/api/v1/dtos/shared/exception.response.dto'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

type RequestResponseDocumentationParams = {
  summary: string
  success: { status: number; description: string; type?: Type<unknown> }
  errors?: { status: number; description: string; type?: Type<unknown> }[]
}

export default function RequestResponseDocumentation(
  params: RequestResponseDocumentationParams,
) {
  const errors = params.errors
    ? params.errors.map((error) =>
      ApiResponse({
        status: error.status,
        description: error.description,
        ...(error.type ? { type: error.type } : {}),
      }),
    )
    : []

  return applyDecorators(
    ApiOperation({ summary: params.summary }),
    ApiResponse({
      status: params.success.status,
      description: params.success.description,
      ...(params.success.type ? { type: params.success.type } : {}),
    }),
    ApiResponse({
      status: 400,
      description: 'Dados inválidos',
      type: BadRequestExceptionResponseOutputDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: InternalServerErrorExceptionResponseOutputDto,
    }),
    ...errors,
  )
}
