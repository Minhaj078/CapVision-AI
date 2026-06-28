// Express central error-handling middleware signature
export function errorHandler(err, req, res, next) {
    console.error(`[Error Handler] Uncaught exception occurred on route ${req.method} ${req.url}:`);
    console.error(err.stack || err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'An unexpected server error occurred';
    res.status(statusCode).json({
        error: {
            message,
            statusCode,
            timestamp: new Date().toISOString()
        }
    });
}
export default errorHandler;
