// Custom in-place NoSQL Query Injection sanitizer middleware for Express 5.
// Prevents query/body/params key injections (deleting keys starting with '$' or containing '.') 
// without reassigning the query object reference, avoiding getter exceptions.

const isMongoKey = (key) => {
  return key.startsWith('$') || key.includes('.');
};

const sanitize = (data) => {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = sanitize(data[i]);
    }
  } else if (data !== null && typeof data === 'object') {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (isMongoKey(key)) {
          delete data[key];
        } else {
          data[key] = sanitize(data[key]);
        }
      }
    }
  }
  return data;
};

const mongoSanitize = (req, res, next) => {
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

module.exports = mongoSanitize;
