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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage })

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ error: 'Please log in to access this page.' })
}

module.exports = (User, Image) => {
  // User registration
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        isVerified: false
      })

      // Generate verification token
      const verificationToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken)

      console.log('User registered successfully:', user.email)
      res.status(200).json({
        success: true,
        message:
          'Registration successful. Please check your email for verification instructions.'
      })
    } catch (error) {
      console.error('Error registering user:', error)
      res.status(500).json({
        success: false,
        message: 'Error registering user'
      })
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
        return res.status(400).json({ error: 'Invalid verification token' })
      }

      user.isVerified = true
      await user.save()

      res.redirect('/?message=Email verified successfully. You can now log in.')
    } catch (error) {
      console.error('Error verifying email:', error)
      res.status(400).json({ error: 'Invalid verification token' })
    }
  })

  router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login'
  }), (req, res) => {
    const user = req.user
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Login successful'
    })
  })

  // Get login form section
  router.get('/login', (req, res) => {
    const loginHtmlPath = path.join(
      __dirname,
      '..',
      'public',
      'components.html'
    )
    fs.readFile(loginHtmlPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        res.status(500).send('Internal Server Error')
      } else {
        // login form section not found error can be fixed by renaming id to just "login-form"
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
      const usersHtml = users
        .map(
          (user) => `
        <div id="user-item-${user.id}">
          <p>ID: ${user.id}</p>
          <p>Name: ${user.name}</p>
          <p>Email: ${user.email}</p>
          <button hx-delete="/users/${user.id}" hx-target="#user-item-${user.id}" hx-swap="outerHTML">Delete</button>
        </div>
      `
        )
        .join('')
      res.send(`<div id="user-list">${usersHtml}</div>`)
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({ error: 'Error fetching users' })
    }
  })

  // Update a user
  router.put('/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { email, password, name } = req.body
      await User.update(
        { email, password, name },
        { where: { id: req.params.id } }
      )
      res.json({ message: 'User updated successfully' })
    } catch (error) {
      console.error('Error updating user:', error)
      res.status(500).json({ error: 'Error updating user' })
    }
  })

  // Delete a user
  router.delete('/users/:id', isAuthenticated, async (req, res) => {
    try {
      await User.destroy({ where: { id: req.params.id } })
      res.sendStatus(204)
    } catch (error) {
      console.error('Error deleting user:', error)
      res.status(500).json({ error: 'Error deleting user' })
    }
  })

  // Upload an image within an array of files, max 4 files
  router.post('/images', isAuthenticated, upload.array('files', 4), async (req, res) => {
    try {
      const userId = req.user.id

      // Check if there are files to process
      if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.')
      }

      const fileProcessingPromises = req.files.map(async (file) => {
        const imagePath = file.path
        const savedImagePath = path.join('uploads', file.filename)

        try {
          await fs.promises.rename(imagePath, savedImagePath)
        } catch (error) {
          console.error('Error moving file:', error)
          throw new Error('Error processing file')
        }

        // Save the image record to the database
        const image = await Image.create({
          userId,
          path: savedImagePath
        })
      })

      await Promise.all(fileProcessingPromises)

      res.header('HX-Redirect', '/images/user-images')
    } catch (error) {
      console.error('Error uploading files:', error)
      res.status(500).send('Error processing your request')
    }
  })

  // Get all images
  router.get('/images', isAuthenticated, async (req, res) => {
    try {
      const images = await Image.findAll()
      const imagesHtml = images
        .map(
          (image) => `
        <div>
          <p>Image ID: ${image.id}</p>
          <p>User ID: ${image.userId}</p>
          <img src="${image.path}" alt="Image ${image.id}">
        </div>
      `
        )
        .join('')
      res.send(`
        <div id="image-list">
          ${imagesHtml}
        </div>
      `)
    } catch (error) {
      console.error('Error fetching images:', error)
      res.status(500).json({ error: 'Error fetching images' })
    }
  })

  // Get all images for the currently authenticated user
  router.get('/images/user-images', isAuthenticated, async (req, res) => {
    try {
      const images = await Image.findAll({ where: { userId: req.user.id } })
      let imagesHTML = ''

      if (images.length === 0) {
        imagesHTML = '<li>No files found</li>'
      } else {
        images.forEach((image) => {
          // Check if image.path is not null
          // Add "X" icon to delete an image
          if (image.path) {
            const deleteIcon = `<svg style="margin-left: auto;" onclick="confirmDelete(${image.id})" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 cursor-pointer"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
            imagesHTML += `<li class="flex justify-between text-center items-center py-2">${path.basename(image.path)} ${deleteIcon}</li>`
          }
        })
      }
      res.send(`<ul>${imagesHTML}</ul>`)
    } catch (error) {
      console.error('Error fetching user images:', error)
      res.status(500).send('Error fetching user images')
    }
  })

  // Delete an image
  router.delete('/images/:imageId', isAuthenticated, async (req, res) => {
    try {
      const { imageId } = req.params
      const image = await Image.findByPk(imageId)
      if (!image) {
        return res.status(404).send('Image not found')
      }
      // Delete the image file from the file system
      if (image.path) {
        await fs.promises.unlink(image.path)
      } else {
        console.error('Error: image.path is undefined')
        return res.status(500).send('Error deleting image file')
      }
      // Delete the image record from the database
      await image.destroy()
      res.status(204).send('Image deleted successfully')
    } catch (error) {
      console.error('Error fetching images:', error)
      res.status(500).json({ error: 'Error fetching images' })
    }
  })

  return router
}
