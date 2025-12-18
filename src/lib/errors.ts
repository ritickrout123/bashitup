// Database and Application Error Handling

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Error handler for Prisma errors
export function handlePrismaError(error: unknown): never {
  const prismaError = error as {
    code?: string;
    meta?: { target?: string[] };
    name?: string;
  };

  if (prismaError.code === 'P2002') {
    // Unique constraint violation
    const field = prismaError.meta?.target?.[0] || 'field';
    throw new ConflictError(`${field} already exists`);
  }

  if (prismaError.code === 'P2025') {
    // Record not found
    throw new NotFoundError('Record');
  }

  if (prismaError.code === 'P2003') {
    // Foreign key constraint violation
    throw new ValidationError('Invalid reference to related record');
  }

  if (prismaError.code === 'P2014') {
    // Required relation violation
    throw new ValidationError('Required relation is missing');
  }

  // Generic database error
  throw new DatabaseError(
    'Database operation failed',
    prismaError.code || 'UNKNOWN_DB_ERROR'
  );
}

// Async error wrapper for database operations
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      const errorObj = error as { name?: string };
      if (errorObj.name === 'PrismaClientKnownRequestError') {
        handlePrismaError(error);
      }
      throw error;
    }
  };
}