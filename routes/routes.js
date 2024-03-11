module.exports = (User) => {
  const express = require('express')
  const router = express.Router()

  // POST Request - Create a new user
  router.post('/register', (req, res) => {
    const { email, password, name } = req.body
    User.create({ email, password, name })
      .then(() => {
        res.send('User registered successfully')
      })
      .catch((error) => {
        console.error('Error registering user:', error)
        res.status(500).send('Error registering user')
      })
  })

  return router
}
