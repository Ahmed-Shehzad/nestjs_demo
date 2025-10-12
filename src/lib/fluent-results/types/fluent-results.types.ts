/* eslint-disable @typescript-eslint/no-unsafe-assignment */
type SuccessResult<T> = {
  isSuccess: true;
  value: T;
};

type FailureResult = {
  isSuccess: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
};

export type FluentResult<T> = SuccessResult<T> | FailureResult;

class FluentResultFactory {
  static success<T>(value: T): FluentResult<T> {
    return {
      isSuccess: true,
      value,
    };
  }

  static failure<T>(message: string, code: string, details?: any): FluentResult<T> {
    return {
      isSuccess: false,
      error: {
        message,
        code,
        details,
      },
    };
  }
}

export const FluentResult = FluentResultFactory;
