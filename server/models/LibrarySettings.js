const mongoose = require('mongoose')

const LibrarySettingsSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    defaultBorrowDays: { type: Number, default: 14 },
    finePerDay: { type: Number, default: 5 },
    maxBooksPerMember: { type: Number, default: 5 },
    autoFine: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('LibrarySettings', LibrarySettingsSchema)
