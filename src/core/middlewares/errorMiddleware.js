import { AppError, BadRequestError, NotFoundError, ConflictError } from '../../errors/index.js';

/**
 * Converts known system/database errors into detailed AppError instances.
 */
const handleCastError = (err) => {
    return new NotFoundError('Resource', err.value);
};

const handleDuplicateFieldError = (err) => {
    const field = Object.keys(err.keyValue || {})[0] || 'unknown';
    const value = err.keyValue?.[field] || 'unknown';
    return new ConflictError(
        `Duplicate value '${value}' for field '${field}'. Please use a different value.`,
        field
    );
};

const handleValidationError = (err) => {
    const fieldErrors = Object.values(err.errors || {}).map((el) => ({
        field: el.path,
        message: el.message,
        value: el.value,
        kind: el.kind,
    }));
    return new BadRequestError('Validation failed. Please check your input.', fieldErrors);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
    new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

const handleSyntaxError = (err) =>
    new BadRequestError(`Malformed JSON in request body: ${err.message}`);

/**
 * Global Error Handler Middleware
 *
 * Catches all errors and sends a structured, detailed JSON response.
 */
const errorHandler = (err, req, res, next) => {
    // 1. Normalize: convert known system errors into AppError instances
    let error = err;

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateFieldError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.type === 'entity.parse.failed') error = handleSyntaxError(err);

    // 2. Defaults
    const statusCode = error.statusCode || 500;
    const errorCode = error.errorCode || 'INTERNAL_ERROR';
    const message = error.isOperational ? error.message : 'Something went wrong on our end.';

    // 3. Always log for server-side debugging
    console.error('──────────────────────────────────────────────');
    console.error(`[${new Date().toISOString()}] ❌ ERROR`);
    console.error(`  Name      : ${err.name || 'Error'}`);
    console.error(`  Message   : ${err.message}`);
    console.error(`  Status    : ${statusCode}`);
    console.error(`  ErrorCode : ${errorCode}`);
    console.error(`  Path      : ${req.method} ${req.originalUrl}`);
    if (err.stack) console.error(`  Stack     : ${err.stack}`);
    console.error('──────────────────────────────────────────────');

    // 4. Build response
    const response = {
        status: false,
        statusCode,
        errorCode,
        message,
        path: `${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
    };

    // Include field-level validation errors if present
    if (error.errors && error.errors.length > 0) {
        response.errors = error.errors;
    }

    // Include conflicting field if present
    if (error.field) {
        response.field = error.field;
    }

    // Include resource info for NotFoundError
    if (error.resource) {
        response.resource = error.resource;
        response.identifier = error.identifier;
    }

    // Include stack trace in non-production for easy debugging
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export default errorHandler;
