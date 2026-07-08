const mongoose = require('mongoose')
const config = require('./config')
const User = require('./models/User')
const Book = require('./models/Book')

async function debug() {
  try {
    await mongoose.connect(config.mongoUri)
    const user = await User.findOne({ email: 'iamzarasultana@gmail.com' }).lean()
    console.log('USER', user?._id?.toString())

    const ownerFilter = { owner: user._id }
    const findBooks = await Book.find(ownerFilter).lean()
    console.log('find count', findBooks.length)
    findBooks.forEach((book) => {
      console.log('find book', {
        id: book._id.toString(),
        title: book.title,
        owner: book.owner?.toString(),
        category: book.category,
        copies: book.copies,
      })
    })

    const pipeline = [
      { $match: ownerFilter },
      {
        $lookup: {
          from: 'loans',
          let: { bookId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$book', '$$bookId'] }, { $eq: ['$returnedAt', null] }] } } },
            { $count: 'count' },
          ],
          as: 'activeLoanCount',
        },
      },
      { $addFields: { activeLoanCount: { $ifNull: [{ $arrayElemAt: ['$activeLoanCount.count', 0] }, 0] } } },
      { $addFields: { availableCopies: { $max: [{ $subtract: ['$copies', '$activeLoanCount'] }, 0] } } },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ['$availableCopies', 0] }, then: 'Out of Stock' },
                { case: { $lte: ['$availableCopies', 1] }, then: 'Low Stock' },
              ],
              default: 'Available',
            },
          },
        },
      },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $facet: { metadata: [{ $count: 'totalCount' }], data: [{ $skip: 0 }, { $limit: 10 }] } },
    ]

    const agg = await Book.aggregate(pipeline)
    console.log('aggregate count', agg[0]?.metadata?.[0]?.totalCount, 'data length', agg[0]?.data?.length)
    console.log('aggregate', JSON.stringify(agg, null, 2))
    await mongoose.disconnect()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

debug()
