const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('./middleware/mongoSanitize');
const xss = require('./middleware/xssClean');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// 0. Express 5 Compatibility: redefine req.query and req.params to be mutable properties
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  if (req.params) {
    Object.defineProperty(req, 'params', {
      value: { ...req.params },
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
});

// 1. Enable Security Headers
app.use(helmet());

// 2. Enable Logging in Dev mode
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// 3. Rate Limiting for general API and Auth
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max 1000 requests per IP
  message: 'Too many requests from this IP, please try again in 15 minutes.'
});
app.use('/api', limiter);

// 4. CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 5. Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 6. Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize);

// 7. Data Sanitization against XSS
app.use(xss);

// 8. Swagger / Docs Setup (optional path)
// We will serve a simple JSON endpoint for Swagger if needed.

// 9. API Routes
app.use('/api', routes);

// 10. Fallback for unhandled routes
app.all('*any', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 11. Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
