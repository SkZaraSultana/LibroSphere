const test = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')

const { buildOwnerFilter, hasOwnership } = require('./ownership')

test('buildOwnerFilter scopes queries to the signed-in user', () => {
  const req = { user: { _id: '507f1f77bcf86cd799439011' } }

  assert.deepEqual(buildOwnerFilter(req), { owner: '507f1f77bcf86cd799439011' })
})

test('hasOwnership returns true only for the owner record', () => {
  const req = { user: { _id: '507f1f77bcf86cd799439011' } }
  const ownedRecord = { owner: '507f1f77bcf86cd799439011' }
  const otherRecord = { owner: '507f1f77bcf86cd799439012' }

  assert.equal(hasOwnership(ownedRecord, req), true)
  assert.equal(hasOwnership(otherRecord, req), false)
})

test('buildOwnerFilter normalizes string and ObjectId owner values', () => {
  const req = { user: { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') } }

  assert.deepEqual(buildOwnerFilter(req), { owner: req.user._id })
})
