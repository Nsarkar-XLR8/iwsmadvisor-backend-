import { AppError } from './AppError.js';

/**
 * 404 Not Found Error
 * Use when a requested resource (document, route, user, etc.) does not exist.
 */
export class NotFoundError extends AppError {
    constructor(resource = 'Resource', identifier = '') {
        const message = identifier
            ? `${resource} not found with identifier: ${identifier}`
            : `${resource} not found.`;
        super(message, 404, 'NOT_FOUND');
        this.resource = resource;
        this.identifier = identifier;
    }
}
