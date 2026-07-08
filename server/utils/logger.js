// Minimal logger to centralize logging. Replace with pino/winston later.
module.exports = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
}
