/**
 * Base Application Error
 * All custom errors extend this class.
 */
export class AppError extends Error {
    constructor(message, statusCode, errorCode = 'APP_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.status = false;
        this.errorCode = errorCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}