const test = require('node:test')
const assert = require('node:assert/strict')

const { getDefaultCategories } = require('./categorySeed')

test('default category definitions include the full professional library category set', () => {
  const categories = getDefaultCategories()

  assert.equal(categories.length, 20)
  assert.deepEqual(
    categories.map((category) => category.name),
    [
      'Computer Science',
      'Artificial Intelligence',
      'Programming',
      'Web Development',
      'Data Science',
      'Electronics & Communication',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Mathematics',
      'Science',
      'Literature',
      'Fiction',
      'Non-Fiction',
      'History',
      'Reference Books',
      'Magazines',
      'Journals',
      'Self Help',
      "Children's Books",
    ]
  )
})
