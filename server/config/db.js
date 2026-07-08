const mongoose = require('mongoose')
const config = require('./index')
const Category = require('../models/Category')
const { getDefaultCategories } = require('../utils/categorySeed')

async function seedDefaultCategories() {
  const categoryCount = await Category.countDocuments()
  if (categoryCount > 0) return

  await Category.insertMany(getDefaultCategories())
  console.log('Seeded default categories')
}

module.exports = async function connect() {
  await mongoose.connect(config.mongoUri)
  console.log('Connected to MongoDB')
  await seedDefaultCategories()
}
