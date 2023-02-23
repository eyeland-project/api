import { ErrorRequestHandler, Response } from "express";

export class ApiError extends Error {
    statusCode!: number;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

const ERROR_HANDLERS: { [handler: string]: (res: Response, err?: any) => void } = {
    defaultError: (res: any) => (
        res.status(500).json({ message: 'Internal server error' })
    ),
};

const errorHandler: ErrorRequestHandler = (err: ApiError, _req, res, _next) => {
    console.error(err);
    const { statusCode, message } = err;
    // const handler = ERROR_HANDLERS[err.name] || ERROR_HANDLERS.defaultError;
    // handler(res);
    res.status(statusCode).json({ message: message });
};

export default errorHandler;
