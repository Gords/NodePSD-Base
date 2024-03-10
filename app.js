const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log, // Enable logging of SQL queries
  });

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  User.create({ email, password })
    .then(() => {
      res.send('User registered successfully');
    })
    .catch((error) => {
      console.error('Error registering user:', error);
      res.status(500).send('Error registering user');
    });
});

sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });