import { ApplicationError } from '@/application/shared/errors/application.error'
import { ClassValidatorException } from '@/interfaces/http/errors/class-validator.exception'
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    console.log({ exception })

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | any[] = 'Internal server error'

    if (exception instanceof ClassValidatorException) {
      status = HttpStatus.BAD_REQUEST
      message = exception.validationErrors
    } else if (exception instanceof ApplicationError) {
      status = HttpStatus.BAD_REQUEST
      message = exception.message
    } else if (exception instanceof HttpException) {
      message = exception.message
      status = exception.getStatus()
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    })
  }
}
