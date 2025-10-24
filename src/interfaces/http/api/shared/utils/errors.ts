import { ValidationError } from '@nestjs/common'

export function extractErrorMessages(errors: ValidationError[]): string[] {
  const result: string[] = []

  for (const error of errors) {
    if (error.constraints) {
      result.push(...Object.values(error.constraints))
    }
    if (error.children && error.children.length > 0) {
      result.push(...extractErrorMessages(error.children))
    }
  }

  return result
}
