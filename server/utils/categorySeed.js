const defaultCategories = [
  { name: 'Computer Science', description: 'Books on computing and software engineering' },
  { name: 'Artificial Intelligence', description: 'Books on ML, AI, and intelligent systems' },
  { name: 'Programming', description: 'Programming languages and software development' },
  { name: 'Web Development', description: 'Frontend, backend, and full stack web development' },
  { name: 'Data Science', description: 'Data analysis, statistics, and machine learning' },
  { name: 'Electronics & Communication', description: 'Electronics and communication systems' },
  { name: 'Electrical Engineering', description: 'Electrical systems, circuits, and power engineering' },
  { name: 'Mechanical Engineering', description: 'Mechanical design, manufacturing, and systems' },
  { name: 'Civil Engineering', description: 'Construction, structures, and infrastructure' },
  { name: 'Mathematics', description: 'Mathematical concepts and problem-solving' },
  { name: 'Science', description: 'General scientific reference and study' },
  { name: 'Literature', description: 'Literary criticism and written works' },
  { name: 'Fiction', description: 'Fictional stories and novels' },
  { name: 'Non-Fiction', description: 'Informational and factual books' },
  { name: 'History', description: 'Historical works and biographies' },
  { name: 'Reference Books', description: 'Reference material and handbooks' },
  { name: 'Magazines', description: 'Periodical publications and magazines' },
  { name: 'Journals', description: 'Academic and professional journals' },
  { name: 'Self Help', description: 'Personal development and self-improvement' },
  { name: "Children's Books", description: 'Books for children and young readers' },
]

function getDefaultCategories() {
  return defaultCategories.map((category) => ({ ...category }))
}

module.exports = {
  defaultCategories,
  getDefaultCategories,
}
