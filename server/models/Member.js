const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    membershipId: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    joinedAt: { type: Date, default: Date.now },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Member', MemberSchema)
