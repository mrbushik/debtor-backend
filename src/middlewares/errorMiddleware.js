"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const ApiErrors_1 = require("../exceptions/ApiErrors");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof ApiErrors_1.ApiError) {
        res.status(err.status).json({ message: err.message, errors: err.errors });
        return;
    }
    console.log("error middleware");
    res.status(500).json({ message: "An unexpected error occurred" });
};
exports.errorMiddleware = errorMiddleware;
