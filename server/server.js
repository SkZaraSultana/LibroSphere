const http = require('http')
const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config')

const PORT = process.env.PORT || config.port || 5000

async function start() {
  try {
    await require('./config/db')()
    const server = http.createServer(app)
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()
