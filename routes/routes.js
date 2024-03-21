// Routes for the Application

const express = require('express')
const router = express.Router()
const multer = require('multer')

// Configure Multer to store files in '/uploads/' directory and keep the original file name + a unique suffix
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // You must create the 'uploads/' directory before running the app
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage })

// Define supported file formats
// const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff']

// Routes that use the User and Image models

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

  // Login a user
  router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
      const user = await User.findOne({ where: { email, password } })
      if (user) {
        res.send(`
          <p> Login successful</p>
          <script>
            localStorage.setItem('loggedIn', 'true');
            setTimeout(function() {
              window.location.href = '/'; // Redirect to home or another page
            }, 2000); // Delay of 2 seconds
          </script>
          `)
      } else {
        res.send('<p>Invalid email or password</p>').status(401)
      }
    } catch (error) {
      console.error('Error during login:', error)
      res.status(500).send('<p>An error occurred during login</p>')
    }
  })

  // Fetch all users
  router.get('/users', (req, res) => {
    User.findAll()
      .then((users) => {
        const usersHtml = users.map(user => `
        <div id="user-item-${user.id}">
          <p>ID: ${user.id}</p>
          <p>Name: ${user.name}</p>
          <p>Email: ${user.email}</p>
          <button hx-delete="/delete/${user.id}" hx-target="#user-item-${user.id}" hx-swap="outerHTML">Delete</button>
        </div>
        `).join('')
        // Add id to the div element for specific targeting
        res.send(`<div id="user-list">${usersHtml}</div>`)
      })
      .catch((error) => {
        console.error('Error fetching users:', error)
        res.status(500).send('Error fetching users')
      })
  })

  // Update a user
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

  // Delete a user
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

  /* --- FILE UPLOAD ROUTES --- */

  // Upload an image
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

  // TODO here if I refresh, the navbar dissapears and the image is loaded full sized D:
  // GET Request - Fetch all images
  router.get('/images', (req, res) => {
    Image.findAll()
      .then((images) => {
        const imagesHtml = images.map(image => `
        <div>
          <p>Image ID: ${image.id}</p>
          <p>User ID: ${image.userId}</p>
          <img src="${image.path}" alt="Image ${image.id}">
        </div>
      `).join('')
        res.send(`<div id="image-list">${imagesHtml}</div>`)
      })
      .catch((error) => {
        console.error('Error fetching images:', error)
        res.status(500).send('Error fetching images')
      })
  })

  return router
}
