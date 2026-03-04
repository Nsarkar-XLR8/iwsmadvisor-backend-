import { AppError } from './AppError.js';

/**
 * 409 Conflict Error
 * Use for duplicate entries or resource conflicts.
 */
export class ConflictError extends AppError {
    constructor(message = 'A resource with that value already exists.', field = '') {
        super(message, 409, 'CONFLICT');
        this.field = field;
    }
}
