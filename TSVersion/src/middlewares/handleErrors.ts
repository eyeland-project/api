import { ErrorRequestHandler, Response } from "express";

const ERROR_HANDLERS: { [handler: string]: (res: Response, err?: any) => void } = {
    defaultError: (res: any) => (
        res.status(500).json({ message: 'Internal server error' })
    ),
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const handler = ERROR_HANDLERS[err.name] || ERROR_HANDLERS.defaultError;
    console.log(err);

    handler(res);
};

export default errorHandler;