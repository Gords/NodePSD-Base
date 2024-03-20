// Server setup and database connection

// Import dependencies
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Middleware for parsing requests
app.use(express.urlencoded({ extended: true })) // Parse the incoming requests with urlencoded payloads
app.use(express.json()) // Parse the incoming requests with JSON payloads

// Middleware for serving static files
app.use(express.static('public'))
// TODO: no se si hacer surface el uploads es necesario mas adelante?
app.use('/uploads', express.static('uploads')) // Serve the uploaded images

// Initialize Sequelize and import models
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log // Enable logging of SQL queries
  }
)
const User = require('./models/User.js')(sequelize, DataTypes)
const Image = require('./models/Image.js')(sequelize, DataTypes)

// Import and use routes
const routes = require('./routes/routes.js')(User, Image)
app.use('/', routes)

// Connect to the database and start the server
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.')
    app.listen(3000, () => {
      console.log('Server is running on port 3000')
    })
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error)
  })
