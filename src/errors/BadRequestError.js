import { AppError } from './AppError.js';

/**
 * 400 Bad Request Error
 * Use when the client sends invalid or malformed data.
 */
export class BadRequestError extends AppError {
    constructor(message = 'Bad request.', errors = []) {
        super(message, 400, 'BAD_REQUEST');
        this.errors = errors; // Array of field-level error details
    }
}
