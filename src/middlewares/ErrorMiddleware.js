const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    console.error('Error:', {
        message: err.message,
        statusCode,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;