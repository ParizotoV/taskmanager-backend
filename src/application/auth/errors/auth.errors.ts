import { ApplicationError } from '@/application/shared/errors/application.error'

export class SignUpValidationError extends ApplicationError {
  constructor(message: string) {
    super('SignUpValidationError', message)
  }
}

export class EmailAlreadyExistsError extends ApplicationError {
  constructor(message?: string) {
    super(
      'EmailAlreadyExistsError',
      message || 'Este e-mail já está cadastrado',
    )
  }
}

export class SignInValidationError extends ApplicationError {
  constructor(message: string) {
    super('SignInValidationError', message)
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor(message?: string) {
    super('InvalidCredentialsError', message || 'E-mail ou senha inválidos')
  }
}

export class UserNotFoundError extends ApplicationError {
  constructor(message?: string) {
    super('UserNotFoundError', message || 'Usuário não encontrado')
  }
}
