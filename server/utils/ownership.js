function getCurrentUserId(req) {
  if (!req?.user) return null
  if (req.user._id && typeof req.user._id === 'object' && req.user._id.toString) {
    return req.user._id
  }
  return req.user._id?.toString() || req.user.id?.toString() || null
}

function buildOwnerFilter(req) {
  const ownerId = getCurrentUserId(req)
  return ownerId ? { owner: ownerId } : {}
}

function hasOwnership(record, req) {
  const ownerId = getCurrentUserId(req)
  if (!ownerId || !record) return false
  return record.owner?.toString() === ownerId?.toString()
}

async function findOwnedRecord(Model, id, req, extraQuery = {}) {
  const ownerId = getCurrentUserId(req)
  if (!ownerId) return { record: null, forbidden: false }

  const record = await Model.findOne({ _id: id, owner: ownerId, ...extraQuery })
  if (record) return { record, forbidden: false }

  const existing = await Model.findById(id)
  if (existing) return { record: null, forbidden: true }

  return { record: null, forbidden: false }
}

module.exports = {
  getCurrentUserId,
  buildOwnerFilter,
  hasOwnership,
  findOwnedRecord,
}
