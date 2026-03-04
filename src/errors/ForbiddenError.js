import { AppError } from './AppError.js';

/**
 * 403 Forbidden Error
 * Use when the user is authenticated but lacks permission.
 */
export class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action.') {
        super(message, 403, 'FORBIDDEN');
    }
}
