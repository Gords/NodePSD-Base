// Routes for the Application

const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path') // Required to serve the full HTML page

// Configure Multer to store files in 'uploads/' directory and keep the original file name + a unique suffix
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

// Home route
// router.get('/home', (req, res) => {
//   // Serve the HTML whether it's an htmx request or not
//   res.sendFile(path.join(__dirname, '../public/home.html'))
// })

// TODO en este ejemplo, si hago refresh la pagina, puedo volver a servir el html completo
router.get('/home', (req, res) => {
  const isHtmxRequest = req.headers['hx-request']
  if (isHtmxRequest) {
    res.sendFile(path.join(__dirname, '../public/home.html'))
  } else {
    // Serve the full HTML page on refresh (depends on declaring "const path = require('path')" at the top of the file)
    res.sendFile(path.join(__dirname, '../public/index.html'))
  }
})

// About route
router.get('/about', (req, res) => {
  // Serve the HTML whether it's an htmx request or not
  res.sendFile(path.join(__dirname, '../public/about.html'))
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

  // GET Request - Fetch registration form
  router.get('/register', (req, res) => {
    res.send(`
    <h1 class="text-2xl font-bold mb-4">Register</h1>
    <form class="flex flex-col" hx-post="/register" hx-target="#main-content">
      <label for="email" class="mb-2">Email:</label>
      <input type="email" id="email" name="email" required class="border border-gray-300 rounded-md px-2 py-1 mb-2">
      <label for="password" class="mb-2">Password:</label>
      <input type="password" id="password" name="password" required class="border border-gray-300 rounded-md px-2 py-1 mb-2">
      <label for="name" class="mb-2">Name:</label>
      <input type="text" id="name" name="name" required class="border border-gray-300 rounded-md px-2 py-1 mb-2">
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md">Register</button>
    </form>
    `)
  })

  // GET Request - Fetch login form
  router.get('/login', (req, res) => {
    res.send(`
    <h1 class="text-2xl font-bold mb-4">Login</h1>
    <form class="flex flex-col" hx-post="/login" hx-target="#main-content">
      <label for="email" class="mb-2">Email:</label>
      <input type="email" id="email" name="email" required class="border border-gray-300 rounded-md px-2 py-1 mb-2">
      <label for="password" class="mb-2">Password:</label>
      <input type="password" id="password" name="password" required class="border border-gray-300 rounded-md px-2 py-1 mb-2">
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md">Login</button>
    </form>
    `)
  })

  // POST Request - Login a user
  router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
      const user = await User.findOne({ where: { email, password } })
      if (user) {
        res.send(`
          <p> Login successful</p>
          <script>
            localStorage.setItem('loggedIn', 'true');
            window.location.href = '/'; // Redirect to home or another page
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

  // GET Request - Fetch all users
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

  /* --- USER FILES ROUTES --- */

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

  // TODO here if I refresh, the navbar dissapears and the image is loaded full sized D:
  // GET Request - Fetch all images
  router.get('/images', (req, res) => {
    Image.findAll()
      .then((images) => {
        const imagesHtml = images.map(image => `
        <div>
          <p>Image ID: ${image.id}</p>
          <p>User ID: ${image.userId}</p>
          <img class="thumbnail" src="${image.path}" alt="Image ${image.id}">
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
