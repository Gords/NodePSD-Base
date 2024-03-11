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

  // GET Request - Fetch all users
  router.get('/users', (req, res) => {
    User.findAll()
      .then((users) => {
        const usersHtml = users
          .map(
            (user) => `
        <div class="user">
          <p>Name: ${user.name}</p>
          <p>Email: ${user.email}</p>
        </div>
      `
          )
          .join('')
        res.send(`<div>${usersHtml}</div>`)
      })
      .catch((error) => {
        console.error('Error fetching users:', error)
        res.status(500).send('Error fetching users')
      })
  })

  return router
}
