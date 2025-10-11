import { ValidationFailure } from '@/fluent-validation/validation-result.validator';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DomainProblemDetailsException,
  ProblemDetailsException,
  SecurityProblemDetailsException,
  ValidationProblemDetailsException,
} from '../exceptions/problem-details.exceptions';
import { ProblemDetailsService } from './problem-details.service';

describe('ProblemDetailsService', () => {
  let service: ProblemDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemDetailsService],
    }).compile();

    service = module.get<ProblemDetailsService>(ProblemDetailsService);
  });

  describe('createValidationProblem', () => {
    it('should create validation problem details from failures', () => {
      // Arrange
      const failures: ValidationFailure[] = [
        new ValidationFailure('email', 'Email is required', ''),
        new ValidationFailure('password', 'Password must be at least 6 characters', '123'),
      ];

      // Act
      const result = service.createValidationProblem(failures);

      // Assert
      expect(result).toBeInstanceOf(ValidationProblemDetailsException);
      expect(result.getStatus()).toBe(HttpStatus.BAD_REQUEST);

      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe('Validation Failed');
      expect(problemDetails.violations).toHaveLength(2);
    });

    it('should create validation problem with empty failures array', () => {
      // Arrange
      const failures: ValidationFailure[] = [];

      // Act
      const result = service.createValidationProblem(failures);

      // Assert
      expect(result).toBeInstanceOf(ValidationProblemDetailsException);
      const problemDetails = result.getProblemDetails();
      expect(problemDetails.violations).toHaveLength(0);
    });

    it('should handle complex validation failures', () => {
      // Arrange
      const failures: ValidationFailure[] = [
        new ValidationFailure('user.profile.email', 'Invalid email format', 'invalid-email'),
        new ValidationFailure('user.preferences[0].value', 'Value is required', null),
      ];

      // Act
      const result = service.createValidationProblem(failures);

      // Assert
      expect(result).toBeInstanceOf(ValidationProblemDetailsException);
      const problemDetails = result.getProblemDetails();
      expect(problemDetails.violations).toHaveLength(2);
      expect(problemDetails.violations[0].field).toBe('user.profile.email');
      expect(problemDetails.violations[1].field).toBe('user.preferences[0].value');
    });
  });

  describe('createDomainProblem', () => {
    it('should create domain problem details', () => {
      // Arrange
      const status = HttpStatus.NOT_FOUND;
      const title = 'Resource Not Found';
      const detail = 'The requested user was not found';
      const errorCode = 'USER_NOT_FOUND';
      const context = { userId: 123 };

      // Act
      const result = service.createDomainProblem(status, title, detail, errorCode, context);

      // Assert
      expect(result).toBeInstanceOf(DomainProblemDetailsException);
      expect(result.getStatus()).toBe(status);

      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe(title);
      expect(problemDetails.detail).toBe(detail);
      expect(problemDetails.code).toBe('DOMAIN_USER_NOT_FOUND');
      expect(problemDetails.context).toEqual(context);
    });

    it('should create domain problem with minimal parameters', () => {
      // Arrange
      const status = HttpStatus.BAD_REQUEST;
      const title = 'Business Rule Violation';

      // Act
      const result = service.createDomainProblem(status, title);

      // Assert
      expect(result).toBeInstanceOf(DomainProblemDetailsException);
      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe(title);
      expect(problemDetails.status).toBe(status);
    });
  });

  describe('createSecurityProblem', () => {
    it('should create security problem details', () => {
      // Arrange
      const status = HttpStatus.UNAUTHORIZED;
      const title = 'Authentication Required';
      const detail = 'Invalid credentials provided';

      // Act
      const result = service.createSecurityProblem(status, title, 'authentication', detail, 'Check your credentials');

      // Assert
      expect(result).toBeInstanceOf(SecurityProblemDetailsException);
      expect(result.getStatus()).toBe(status);

      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe(title);
      expect(problemDetails.detail).toBe(detail);
      expect(problemDetails.code).toBe('SECURITY_UNAUTHORIZED');
    });
  });

  describe('createUserNotFound', () => {
    it('should create user not found problem with string ID', () => {
      // Arrange
      const userId = 'user-123';

      // Act
      const result = service.createUserNotFound(userId);

      // Assert
      expect(result).toBeInstanceOf(ProblemDetailsException);
      expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);

      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe('Resource Not Found');
      expect(problemDetails.detail).toContain(userId);
    });

    it('should create user not found problem with numeric ID', () => {
      // Arrange
      const userId = 123;

      // Act
      const result = service.createUserNotFound(userId);

      // Assert
      expect(result).toBeInstanceOf(ProblemDetailsException);
      const problemDetails = result.getProblemDetails();
      expect(problemDetails.detail).toContain('123');
    });
  });

  describe('createDuplicateEmail', () => {
    it('should create duplicate email problem', () => {
      // Arrange
      const email = 'test@example.com';

      // Act
      const result = service.createDuplicateEmail(email);

      // Assert
      expect(result).toBeInstanceOf(DomainProblemDetailsException);
      expect(result.getStatus()).toBe(HttpStatus.CONFLICT);

      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe('Duplicate Email Address');
      expect(problemDetails.detail).toContain(email);
      expect(problemDetails.code).toBe('DOMAIN_DUPLICATE_EMAIL');
    });
  });

  describe('createInvalidCredentials', () => {
    it('should create invalid credentials problem', () => {
      // Act
      const result = service.createInvalidCredentials();

      // Assert
      expect(result).toBeInstanceOf(SecurityProblemDetailsException);
      expect(result.getStatus()).toBe(HttpStatus.UNAUTHORIZED);

      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe('Invalid Credentials');
      expect(problemDetails.code).toBe('SECURITY_UNAUTHORIZED');
    });
  });

  describe('createInsufficientPermissions', () => {
    it('should create insufficient permissions problem with action and resource', () => {
      // Arrange
      const action = 'delete';
      const resource = 'user';

      // Act
      const result = service.createInsufficientPermissions(action, resource);

      // Assert
      expect(result).toBeInstanceOf(SecurityProblemDetailsException);
      expect(result.getStatus()).toBe(HttpStatus.FORBIDDEN);

      const problemDetails = result.getProblemDetails();
      expect(problemDetails.title).toBe('Insufficient Permissions');
      expect(problemDetails.detail).toContain(action);
      expect(problemDetails.detail).toContain(resource);
    });

    it('should create insufficient permissions problem with action only', () => {
      // Arrange
      const action = 'admin';

      // Act
      const result = service.createInsufficientPermissions(action);

      // Assert
      expect(result).toBeInstanceOf(SecurityProblemDetailsException);
      const problemDetails = result.getProblemDetails();
      expect(problemDetails.detail).toContain(action);
    });
  });

  describe('error code mapping', () => {
    it('should map validation failure error codes correctly', () => {
      // Arrange
      const failures: ValidationFailure[] = [new ValidationFailure('email', 'Email is required', '')];

      // Act
      const result = service.createValidationProblem(failures);

      // Assert
      const problemDetails = result.getProblemDetails();
      expect(problemDetails.violations[0].code).toBe('REQUIRED_FIELD');
    });

    it('should handle missing error codes in validation failures', () => {
      // Arrange
      const failures: ValidationFailure[] = [new ValidationFailure('email', 'Email is required', '')];

      // Act
      const result = service.createValidationProblem(failures);

      // Assert
      expect(result).toBeInstanceOf(ValidationProblemDetailsException);
      const problemDetails = result.getProblemDetails();
      expect(problemDetails.violations[0].code).toBeDefined();
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of ProblemDetailsService', () => {
      expect(service).toBeInstanceOf(ProblemDetailsService);
    });
  });
});
