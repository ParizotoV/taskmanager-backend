import { ApplicationError } from "@/application/shared/errors/application.error";

export class CreateTaskValidationError extends ApplicationError {
  constructor(message: string) {
    super('CreateTaskValidationError', message);
  }
}

export class TaskNotFoundError extends ApplicationError {
  constructor(message?: string) {
    super('TaskNotFoundError', message || 'Tarefa não encontrada');
  }
}

export class TaskOwnershipError extends ApplicationError {
  constructor(message?: string) {
    super('TaskOwnershipError', message || 'Você não tem permissão para acessar esta tarefa');
  }
}

export class DeleteTaskValidationError extends ApplicationError {
  constructor(message: string) {
    super('DeleteTaskValidationError', message);
  }
}

export class UpdateTaskValidationError extends ApplicationError {
  constructor(message: string) {
    super('UpdateTaskValidationError', message);
  }
}

export class GetTaskValidationError extends ApplicationError {
  constructor(message: string) {
    super('GetTaskValidationError', message);
  }
}

export class ListTasksValidationError extends ApplicationError {
  constructor(message: string) {
    super('ListTasksValidationError', message);
  }
}

export class UpdateStatusTaskValidationError extends ApplicationError {
  constructor(message: string) {
    super('UpdateStatusTaskValidationError', message);
  }
}