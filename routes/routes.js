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
          'Registro de usuario exitoso. Por favor verifica tu correo electrónico para activar tu cuenta.'
      })
    } catch (error) {
      console.error('Error registering user:', error)
      res.status(500).json({
        success: false,
        message: 'Error registering user'
      })
    }
  })


  // Verify email
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


// User login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Ocurrió un error durante el proceso de inicio de sesión' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: info.message || 'Ese usuario no existe'});
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ success: false, message: 'Ocurrió un error durante el proceso de inicio de sesión'});
      }
      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Por favor verifica tu correo electrónico'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso'
      });
    });
  })(req, res, next);
});


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
    const users = await User.findAll();
      const tableHtml = /*html*/`
      <div class="overflow-x-auto">
        <table class="table table-zebra max-w-4xl text-l text-center">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((user) => /*html*/`
              <tr>
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.email}</td>
                <td>
                  <a href="/images/user-images/${user.id}"
                    hx-get="/images/user-images/${user.id}"
                    hx-target="#list-of-users"
                    hx-swap="outerHTML"
                    hx-push-url="true" class="btn btn-xs">Ver documentos</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    res.send(tableHtml);
    } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
    }
});


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


  // Post (Upload) a file within an array of files, max 4 files
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
          (image) => /*html*/`
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


  // Get all images of the logged in user
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
            const deleteIcon = `<img style="margin-left: auto;" onclick="confirmDelete(${image.id})" src="/assets/icons/delete-icon.svg" class="w-6 h-6 cursor-pointer"/>`
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


  // Download a single image from a specific user
  router.get('/images/:imageId', isAuthenticated, async (req, res) => {
    try {
      const imageId = req.params.imageId;

      // Might have to add admin privileges check here, or straight up not allow access to admin-panel.html unless the user is an admin
      const image = await Image.findOne({
        where: {
          id: imageId,
        }
      });

      if (!image) {
        return res.status(404).send('No se han encontrado archivos');
      }

      const imagePath = path.resolve(image.path);
      res.download(imagePath, path.basename(imagePath), (err) => {
        if (err) {
          // Handle error, but do not expose the internal path
          console.error('File download error:', err);
          res.status(500).send('Error processing your download request');
        }
      });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Error fetching images' });
    }
  });


  // Get all images from a specific user
  router.get('/images/user-images/:userId', isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const userEmail = req.user.email;
      const userImages = await Image.findAll({
        where: { userId }
      });

      const userImagesHtml = /*html*/`
        <div class="card bg-base-100 shadow-xl tex-center my-10">
          <div class="card-body">
            <div class="flex justify-between items-center mx-8">
              <h2 class="card-title font-semibold pl-4">Documentos del usuario '${userEmail}'</h2>
              <button id="download-all-files" class="btn btn-primary font-extrabold text-white">
              Descargar todo
              </button>
            </div>
            <div class="divider divider-accent"></div>
            <div class="overflow-x-auto pt-8">
              <table class="table w-full">
              <thead>
                <tr>
                  <th>Archivos</th>
                  <th>Vista Previa</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${userImages.map(image => /*html*/`
                <tr class="hover" id="image-${image.id}">
                  <td>${path.basename(image.path)}</td>
                  <td>
                  <img class="img-thumbnail" src="/${image.path}" alt="Documento ${image.id}">
                  </td>
                  <td>
                  <div class="flex flex-col">
                    <a href="/images/${image.id}" id="download-link" class="btn btn-xs">Descargar</a>
                  </div>
                  </td>
                </tr>
                `).join('')}
              </tbody>
              </table>
            </div>
          </div>
        </div>
        `;

      res.send(userImagesHtml);
    } catch (error) {
      console.error('Error fetching user images:', error);
      res.status(500).json({ error: 'Error fetching user images' });
    }
  });


  // Delete an image
  router.delete('/images/:imageId', isAuthenticated, async (req, res) => {
    try {
      const { imageId } = req.params
      const image = await Image.findByPk(imageId)
      if (!image) {
        return res.status(404).send('No se han encontrado archivos')
      }
      // Delete the image file from the file system
      if (image.path) {
        await fs.promises.unlink(image.path)
      } else {
        console.error('Error: image.path is undefined')
        return res.status(500).send('Error eliminando archivo')
      }
      // Delete the image record from the database
      await image.destroy()
      res.status(204).send('Archivo eliminado exitosamente')
    } catch (error) {
      console.error('Error fetching images:', error)
      res.status(500).json({ error: 'Error fetching images' })
    }
  })


  // Get interest rate
  router.get('/interest-rate', async (req, res) => {
    const interestRate = 0.3027 // Annual interest rate of 30.27% (fixed on the server)
    res.send(interestRate.toString())
  })

  return router
}
