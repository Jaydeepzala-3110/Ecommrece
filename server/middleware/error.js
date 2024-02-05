const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500
    err.message = err.message || "Product not found"

    if (err.name === "CastError") {
        const message = `Resource not found ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    // cast error in mongodb
    if (err.code === 11000) {
        const key = Object.keys(err.keyValue)[0];
        const value = err.keyValue[key];
        const message = `Duplicate key error: ${key} '${value}' already exists.`;
        err = new ErrorHandler(message, 400);
    }

    if (err.name === "JsonWebTokenError") {
        return next(new ErrorHandler("Invalid token. Please log in again.", 401));
    }

    if (err.name === "TokenExpiredError") {
        return next(new ErrorHandler("Token has expired. Please log in again.", 401));
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
