const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
app.use(express.urlencoded({ extended: true })) // To parse the incoming requests with urlencoded payloads
app.use(express.static('public')) // To serve static files
app.use(express.json()) // To parse the incoming requests with JSON payloads

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

const routes = require('./routes/routes.js')(User)

app.use('/', routes)

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
