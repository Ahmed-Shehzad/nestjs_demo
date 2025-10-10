export class ValidationFailure {
  constructor(
    public readonly propertyName: string,
    public readonly errorMessage: string,
    public readonly attemptedValue?: unknown,
  ) {}

  toString(): string {
    return this.errorMessage;
  }
}

export class ValidationResult {
  constructor(public readonly errors: ValidationFailure[] = []) {}

  get isValid(): boolean {
    return this.errors.length === 0;
  }

  get errorMessages(): string[] {
    return this.errors.map((error) => error.errorMessage);
  }

  toString(): string {
    return this.errors.map((error) => error.toString()).join('\n');
  }

  throwIfInvalid(): void {
    if (!this.isValid) {
      throw new ValidationError('Validation failed', this.errors);
    }
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly failures: ValidationFailure[],
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
