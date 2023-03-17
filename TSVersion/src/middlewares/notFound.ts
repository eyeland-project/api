// This is a handler used when and endpoint does not exist
import { RequestHandler } from "express";

const notFoundHandler: RequestHandler = function (_req, res, _next) {
  res.status(404).json({
    message: "Not Found"
  });
};

export default notFoundHandler;
