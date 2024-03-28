const express = require('express')
const router = express.Router()
const multer = require('multer')
const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const emailService = require('../services/emailService')
const path = require('path')
const fs = require('fs')

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage })

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error', 'Please log in to access this page.')
  res.redirect('/login')
}

module.exports = (User, Image) => {
  // User registration
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await User.create({ email, password: hashedPassword, name, isVerified: false })

      // Generate verification token
      const verificationToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken)

      req.flash('success', 'User registered successfully. Please check your email to verify your account.')
      res.json({ 'register-flash-messages': { success: '<div class="alert alert-success">User registered successfully. Please check your email to verify your account.</div>' } })
    } catch (error) {
      console.error('Error registering user:', error)
      req.flash('error', 'Error registering user')
      res.status(500).json({ 'register-flash-messages': { error: '<div class="alert alert-error">Error registering user</div>' } })
    }
  })

  // verify email
  router.get('/verify-email', async (req, res) => {
    const { token } = req.query

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const userId = decoded.userId

      const user = await User.findByPk(userId)
      if (!user) {
        req.flash('error', 'Invalid verification token')
        return res.redirect('/login')
      }

      user.isVerified = true
      await user.save()

      req.flash('success', 'Email verified successfully. You can now log in.')
      res.redirect('/?message=Email verified successfully. You can now log in.')
    } catch (error) {
      console.error('Error verifying email:', error)
      req.flash('error', 'Invalid verification token')
      res.redirect('/login')
    }
  })

  // User login
  router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), (req, res) => {
    const user = req.user
    if (!user.isVerified) {
      req.flash('error', 'Please verify your email before logging in.')
      return res.json({
        'login-flash-messages': {
          error: '<div class="alert alert-error">Please verify your email before logging in.</div>'
        }
      })
    }

    req.flash('success', 'Login successful')
    res.json({
      'login-flash-messages': {
        success: '<div class="alert alert-success">Login successful</div>'
      },
      'main-content': 'index.html',
      user: {
        name: user.name,
        email: user.email
      }
    })
  })

  // Get login form section
  router.get('/login', (req, res) => {
    const loginHtmlPath = path.join(__dirname, '..', 'public', 'components.html')
    fs.readFile(loginHtmlPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        res.status(500).send('Internal Server Error')
      } else {
        const loginFormSectionRegex = /<div id="login-form-section">([\s\S]*?)<\/div>/
        const match = data.match(loginFormSectionRegex)

        if (match && match.length > 1) {
          const loginFormSection = match[1]
          res.json({ 'login-form-section': loginFormSection })
        } else {
          res.status(404).send('Login form section not found')
        }
      }
    })
  })

  // Get a single user
  router.get('/check-login', (req, res) => {
    if (req.isAuthenticated()) {
      return res.json({
        name: req.user.name,
        email: req.user.email
      })
    } else {
      res.status(401).json({ error: 'Not logged in' })
    }
  })

  // Get all users
  router.get('/users', isAuthenticated, async (req, res) => {
    try {
      const users = await User.findAll()
      const usersHtml = users.map(user => `
        <div id="user-item-${user.id}">
          <p>ID: ${user.id}</p>
          <p>Name: ${user.name}</p>
          <p>Email: ${user.email}</p>
          <button hx-delete="/users/${user.id}" hx-target="#user-item-${user.id}" hx-swap="outerHTML">Delete</button>
        </div>
      `).join('')
      res.send(`<div id="user-list">${usersHtml}</div>`)
    } catch (error) {
      console.error('Error fetching users:', error)
      req.flash('error', 'Error fetching users')
      res.redirect('/')
    }
  })

  // Update a user
  router.put('/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { email, password, name } = req.body
      await User.update({ email, password, name }, { where: { id: req.params.id } })
      req.flash('success', 'User updated successfully')
      res.redirect('/users')
    } catch (error) {
      console.error('Error updating user:', error)
      req.flash('error', 'Error updating user')
      res.status(500).redirect(`/users/${req.params.id}`)
    }
  })

  // Delete a user
  router.delete('/users/:id', isAuthenticated, async (req, res) => {
    try {
      await User.destroy({ where: { id: req.params.id } })
      req.flash('success', 'User deleted successfully')
      res.sendStatus(204)
    } catch (error) {
      console.error('Error deleting user:', error)
      req.flash('error', 'Error deleting user')
      res.status(500).send('Error deleting user')
    }
  })

  // Upload an image
router.post('/images', isAuthenticated, upload.array('files', 4), async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const uploadResults = [];

    // Process each file
    for (const file of req.files) {
      const imagePath = file.path;

      // Save the image file to the file system
      const savedImagePath = path.join('uploads', file.filename)
      await fs.promises.rename(imagePath, savedImagePath)

      // Save the image record to the database
      const image = await Image.create({
        userId,
        path: savedImagePath
      });

      uploadResults.push({
        originalName: file.originalname,
        savedPath: savedImagePath,
        imageId: image.id // Assuming your Image.create() returns an object with an id
      });
    }

    req.flash('success', 'Images uploaded successfully');
    res.json({ message: 'Images uploaded successfully', uploadResults });
  } catch (error) {
    console.error('Error saving images:', error);
    req.flash('error', 'Error saving images');
    res.status(500).json({ error: 'Error processing your request' });
  }
});

  // Get all images
  router.get('/images', isAuthenticated, async (req, res) => {
    try {
      const images = await Image.findAll()
      const imagesHtml = images.map(image => `
        <div>
          <p>Image ID: ${image.id}</p>
          <p>User ID: ${image.userId}</p>
          <img src="${image.path}" alt="Image ${image.id}">
        </div>
      `).join('')
      res.send(`
        <div id="image-list">
          ${imagesHtml}
        </div>
      `)
    } catch (error) {
      console.error('Error fetching images:', error)
      req.flash('error', 'Error fetching images')
      res.status(500).redirect('/')
    }
  })

  // Get all images for the currently authenticated user
  router.get('/images/user-images', isAuthenticated, async (req, res) => {
    try {
      const images = await Image.findAll({ where: { userId: req.user.id } })
      const imageDetails = images.map(image => ({
        id: image.id,
        userId: image.userId,
        fileName: path.basename(image.path)
      }))
      res.json(imageDetails)
    } catch (error) {
      console.error('Error fetching user images:', error)
      res.status(500).json([{ error: 'Error fetching user images' }])
    }
  })

  return router
}
