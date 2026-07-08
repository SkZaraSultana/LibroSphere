const LibrarySettings = require('../models/LibrarySettings')

exports.getForUser = async (req, res, next) => {
  try {
    const settings = await LibrarySettings.findOne({ owner: req.user._id }).lean()
    if (!settings) return res.json({})
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

exports.updateForUser = async (req, res, next) => {
  try {
    const payload = req.body || {}
    const settings = await LibrarySettings.findOneAndUpdate(
      { owner: req.user._id },
      { $set: { ...payload, owner: req.user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json(settings)
  } catch (err) {
    next(err)
  }
}
