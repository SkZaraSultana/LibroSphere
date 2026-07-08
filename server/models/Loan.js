const mongoose = require('mongoose')

const LoanSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    borrowedAt: { type: Date, default: Date.now },
    dueAt: { type: Date, required: true },
    returnedAt: { type: Date, default: null },
    fine: { type: Number, default: 0 },
    status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
)

LoanSchema.virtual('isOverdue').get(function () {
  return !this.returnedAt && this.dueAt < new Date()
})

module.exports = mongoose.model('Loan', LoanSchema)
