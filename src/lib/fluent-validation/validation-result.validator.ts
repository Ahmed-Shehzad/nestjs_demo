export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly failures: ValidationFailure[],
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ValidationFailure {
  constructor(
    public readonly propertyName: string,
    public readonly message: string,
    public readonly attemptedValue?: unknown,
  ) {}

  toString(): string {
    return JSON.stringify(
      {
        propertyName: this.propertyName,
        message: this.message,
        attemptedValue: this.attemptedValue,
      },
      null,
      2,
    );
  }
}

export class ValidationResult {
  constructor(public errors: ValidationFailure[] = []) {}
  get isValid() {
    return this.errors.length === 0;
  }

  get messages(): string[] {
    return this.errors.map((error) => error.message);
  }

  toString(): string {
    return this.errors.map((e) => e.toString()).join(',\n');
  }

  throwIfInvalid(): void {
    if (!this.isValid) {
      throw new ValidationError('Validation failed', this.errors);
    }
  }

  add(propertyName: string, message: string, attemptedValue?: unknown) {
    this.errors.push(new ValidationFailure(propertyName, message, attemptedValue));
  }
}
