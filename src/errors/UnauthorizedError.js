import { AppError } from './AppError.js';

/**
 * 401 Unauthorized Error
 * Use when authentication is missing or invalid.
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required. Please log in.') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
