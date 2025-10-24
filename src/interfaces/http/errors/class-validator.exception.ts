export class ClassValidatorException extends Error {
  constructor(public readonly validationErrors: any[]) {
    super('Validation failed')
    this.name = 'ClassValidatorException'
  }
}
