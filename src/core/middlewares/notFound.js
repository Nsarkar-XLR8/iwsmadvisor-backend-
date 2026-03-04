import { NotFoundError } from '../../errors/index.js';

export default (req, res, next) => {
    next(new NotFoundError('Route', req.originalUrl));
};
