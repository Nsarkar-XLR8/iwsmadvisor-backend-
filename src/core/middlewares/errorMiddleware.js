import { AppError } from '../../errors/AppError.js';

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;
        error.code = err.code;

        // Handle specific Database/Mongoose errors if applicable
        if (error.name === 'CastError') {
            const message = `Invalid ${error.path}: ${error.value}.`;
            error = new AppError(message, 400);
        }
        if (error.code === 11000) {
            const message = `Duplicate field value entered. Please use another value!`;
            error = new AppError(message, 400);
        }
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors || {}).map(el => el.message);
            const message = `Invalid input data. ${errors.join('. ')}`;
            error = new AppError(message, 400);
        }

        sendErrorProd(error, res);
    }
};

export default errorHandler;

