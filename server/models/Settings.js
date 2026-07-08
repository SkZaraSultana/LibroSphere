const mongoose = require('mongoose')

const SettingsSchema = new mongoose.Schema(
  {
    libraryName: { type: String, default: 'LibroSphere Library' },
    branch: { type: String, default: 'Main Branch' },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Settings', SettingsSchema)
