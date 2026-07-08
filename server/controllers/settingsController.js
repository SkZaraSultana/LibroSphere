const Settings = require('../models/Settings')

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne().lean()
    res.json(settings || {})
  } catch (err) {
    next(err)
  }
}

exports.updateSettings = async (req, res, next) => {
  try {
    const payload = req.body || {}
    const settings = await Settings.findOneAndUpdate({}, payload, { new: true, upsert: true, setDefaultsOnInsert: true })
    res.json(settings)
  } catch (err) {
    next(err)
  }
}
