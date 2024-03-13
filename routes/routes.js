// Routes for the Application

const express = require('express')
const router = express.Router()
const multer = require('multer')

// Configure Multer to store files in 'uploads/' directory and keep the original file name + a unique suffix
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // You must create the 'uploads/' directory before running the app
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage })

// Define supported file formats
// const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff']

// Home route
router.get('/home', (req, res) => {
  res.send(`
    <h1>Welcome to the home page!</h1>
    <p>This is the home page. You can navigate to this page from other pages on the website.</p>
  `)
})

module.exports = (User, Image) => {
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
          <p>ID: ${user.id}</p>
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

  // PUT Request - Update a user
  router.put('/update/:id', (req, res) => {
    const { email, password, name } = req.body
    User.update({ email, password, name }, { where: { id: req.params.id } })
      .then(() => {
        res.send('User updated successfully')
      })
      .catch((error) => {
        console.error('Error updating user:', error)
        res.status(500).send('Error updating user')
      })
  })

  // DELETE Request - Delete a user
  router.delete('/delete/:id', (req, res) => {
    User.destroy({
      where: { id: req.params.id }
    })
      .then(() => {
        res.send('User deleted successfully')
      })
      .catch((error) => {
        console.error('Error deleting user:', error)
        res.status(500).send('Error deleting user')
      })
  })

  // POST Request - Upload an image
  router.post('/files/upload', upload.single('file'), (req, res) => {
  // Assuming the user ID is stored in req.userId
    const userId = req.body.userId

    // Create a new image record in the database
    Image.create({
      userId,
      path: req.file.path
    })
      .then((image) => {
        // Send the image details back to the client
        res.json(image)
      })
      .catch((error) => {
        console.error('Error saving image:', error)
        res.status(500).send('Error saving image')
      })
  })

  return router
}
