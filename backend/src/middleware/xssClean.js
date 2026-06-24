// Custom in-place XSS sanitization middleware for Express 5 compatibility.
// In Express 5, req.query and req.params are read-only getters, so they cannot be reassigned.
// We sanitize their properties recursively in-place.

const cleanText = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitize = (data) => {
  if (typeof data === 'string') {
    return cleanText(data);
  }
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = sanitize(data[i]);
    }
  } else if (data !== null && typeof data === 'object') {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = sanitize(data[key]);
      }
    }
  }
  return data;
};

const xssClean = (req, res, next) => {
  if (req.body) {
    sanitize(req.body);
  }
  if (req.query) {
    sanitize(req.query); // Mutates query properties in-place, avoiding setter re-assignment exceptions
  }
  if (req.params) {
    sanitize(req.params);
  }
  next();
};

module.exports = xssClean;
