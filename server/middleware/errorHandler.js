// Centralized error handling middleware. Sends JSON responses with proper status codes.
module.exports = function (err, req, res, next) {
  console.error(err)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  const payload = { message }
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack
  res.status(status).json(payload)
}
