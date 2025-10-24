export class ProviderValidationError extends Error {
  constructor(
    message: string,
    readonly code = '',
  ) {
    super(message)
    this.code = code
  }
}
