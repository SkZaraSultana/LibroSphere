const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    publisher: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    publishedYear: { type: Number, required: true, min: 0 },
    edition: { type: String, required: true, trim: true },
    shelfLocation: { type: String, required: true, trim: true },
    copies: { type: Number, default: 1, min: 0 },
    coverImage: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Book', BookSchema)
