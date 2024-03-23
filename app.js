// Server setup and database connection

// Import dependencies
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const dotenv = require('dotenv')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')

dotenv.config()

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'))

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Configure Passport Local Strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Find the user in the database based on the provided username
      const user = await User.findOne({ where: { email: username } })

      if (!user) {
        // If the user doesn't exist, return an error
        return done(null, false, { message: 'Incorrect username' })
      }

      // Compare the provided password with the stored password
      if (user.password !== password) {
        // If the passwords don't match, return an error
        return done(null, false, { message: 'Incorrect password' })
      }

      // If the username and password are correct, return the user
      return done(null, user)
    } catch (error) {
      return done(error)
    }
  }
))

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
)

const User = require('./models/User.js')(sequelize, DataTypes)
const Image = require('./models/Image.js')(sequelize, DataTypes)

const routes = require('./routes/routes.js')(User, Image)
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